use tauri::State;
use crate::data::database::DbState;
use crate::data::models::User;
use crate::commands::user_commands::unlock_vault;
use sha2::Digest;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct SessionInitResponse {
    pub session_id: String,
    pub user: User,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct SystemHealthEntry {
    pub id: String,
    pub event_type: String,
    pub details: Option<String>,
    pub timestamp: String,
}

pub fn resolve_pin_vault_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    let mut db_path = crate::data::database::resolve_db_path(app);
    db_path.set_file_name("pin_vault.enc");
    db_path
}

fn append_session_event(
    conn: &rusqlite::Connection,
    session_id: &str,
    event_type: &str,
    entity_type: Option<&str>,
    entity_id: Option<&str>,
    actor: &str,
    details: Option<&str>,
) -> Result<String, rusqlite::Error> {
    // Retrieve the previous event's entry_hash in this session
    let prev_hash: String = conn.query_row(
        "SELECT entry_hash FROM session_events WHERE session_id = ?1 ORDER BY timestamp DESC, id DESC LIMIT 1",
        rusqlite::params![session_id],
        |row| row.get(0)
    ).unwrap_or_else(|_| "0000000000000000000000000000000000000000000000000000000000000000".to_string());

    let details_str = details.unwrap_or("");
    let ent_type = entity_type.unwrap_or("");
    let ent_id = entity_id.unwrap_or("");

    let entry_hash = crate::core::merkle_tree::compute_entry_hash(
        &prev_hash,
        event_type,
        ent_type,
        ent_id,
        actor,
        details_str
    );

    let event_id = uuid::Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO session_events (id, session_id, event_type, entity_type, entity_id, details, prev_hash, entry_hash)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            event_id,
            session_id,
            event_type,
            entity_type,
            entity_id,
            details,
            prev_hash,
            entry_hash
        ],
    )?;

    Ok(entry_hash)
}

fn complete_session_init(
    user_id: &str,
    conn: &rusqlite::Connection,
    active_user_state: &State<'_, crate::ActiveUser>,
    device_fingerprint: &str,
    camera_snapshot: &Option<String>,
    audio_sample: &Option<String>,
) -> Result<SessionInitResponse, String> {
    // Retrieve User model for active state
    let user = conn.query_row(
        "SELECT id, username, password_hash, role, full_name, designation, organization 
         FROM users WHERE id = ?1",
        rusqlite::params![user_id],
        |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: "".to_string(),
                role: row.get(3)?,
                full_name: row.get(4)?,
                designation: row.get(5)?,
                organization: row.get(6)?,
                public_key: None,
                is_active: true,
                created_at: "".to_string(),
                updated_at: "".to_string(),
            })
        }
    ).map_err(|e| format!("Failed to retrieve user info: {}", e))?;

    let session_id = uuid::Uuid::new_v4().to_string();

    // Compute hashes
    let cam_hash = camera_snapshot.as_ref().map(|s| {
        let mut hasher = sha2::Sha256::new();
        hasher.update(s.as_bytes());
        format!("{:x}", hasher.finalize())
    });

    let audio_hash = audio_sample.as_ref().map(|s| {
        let mut hasher = sha2::Sha256::new();
        hasher.update(s.as_bytes());
        format!("{:x}", hasher.finalize())
    });

    // Insert session
    conn.execute(
        "INSERT INTO sessions (id, officer_id, device_fingerprint, camera_snapshot_hash, audio_sample_hash)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![
            session_id,
            user.id,
            device_fingerprint,
            cam_hash,
            audio_hash
        ],
    ).map_err(|e| format!("Failed to write session record: {}", e))?;

    // Append session event
    let entry_hash = append_session_event(
        conn,
        &session_id,
        "SESSION_OPENED",
        Some("SESSION"),
        Some(&session_id),
        &user.username,
        Some("Forensic custody session opened"),
    ).map_err(|e| format!("Failed to write session event: {}", e))?;

    // Log to global audit log
    let _ = crate::data::repository::append_audit_log(
        conn,
        "SESSION_OPENED",
        "SESSION",
        &session_id,
        &user.username,
        Some(&format!("Custody session started. Biometric fingerprint: {:?}", cam_hash)),
    );

    // Update active user state
    let mut active_guard = active_user_state.0.lock().map_err(|e| format!("Active user lock failed: {}", e))?;
    *active_guard = Some(user.clone());

    Ok(SessionInitResponse {
        session_id,
        user,
    })
}

