#[tauri::command]
pub fn get_settings() -> Result<String, String> {
    Ok("{}".to_string())
}

#[tauri::command]
pub fn update_setting(key: String, value: String) -> Result<(), String> {
    log::info!("Setting {} to {}", key, value);
    Ok(())
}
