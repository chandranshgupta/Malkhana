use tauri::State;
use crate::data::database::DbState;
use crate::data::repository;

#[tauri::command]
pub fn dispose_evidence(
    evidence_id: String,
    disposition_type: String, // "Destroyed", "Auctioned", "Return to Owner", etc.
    magistrate_order_no: String,
    disposed_to: String,
    signature: String,
    notes: String,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // 1. Enforce Role-Based Access Control (RBAC) - restricted to ADMIN or MALKHANA_INCHARGE
    let username = {
        let active_guard = active_user_state.0.lock().map_err(|e| format!("Active user lock failed: {}", e))?;
        if let Some(ref user) = *active_guard {
            if user.role != "ADMIN" && user.role != "MALKHANA_INCHARGE" {
                let _ = repository::append_audit_log(
                    conn,
                    "UNAUTHORIZED_ACCESS_ATTEMPT",
                    "EVIDENCE",
                    &evidence_id,
                    &user.username,
                    Some(&format!("Unauthorized attempt to dispose evidence {}", evidence_id)),
                );
                return Err("UNAUTHORIZED_ACCESS".to_string());
            }
            user.username.clone()
        } else {
            return Err("UNAUTHORIZED_ACCESS".to_string());
        }
    };

    // 2. Fetch evidence item
    let evidence = repository::get_evidence_by_id(conn, &evidence_id)
        .map_err(|e| format!("Evidence lookup failed: {}", e))?
        .ok_or_else(|| format!("Evidence item {} not found", evidence_id))?;

    let now = crate::core::time_authority::current_timestamp_iso8601();
    
    // 3. Update status of the evidence item to "DISPOSED" and clear storage location
    conn.execute(
        "UPDATE evidence SET status = 'DISPOSED', storage_location = NULL WHERE id = ?1",
        rusqlite::params![evidence_id],
    ).map_err(|e| format!("Failed to update evidence status: {}", e))?;

    // 4. Free the assigned slot in the archive_matrix table
    conn.execute(
        "UPDATE archive_matrix SET evidence_id = NULL, status = 'EMPTY', assigned_at = NULL WHERE evidence_id = ?1",
        rusqlite::params![evidence_id],
    ).map_err(|e| format!("Failed to update archive matrix slot: {}", e))?;

    // 5. Determine custody action
    let custody_action = if disposition_type == "Return to Owner" {
        "RETURNED".to_string()
    } else {
        "DISPOSED".to_string()
    };

    let custody_id = format!("CUST-{}", uuid::Uuid::new_v4().simple().to_string()[..8].to_uppercase());
    let role = "SUPERVISOR".to_string();

    let entry = crate::data::models::CustodyEntry {
        id: custody_id,
        evidence_id: evidence_id.clone(),
        from_person: Some(username.clone()),
        to_person: disposed_to.clone(),
        role,
        organization: Some("Malkhana Vault Central".to_string()),
        action: custody_action.clone(),
        hash_at_transfer: evidence.hash_sha256.clone(),
        hash_verified: true,
        notes: Some(format!(
            "Disposition: {}. Magistrate Order: {}. Notes: {}",
            disposition_type, magistrate_order_no, notes
        )),
        signature: Some(signature),
        timestamp: now,
    };

    // 6. Insert custody chain entry
    repository::insert_custody_entry(conn, &entry)
        .map_err(|e| format!("Custody entry insert failed: {}", e))?;

    // 7. Log to audit trail
    repository::append_audit_log(
        conn,
        "DISPOSITION",
        "EVIDENCE",
        &evidence_id,
        &username,
        Some(&format!(
            "Evidence {} disposed via {} under Magistrate Order {}. Disposed to: {}",
            evidence_id, disposition_type, magistrate_order_no, disposed_to
        )),
    ).map_err(|e| format!("Audit log failed: {}", e))?;

    Ok(())
}
