use tauri::State;
use uuid::Uuid;
use crate::data::database::DbState;
use crate::data::models::Case;
use crate::data::repository;

#[tauri::command]
pub fn create_case(
    cnr: String,
    fir: String,
    io: String,
    jurisdiction: String,
    state: State<'_, DbState>,
) -> Result<String, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    
    let now = crate::core::time_authority::current_timestamp_iso8601();
        
    let id = format!("CASE-{}", Uuid::new_v4().simple().to_string()[..8].to_uppercase());

    let new_case = Case {
        id: id.clone(),
        cnr: if cnr.trim().is_empty() { None } else { Some(cnr) },
        fir_number: fir.clone(),
        investigating_officer: io,
        jurisdiction: if jurisdiction.trim().is_empty() { None } else { Some(jurisdiction) },
        title: format!("Investigation - {}", fir),
        description: None,
        status: "ACTIVE".to_string(),
        created_at: now.clone(),
        updated_at: now,
    };

    repository::insert_case(&conn, &new_case).map_err(|e| format!("Failed to insert case: {}", e))?;
    
    repository::append_audit_log(
        &conn,
        "CASE_CREATED",
        "CASE",
        &id,
        "SYSTEM_USER",
        Some(&format!("Case {} created for FIR {}", id, fir))
    ).map_err(|e| format!("Failed to write audit log: {}", e))?;

    Ok(id)
}

#[tauri::command]
pub fn get_all_cases(state: State<'_, DbState>) -> Result<Vec<Case>, String> {
    let conn = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    repository::get_all_cases(&conn).map_err(|e| format!("Query failed: {}", e))
}