fn authenticate_via_users_fallback(
    username: &str,
    password: &str,
    conn: &rusqlite::Connection,
    active_user_state: &State<'_, crate::ActiveUser>,
    device_fingerprint: &str,
    camera_snapshot: &Option<String>,
    audio_sample: &Option<String>,
) -> Result<SessionInitResponse, String> {
    // Check users table
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, role, full_name, designation, organization, is_active, failed_login_attempts, locked_until 
         FROM users WHERE username = ?1"
    ).map_err(|e| format!("Query preparation failed: {}", e))?;

    struct DbUser {
        id: String,
        username: String,
        password_hash: String,
        role: String,
        full_name: Option<String>,
        designation: Option<String>,
        organization: Option<String>,
        is_active: bool,
        failed_attempts: i32,
        locked_until: Option<String>,
    }

    let user = stmt.query_row(rusqlite::params![username], |row| {
        Ok(DbUser {
            id: row.get(0)?,
            username: row.get(1)?,
            password_hash: row.get(2)?,
            role: row.get(3)?,
            full_name: row.get(4)?,
            designation: row.get(5)?,
            organization: row.get(6)?,
            is_active: row.get::<_, i32>(7)? != 0,
            failed_attempts: row.get(8)?,
            locked_until: row.get(9)?,
        })
    }).map_err(|_| "Officer profile or User credentials not found".to_string())?;

    if !user.is_active {
        return Err("Account is deactivated".to_string());
    }

    let now_str = crate::core::time_authority::current_timestamp_iso8601();
    if let Some(ref locked_until) = user.locked_until {
        if locked_until > &now_str {
            return Err(format!("ACCOUNT_LOCKED|{}", locked_until));
        }
    }

    let is_valid = if user.password_hash == "pbkdf2_sha256_mock_hash" {
        if password == user.username {
            // Upgrade mock hash to Argon2id
            if let Ok(new_hash) = crate::security::password::hash_password(password) {
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
        crate::security::password::verify_password(password, &user.password_hash)
    };

    if !is_valid {
        let new_attempts = user.failed_attempts + 1;
        if new_attempts >= 5 {
            let locked_until_dt = crate::core::time_authority::now_ist() + chrono::Duration::minutes(30);
            let locked_until_str = locked_until_dt.format("%Y-%m-%dT%H:%M:%S+05:30").to_string();

            conn.execute(
                "UPDATE users SET failed_login_attempts = ?1, locked_until = ?2 WHERE username = ?3",
                rusqlite::params![new_attempts, locked_until_str, username],
            ).map_err(|e| format!("Database update failed: {}", e))?;

            // Audit
            let _ = crate::data::repository::append_audit_log(
                conn,
                "USER_LOCKED_OUT",
                "USER",
                &user.id,
                &user.username,
                Some("User locked out due to 5 failed attempts"),
            );

            return Err(format!("ACCOUNT_LOCKED|{}", locked_until_str));
        } else {
            conn.execute(
                "UPDATE users SET failed_login_attempts = ?1 WHERE username = ?2",
                rusqlite::params![new_attempts, username],
            ).map_err(|e| format!("Database update failed: {}", e))?;

            return Err(format!("INVALID_CREDENTIALS|{}", 5 - new_attempts));
        }
    }

    // Reset attempts
    conn.execute(
        "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE username = ?1",
        rusqlite::params![username],
    ).map_err(|e| format!("Database update failed: {}", e))?;

    // Success! Dynamically seed this user into officer_profiles
    let pin_hash = crate::security::password::hash_password(password)
        .unwrap_or_else(|_| "invalid_hash".to_string());
    let designation = user.designation.clone().unwrap_or_else(|| "Sub-Inspector".to_string());
    let full_name = user.full_name.clone().unwrap_or_else(|| user.username.clone());
    
    conn.execute(
        "INSERT OR IGNORE INTO officer_profiles (id, batch_no, full_name, rank, unit, jurisdiction, pin_hash)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            user.id,
            user.username,
            full_name,
            designation,
            user.organization.as_deref().unwrap_or("Forensic Central"),
            "Forensic Jurisdiction",
            pin_hash
        ],
    ).map_err(|e| format!("Failed to create officer profile: {}", e))?;

    complete_session_init(
        &user.id,
        conn,
        active_user_state,
        device_fingerprint,
        camera_snapshot,
        audio_sample,
    )
}

