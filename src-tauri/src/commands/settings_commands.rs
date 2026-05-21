use tauri::State;
use crate::data::database::DbState;
use crate::data::repository;

#[tauri::command]
pub fn get_settings(state: State<'_, DbState>) -> Result<String, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    let settings = repository::get_all_settings(conn).map_err(|e| format!("Query failed: {}", e))?;
    serde_json::to_string(&settings).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub fn update_setting(
    key: String, 
    value: String,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    
    // Enforce Role-Based Access Control (RBAC) - restricted to ADMIN
    let username = {
        let active_guard = active_user_state.0.lock().map_err(|e| format!("Active user lock failed: {}", e))?;
        if let Some(ref user) = *active_guard {
            if user.role != "ADMIN" {
                let _ = repository::append_audit_log(
                    conn,
                    "UNAUTHORIZED_ACCESS_ATTEMPT",
                    "SETTING",
                    &key,
                    &user.username,
                    Some(&format!("Unauthorized attempt to update setting {} to {}", key, value)),
                );
                return Err("UNAUTHORIZED_ACCESS".to_string());
            }
            user.username.clone()
        } else {
            return Err("UNAUTHORIZED_ACCESS".to_string());
        }
    };

    repository::update_setting(conn, &key, &value).map_err(|e| format!("Update failed: {}", e))?;
    
    // Log the change
    let _ = repository::append_audit_log(
        conn,
        "SETTING_CHANGED",
        "SETTING",
        &key,
        &username,
        Some(&format!("Updated setting {} to {}", key, value))
    );
    
    log::info!("Setting {} updated to {}", key, value);
    Ok(())
}

#[derive(serde::Serialize)]
pub struct HardwareInfo {
    pub logical_cores: u32,
    pub total_memory_gb: u32,
}

#[tauri::command]
pub fn get_hardware_info() -> HardwareInfo {
    let logical_cores = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4) as u32;

    let mut total_memory_gb = 8; // Default fallback

    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = std::process::Command::new("powershell")
            .args(&["-NoProfile", "-Command", "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"])
            .output()
        {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if let Ok(bytes) = stdout.parse::<u64>() {
                    total_memory_gb = (bytes / (1024 * 1024 * 1024)) as u32;
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        if let Ok(meminfo) = std::fs::read_to_string("/proc/meminfo") {
            if let Some(line) = meminfo.lines().find(|l| l.starts_with("MemTotal:")) {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    if let Ok(kb) = parts[1].parse::<u64>() {
                        total_memory_gb = (kb / (1024 * 1024)) as u32;
                    }
                }
            }
        }
    }

    HardwareInfo {
        logical_cores,
        total_memory_gb,
    }
}
