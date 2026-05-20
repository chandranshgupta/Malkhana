use tauri::State;
use crate::data::database::DbState;
use crate::data::models::User;
use crate::data::repository;

#[tauri::command]
pub fn get_all_users(state: State<'_, DbState>) -> Result<Vec<User>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    repository::get_all_users(&conn).map_err(|e| format!("Query failed: {}", e))
}

#[tauri::command]
pub fn authenticate_user(
    username: String,
    password: String,
    state: State<'_, DbState>,
) -> Result<User, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;

    // 1. Fetch user status and login/lockout details
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, role, full_name, designation, organization, public_key, is_active, created_at, updated_at, failed_login_attempts, locked_until 
         FROM users WHERE username = ?1"
    ).map_err(|e| format!("Query preparation failed: {}", e))?;

    struct DbUser {
        user: User,
        failed_attempts: i32,
        locked_until: Option<String>,
    }

    let db_user = stmt.query_row(rusqlite::params![username], |row| {
        Ok(DbUser {
            user: User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: "".to_string(), // don't expose it
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
        })
    }).map_err(|_| "User not found".to_string())?;

    if !db_user.user.is_active {
        return Err("Account is deactivated".to_string());
    }

    let now_str = crate::core::time_authority::current_timestamp_iso8601();

    // 2. Check if locked out
    if let Some(ref locked_until) = db_user.locked_until {
        if locked_until > &now_str {
            return Err(format!("ACCOUNT_LOCKED|{}", locked_until));
        }
    }

    // 3. Verify password (username = password for demo users)
    let is_valid = password == db_user.user.username;

    if is_valid {
        // Reset failed attempts
        conn.execute(
            "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE username = ?1",
            rusqlite::params![username],
        ).map_err(|e| format!("Database update failed: {}", e))?;

        // Append to audit log
        repository::append_audit_log(
            &conn,
            "LOGIN_SUCCESS",
            "USER",
            &db_user.user.id,
            &db_user.user.username,
            Some("User logged in successfully"),
        ).unwrap_or(());

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
            ).map_err(|e| format!("Database update failed: {}", e))?;

            // Append to audit log
            repository::append_audit_log(
                &conn,
                "USER_LOCKED_OUT",
                "USER",
                &db_user.user.id,
                &db_user.user.username,
                Some("User locked out due to 5 failed attempts"),
            ).unwrap_or(());

            Err(format!("ACCOUNT_LOCKED|{}", locked_until_str))
        } else {
            conn.execute(
                "UPDATE users SET failed_login_attempts = ?1 WHERE username = ?2",
                rusqlite::params![new_attempts, username],
            ).map_err(|e| format!("Database update failed: {}", e))?;

            Err(format!("INVALID_CREDENTIALS|{}", 5 - new_attempts))
        }
    }
}