#[tauri::command]
pub fn authenticate_session(
    batch_no: String,
    pin_or_password: String,
    device_fingerprint: String,
    camera_snapshot: Option<String>,
    audio_sample: Option<String>,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<SessionInitResponse, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // 1. Try to find the user in officer_profiles
    let mut stmt = conn.prepare(
        "SELECT id, batch_no, full_name, rank, unit, jurisdiction, pin_hash, preferred_language 
         FROM officer_profiles WHERE batch_no = ?1"
    ).map_err(|e| format!("Query preparation failed: {}", e))?;

    struct DbOfficer {
        id: String,
        batch_no: String,
        full_name: String,
        rank: String,
        unit: Option<String>,
        jurisdiction: Option<String>,
        pin_hash: String,
        preferred_language: String,
    }

    let officer_opt = stmt.query_row(rusqlite::params![batch_no], |row| {
        Ok(DbOfficer {
            id: row.get(0)?,
            batch_no: row.get(1)?,
            full_name: row.get(2)?,
            rank: row.get(3)?,
            unit: row.get(4)?,
            jurisdiction: row.get(5)?,
            pin_hash: row.get(6)?,
            preferred_language: row.get(7)?,
        })
    }).ok();

    let authenticated_id = if let Some(officer) = officer_opt {
        // Verify PIN hash or password hash
        let is_valid = if officer.pin_hash == "pbkdf2_sha256_mock_hash" {
            pin_or_password == officer.batch_no
        } else {
            crate::security::password::verify_password(&pin_or_password, &officer.pin_hash)
        };

        if is_valid {
            officer.id
        } else {
            // Also try legacy user verification as a fallback
            return authenticate_via_users_fallback(
                &batch_no,
                &pin_or_password,
                conn,
                &active_user_state,
                &device_fingerprint,
                &camera_snapshot,
                &audio_sample,
            );
        }
    } else {
        // Fallback: Verify against users table
        return authenticate_via_users_fallback(
            &batch_no,
            &pin_or_password,
            conn,
            &active_user_state,
            &device_fingerprint,
            &camera_snapshot,
            &audio_sample,
        );
    };

    complete_session_init(
        &authenticated_id,
        conn,
        &active_user_state,
        &device_fingerprint,
        &camera_snapshot,
        &audio_sample,
    )
}

#[tauri::command]
pub fn close_session(
    session_id: String,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    let actor = active_user_state.0.lock()
        .map(|g| g.as_ref().map(|u| u.username.clone()).unwrap_or_else(|| "system".to_string()))
        .unwrap_or_else(|_| "system".to_string());

    // 1. Log SESSION_CLOSED event to session_events
    let entry_hash = append_session_event(
        conn,
        &session_id,
        "SESSION_CLOSED",
        Some("SESSION"),
        Some(&session_id),
        &actor,
        Some("Forensic custody session closed"),
    ).map_err(|e| format!("Failed to log session closure: {}", e))?;

    // 2. Update session with closed_at and Merkle root (which is the last entry_hash)
    conn.execute(
        "UPDATE sessions SET closed_at = datetime('now', '+5 hours', '+30 minutes'), merkle_root = ?1 WHERE id = ?2",
        rusqlite::params![entry_hash, session_id],
    ).map_err(|e| format!("Failed to seal session in database: {}", e))?;

    // 3. Clear active user
    let mut active_guard = active_user_state.0.lock().map_err(|e| format!("Active user lock failed: {}", e))?;
    *active_guard = None;

    // 4. Log to global audit log
    let _ = crate::data::repository::append_audit_log(
        conn,
        "SESSION_CLOSED",
        "SESSION",
        &session_id,
        &actor,
        Some(&format!("Custody session sealed. Merkle root: {}", entry_hash)),
    );

    Ok(())
}

#[tauri::command]
pub fn reauth_session(
    session_id: String,
    pin: String,
    camera_snapshot: Option<String>,
    audio_sample: Option<String>,
    state: State<'_, DbState>,
) -> Result<bool, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // 1. Get officer ID from session
    let (officer_id, username): (String, String) = conn.query_row(
        "SELECT s.officer_id, o.batch_no FROM sessions s 
         JOIN officer_profiles o ON s.officer_id = o.id 
         WHERE s.id = ?1",
        rusqlite::params![session_id],
        |row| Ok((row.get(0)?, row.get(1)?))
    ).map_err(|e| format!("Session not found: {}", e))?;

    // 2. Get pin_hash
    let pin_hash: String = conn.query_row(
        "SELECT pin_hash FROM officer_profiles WHERE id = ?1",
        rusqlite::params![officer_id],
        |row| row.get(0)
    ).map_err(|e| format!("Officer profile not found: {}", e))?;

    // 3. Verify PIN
    let is_valid = if pin_hash == "pbkdf2_sha256_mock_hash" {
        pin == username
    } else {
        crate::security::password::verify_password(&pin, &pin_hash)
    };

    if !is_valid {
        return Ok(false);
    }

    // 4. Compute biometric hash if provided
    let cam_hash = camera_snapshot.as_ref().map(|s| {
        let mut hasher = sha2::Sha256::new();
        hasher.update(s.as_bytes());
        format!("{:x}", hasher.finalize())
    });

    let details = format!("Reauth success. Biometric snapshot hash: {:?}", cam_hash);

    // 5. Append REAUTH event
    let _ = append_session_event(
        conn,
        &session_id,
        "REAUTH",
        Some("SESSION"),
        Some(&session_id),
        &username,
        Some(&details),
    ).map_err(|e| format!("Failed to log reauth event: {}", e))?;

    // 6. Log to global audit log
    let _ = crate::data::repository::append_audit_log(
        conn,
        "SESSION_REAUTH",
        "SESSION",
        &session_id,
        &username,
        Some(&details),
    );

    Ok(true)
}

