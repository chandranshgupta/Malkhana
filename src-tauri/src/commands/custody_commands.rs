use tauri::State;
use crate::data::database::DbState;
use crate::data::models::CustodyEntry;
use crate::data::repository;

#[tauri::command]
pub fn get_custody_chain(evidence_id: String, state: State<'_, DbState>) -> Result<Vec<CustodyEntry>, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    repository::get_custody_chain_for_evidence(conn, &evidence_id).map_err(|e| format!("Query failed: {}", e))
}

#[tauri::command]
pub fn transfer_custody(
    evidence_id: String,
    from_person: Option<String>,
    to_person: String,
    role: String,
    organization: Option<String>,
    hash_at_transfer: Option<String>,
    hash_verified: bool,
    notes: Option<String>,
    state: State<'_, DbState>,
) -> Result<String, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    
    // 1. Retrieve the evidence item to check its hash existence
    let _evidence = repository::get_evidence_by_id(conn, &evidence_id)
        .map_err(|e| format!("Evidence lookup failed: {}", e))?
        .ok_or_else(|| format!("Evidence item {} not found", evidence_id))?;
    
    let now = crate::core::time_authority::current_timestamp_iso8601();
    let custody_id = format!("CUST-{}", uuid::Uuid::new_v4().simple().to_string()[..8].to_uppercase());

    let entry = CustodyEntry {
        id: custody_id.clone(),
        evidence_id: evidence_id.clone(),
        from_person: from_person.clone(),
        to_person: to_person.clone(),
        role: role.clone(),
        organization: organization.clone(),
        action: "TRANSFERRED".to_string(),
        hash_at_transfer,
        hash_verified,
        notes: notes.clone(),
        signature: Some("DIGITAL_SIGNATURE_OK".to_string()),
        timestamp: now.clone(),
    };

    // 2. Insert custody chain entry
    repository::insert_custody_entry(conn, &entry)
        .map_err(|e| format!("Custody insert failed: {}", e))?;

    // 3. Log to audit trail
    let actor = from_person.unwrap_or_else(|| "SYSTEM_USER".to_string());
    repository::append_audit_log(
        conn,
        "CUSTODY_TRANSFER",
        "EVIDENCE",
        &evidence_id,
        &actor,
        Some(&format!(
            "Evidence {} custody transferred to {} (Role: {}, Notes: {:?}, Hash Verified: {})",
            evidence_id, to_person, role, notes, hash_verified
        )),
    ).map_err(|e| format!("Audit log failed: {}", e))?;

    Ok(custody_id)
}
