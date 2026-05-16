#[tauri::command]
pub fn transfer_custody(evidence_id: String, to: String) -> Result<String, String> {
    Ok(format!("Transferred custody of {} to {}", evidence_id, to))
}
