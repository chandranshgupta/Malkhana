use crate::utils::errors::AppError;

#[tauri::command]
pub fn global_search(query: String) -> Result<Vec<String>, AppError> {
    Ok(vec![format!("Global search result for {}", query)])
}
