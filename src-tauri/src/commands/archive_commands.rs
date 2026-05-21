use tauri::State;
use rusqlite::Connection;
use crate::data::database::DbState;
use crate::data::models::ArchiveSlot;
use crate::data::repository;

fn ensure_archive_slots_assigned(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Find all evidence IDs that are not present in archive_matrix
    let mut stmt = conn.prepare(
        "SELECT id FROM evidence WHERE id NOT IN (SELECT DISTINCT evidence_id FROM archive_matrix WHERE evidence_id IS NOT NULL)"
    )?;
    let mut rows = stmt.query([])?;
    let mut unassigned_ids = Vec::new();
    while let Some(row) = rows.next()? {
        let id: String = row.get(0)?;
        unassigned_ids.push(id);
    }

    if unassigned_ids.is_empty() {
        return Ok(());
    }

    log::info!("Found {} unassigned evidence items. Auto-allocating slots...", unassigned_ids.len());
    let now = crate::core::time_authority::current_timestamp_iso8601();

    for ev_id in unassigned_ids {
        // Find first empty coordinate slot (from R1-C1 to R10-C15)
        let mut allocated_location = None;
        for r in 1..=10 {
            for c in 1..=15 {
                let loc = format!("R{}-C{}", r, c);
                let exists: i64 = conn.query_row(
                    "SELECT COUNT(*) FROM archive_matrix WHERE location = ?1 AND evidence_id IS NOT NULL",
                    rusqlite::params![loc],
                    |row| row.get(0)
                ).unwrap_or(0);
                
                if exists == 0 {
                    allocated_location = Some(loc);
                    break;
                }
            }
            if allocated_location.is_some() {
                break;
            }
        }

        if let Some(loc) = allocated_location {
            // Update storage_location on evidence table
            conn.execute(
                "UPDATE evidence SET storage_location = ?1 WHERE id = ?2",
                rusqlite::params![loc, ev_id],
            )?;

            // Insert/update into archive_matrix
            conn.execute(
                "INSERT OR REPLACE INTO archive_matrix (location, evidence_id, vault_level, status, assigned_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![loc, ev_id, 3, "SEALED", now.clone()],
            )?;
            log::info!("Auto-assigned evidence {} to location {}", ev_id, loc);
        }
    }

    Ok(())
}

#[tauri::command]
pub fn get_archive_matrix(state: State<'_, DbState>) -> Result<Vec<ArchiveSlot>, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    
    // Auto-resolve any unassigned evidence slots
    let _ = ensure_archive_slots_assigned(&conn);
    
    let slots = repository::get_all_archive_slots(&conn).map_err(|e| format!("Query failed: {}", e))?;
    
    Ok(slots)
}

#[tauri::command]
pub fn search_archive(query: String, state: State<'_, DbState>) -> Result<Vec<String>, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    
    // Auto-resolve any unassigned evidence slots
    let _ = ensure_archive_slots_assigned(&conn);
    
    let mut stmt = conn.prepare(
        "SELECT am.location
         FROM archive_matrix am
         INNER JOIN evidence e ON am.evidence_id = e.id
         LEFT JOIN cases c ON e.case_id = c.id
         WHERE e.id LIKE ?1
            OR e.title LIKE ?1
            OR e.description LIKE ?1
            OR c.id LIKE ?1
            OR c.cnr LIKE ?1
            OR c.fir_number LIKE ?1"
    ).map_err(|e| format!("Prepare statement failed: {}", e))?;

    let search_term = format!("%{}%", query);
    let rows = stmt.query_map(rusqlite::params![search_term], |row| row.get(0))
        .map_err(|e| format!("Query failed: {}", e))?;

    let locations: Result<Vec<String>, rusqlite::Error> = rows.collect();
    locations.map_err(|e| format!("Row extraction failed: {}", e))
}