#[tauri::command]
pub fn register_pin(
    batch_no: String,
    pin: String,
    state: State<'_, DbState>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    
    let pin_hash = crate::security::password::hash_password(&pin)
        .map_err(|e| format!("PIN hashing failed: {}", e))?;
        
    conn.execute(
        "UPDATE officer_profiles SET pin_hash = ?1, updated_at = datetime('now', '+5 hours', '+30 minutes') WHERE batch_no = ?2",
        rusqlite::params![pin_hash, batch_no],
    ).map_err(|e| format!("Database update failed: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn save_encrypted_vault_key(
    pin: String,
    master_password: String,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let encrypted_hex = crate::security::key_derivation::encrypt_master_key(&master_password, &pin)?;
    let pin_vault_path = resolve_pin_vault_path(&app);
    
    std::fs::write(&pin_vault_path, encrypted_hex)
        .map_err(|e| format!("Failed to save PIN vault: {}", e))?;
        
    Ok(())
}

#[tauri::command]
pub fn try_pin_unlock(
    pin: String,
    app: tauri::AppHandle,
    state: State<'_, DbState>,
) -> Result<bool, String> {
    let pin_vault_path = resolve_pin_vault_path(&app);
    if !pin_vault_path.exists() {
        return Err("NO_PIN_VAULT".to_string());
    }
    
    let encrypted_hex = std::fs::read_to_string(&pin_vault_path)
        .map_err(|e| format!("Failed to read PIN vault: {}", e))?;
        
    let decrypted_password = crate::security::key_derivation::decrypt_master_key(&encrypted_hex, &pin)?;
    
    // Attempt unlock using the decrypted master password
    unlock_vault(decrypted_password, app, state)
}

#[tauri::command]
pub fn delete_pin_vault(app: tauri::AppHandle) -> Result<(), String> {
    let path = resolve_pin_vault_path(&app);
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| format!("Failed to delete PIN vault: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn is_pin_vault_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    Ok(resolve_pin_vault_path(&app).exists())
}

#[tauri::command]
pub fn cosign_session(
    session_id: String,
    name: String,
    rank: String,
    batch_no: String,
    signature: String,
    state: State<'_, DbState>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    let cosigner_id = uuid::Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO session_cosigners (id, session_id, cosigner_name, cosigner_rank, cosigner_batch_no, signature)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![cosigner_id, session_id, name, rank, batch_no, signature],
    ).map_err(|e| format!("Failed to write cosigner: {}", e))?;

    // Log event in session
    let _ = append_session_event(
        conn,
        &session_id,
        "VIEW",
        Some("COSIGNER"),
        Some(&cosigner_id),
        &name,
        Some(&format!("Cosigned session. Rank: {}, Batch No: {}", rank, batch_no)),
    );

    Ok(())
}

#[tauri::command]
pub fn log_system_health_event(
    event_type: String,
    details: String,
    state: State<'_, DbState>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    let event_id = uuid::Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO system_health_log (id, event_type, details) VALUES (?1, ?2, ?3)",
        rusqlite::params![event_id, event_type, details],
    ).map_err(|e| format!("Failed to log system health: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn get_system_health_log(state: State<'_, DbState>) -> Result<Vec<SystemHealthEntry>, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    let mut stmt = conn.prepare(
        "SELECT id, event_type, details, timestamp FROM system_health_log ORDER BY timestamp DESC"
    ).map_err(|e| format!("Failed to prepare query: {}", e))?;

    let entries = stmt.query_map([], |row| {
        Ok(SystemHealthEntry {
            id: row.get(0)?,
            event_type: row.get(1)?,
            details: row.get(2)?,
            timestamp: row.get(3)?,
        })
    }).map_err(|e| format!("Query map failed: {}", e))?
      .collect::<Result<Vec<_>, _>>()
      .map_err(|e| format!("Collection failed: {}", e))?;

    Ok(entries)
}
