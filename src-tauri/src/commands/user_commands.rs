use tauri::State;
use crate::data::database::DbState;
use crate::data::models::User;
use crate::data::repository;
use crate::utils::errors::AppError;

#[tauri::command]
pub fn is_vault_initialized(app: tauri::AppHandle) -> Result<bool, AppError> {
    let db_path = crate::data::database::resolve_db_path(&app);
    Ok(db_path.exists())
}

#[tauri::command]
pub fn is_vault_locked(state: State<'_, DbState>) -> Result<bool, AppError> {
    let guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    Ok(guard.is_none())
}

#[tauri::command]
pub fn unlock_vault(
    password: String,
    app: tauri::AppHandle,
    state: State<'_, DbState>,
) -> Result<bool, AppError> {
    let db_path = crate::data::database::resolve_db_path(&app);
    let derived_user_key = format!(
        "x'{}'",
        hex::encode(crate::security::key_derivation::derive_key_from_password(&password))
    );
    
    // Attempt to open DB with the derived user key
    let conn = crate::data::database::try_open_or_restore(&db_path, &derived_user_key)
        .map_err(|err| AppError::Vault(format!("DECRYPTION_FAILED: Invalid decryption key or corrupted database: {}", err)))?;
        
    let mut guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    *guard = Some(conn);
    
    Ok(true)
}

#[tauri::command]
pub fn lock_vault(
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<(), AppError> {
    let mut guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    *guard = None;

    let mut active_guard = active_user_state.0.lock().map_err(|e| AppError::Lock(format!("Active user lock failed: {}", e)))?;
    *active_guard = None;

    Ok(())
}

#[tauri::command]
pub fn get_all_users(state: State<'_, DbState>) -> Result<Vec<User>, AppError> {
    let guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;
    repository::get_all_users(conn).map_err(AppError::Database)
}

#[tauri::command]
pub fn authenticate_user(
    username: String,
    password: String,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<User, AppError> {
    let guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;

    // 1. Fetch user status and login/lockout details
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, role, full_name, designation, organization, public_key, is_active, created_at, updated_at, failed_login_attempts, locked_until 
         FROM users WHERE username = ?1"
    ).map_err(AppError::Database)?;

    struct DbUser {
        user: User,
        failed_attempts: i32,
        locked_until: Option<String>,
        stored_hash: String,
    }

    let db_user = stmt.query_row(rusqlite::params![username], |row| {
        let stored_hash: String = row.get(2)?;
        Ok(DbUser {
            user: User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: "".to_string(), // don't expose to frontend
                role: row.get(3)?,
                full_name: row.get(4)?,
                designation: row.get(5)?,
                organization: row.get(6)?,
                public_key: row.get(7)?,
                is_active: row.get::<_, i32>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            },
            failed_attempts: row.get(11)?,
            locked_until: row.get(12)?,
            stored_hash,
        })
    }).map_err(|_| AppError::Auth("User not found".to_string()))?;

    if !db_user.user.is_active {
        return Err(AppError::Auth("Account is deactivated".to_string()));
    }

    let now_str = crate::core::time_authority::current_timestamp_iso8601();

    // 2. Check if locked out
    if let Some(ref locked_until) = db_user.locked_until {
        if locked_until > &now_str {
            return Err(AppError::Auth(format!("ACCOUNT_LOCKED|{}", locked_until)));
        }
    }

    // 3. Verify password using Argon2id with backward compatibility for mock hashes
    let is_valid = if db_user.stored_hash == "pbkdf2_sha256_mock_hash" {
        // Upgrade mock hash to Argon2id if password equals username
        if password == username {
            if let Ok(new_hash) = crate::security::password::hash_password(&password) {
                let _ = conn.execute(
                    "UPDATE users SET password_hash = ?1 WHERE username = ?2",
                    rusqlite::params![new_hash, username],
                );
            }
            true
        } else {
            false
        }
    } else {
        crate::security::password::verify_password(&password, &db_user.stored_hash)
    };

    if is_valid {
        // Reset failed attempts
        conn.execute(
            "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE username = ?1",
            rusqlite::params![username],
        ).map_err(AppError::Database)?;

        // Append to audit log
        repository::append_audit_log(
            conn,
            "LOGIN_SUCCESS",
            "USER",
            &db_user.user.id,
            &db_user.user.username,
            Some("User logged in successfully"),
        ).unwrap_or(());

        // Update ActiveUser state
        let mut active_guard = active_user_state.0.lock().map_err(|e| AppError::Lock(format!("Active user lock failed: {}", e)))?;
        *active_guard = Some(db_user.user.clone());

        Ok(db_user.user)
    } else {
        let new_attempts = db_user.failed_attempts + 1;
        if new_attempts >= 5 {
            // Lock out for 30 minutes
            let locked_until_dt = crate::core::time_authority::now_ist() + chrono::Duration::minutes(30);
            let locked_until_str = locked_until_dt.format("%Y-%m-%dT%H:%M:%S+05:30").to_string();

            conn.execute(
                "UPDATE users SET failed_login_attempts = ?1, locked_until = ?2 WHERE username = ?3",
                rusqlite::params![new_attempts, locked_until_str, username],
            ).map_err(AppError::Database)?;

            // Append to audit log
            repository::append_audit_log(
                conn,
                "USER_LOCKED_OUT",
                "USER",
                &db_user.user.id,
                &db_user.user.username,
                Some("User locked out due to 5 failed attempts"),
            ).unwrap_or(());

            Err(AppError::Auth(format!("ACCOUNT_LOCKED|{}", locked_until_str)))
        } else {
            conn.execute(
                "UPDATE users SET failed_login_attempts = ?1 WHERE username = ?2",
                rusqlite::params![new_attempts, username],
            ).map_err(AppError::Database)?;

            Err(AppError::Auth(format!("INVALID_CREDENTIALS|{}", 5 - new_attempts)))
        }
    }
}

