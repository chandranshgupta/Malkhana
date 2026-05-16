#[tauri::command]
pub fn global_search(query: String) -> Result<Vec<String>, String> {
    Ok(vec![format!("Global search result for {}", query)])
}
