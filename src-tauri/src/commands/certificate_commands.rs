#[tauri::command]
pub fn generate_certificate(evidence_id: String) -> Result<String, String> {
    Ok(format!("Generated certificate for {}", evidence_id))
}