#[tauri::command]
pub fn reset_database(
    app: tauri::AppHandle,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<(), AppError> {
    // Enforce Role-Based Access Control (RBAC) - restricted to ADMIN
    {
        let active_guard = active_user_state.0.lock().map_err(|e| AppError::Lock(format!("Active user lock failed: {}", e)))?;
        if let Some(ref user) = *active_guard {
            if user.role != "ADMIN" {
                // Log unauthorized access attempt if DB is decrypted
                let db_guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
                if let Some(conn) = db_guard.as_ref() {
                    let _ = repository::append_audit_log(
                        conn,
                        "UNAUTHORIZED_ACCESS_ATTEMPT",
                        "DATABASE",
                        "SYSTEM",
                        &user.username,
                        Some("Unauthorized attempt to reset database"),
                    );
                }
                return Err(AppError::Unauthorized("UNAUTHORIZED_ACCESS".to_string()));
            }
        } else {
            return Err(AppError::Unauthorized("UNAUTHORIZED_ACCESS".to_string()));
        }
    }

    // 1. Lock the database connection first by setting DbState to None
    {
        let mut guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
        *guard = None;
    }
    
    // 2. Resolve database path
    let db_path = crate::data::database::resolve_db_path(&app);
    
    // 3. Delete database file and associated WAL/SHM files
    if db_path.exists() {
        std::fs::remove_file(&db_path).map_err(AppError::Io)?;
    }
    let wal_path = db_path.with_extension("db-wal");
    if wal_path.exists() {
        let _ = std::fs::remove_file(&wal_path);
    }
    let shm_path = db_path.with_extension("db-shm");
    if shm_path.exists() {
        let _ = std::fs::remove_file(&shm_path);
    }

    // 4. Clear any files in the evidence vault
    let vault_dir = crate::core::vault_manager::prepare_vault_dir(&app).ok();
    if let Some(dir) = vault_dir {
        if dir.exists() {
            let _ = std::fs::remove_dir_all(&dir);
        }
    }

    // 5. Clear any PIN vault key file
    let pin_vault_path = if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            exe_dir.join("pin_vault.key")
        } else {
            std::path::PathBuf::from("pin_vault.key")
        }
    } else {
        std::path::PathBuf::from("pin_vault.key")
    };
    if pin_vault_path.exists() {
        let _ = std::fs::remove_file(pin_vault_path);
    }

    log::info!("Database successfully reset. Vault remains locked and uninitialized.");
    Ok(())
}
