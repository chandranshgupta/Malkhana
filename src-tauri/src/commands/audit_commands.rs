use tauri::State;
use crate::data::database::DbState;
use crate::data::models::AuditLogEntry;
use crate::data::repository;
use crate::utils::errors::AppError;

#[tauri::command]
pub fn get_audit_log(state: State<'_, DbState>) -> Result<Vec<AuditLogEntry>, AppError> {
    let guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;
    Ok(repository::get_all_audit_logs(conn)?)
}

#[tauri::command]
pub fn verify_audit_log_trail(state: State<'_, DbState>) -> Result<Option<(i64, String)>, AppError> {
    let guard = state.0.lock().map_err(|e| AppError::Lock(format!("Database lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;
    Ok(repository::verify_audit_trail(conn)?)
}
