use tauri::State;
use crate::data::database::DbState;
use crate::data::models::AuditLogEntry;
use crate::data::repository;

#[tauri::command]
pub fn get_audit_log(state: State<'_, DbState>) -> Result<Vec<AuditLogEntry>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    repository::get_all_audit_logs(&conn).map_err(|e| format!("Database query error: {}", e))
}

#[tauri::command]
pub fn verify_audit_log_trail(state: State<'_, DbState>) -> Result<Option<(i64, String)>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    repository::verify_audit_trail(&conn).map_err(|e| format!("Audit verification error: {}", e))
}
