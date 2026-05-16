#[tauri::command]
pub fn search_archive(query: String) -> Result<Vec<String>, String> {
    Ok(vec![format!("Search result for {}", query)])
}
