#[tauri::command]
pub fn create_case(cnr: String, fir: String, io: String) -> Result<String, String> {
    // TODO: Phase 2 — wire to repository::insert_case with full Case model
    Ok(format!("Case created with CNR: {}, FIR: {}, IO: {}", cnr, fir, io))
}
