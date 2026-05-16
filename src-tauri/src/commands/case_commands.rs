use serde::{Deserialize, Serialize};

#[tauri::command]
pub fn create_case(cnr: String, fir: String, io: String) -> Result<String, String> {
    Ok(format!("Case created with CNR: {}, FIR: {}, IO: {}", cnr, fir, io))
}
