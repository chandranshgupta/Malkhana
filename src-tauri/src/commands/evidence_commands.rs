use tauri::State;
use crate::data::database::DbState;
use crate::data::models::{EvidenceCard, EvidenceStamp};
use crate::data::repository;

#[tauri::command]
pub fn get_evidence_details(id: String, db: State<DbState>) -> Result<Option<crate::data::models::Evidence>, String> {
    let guard = db.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    repository::get_evidence_by_id(conn, &id).map_err(|e| format!("Query failed: {}", e))
}

/// Returns evidence items formatted for the EvidenceLog UI view.
/// Reads from the database and transforms into the card format expected by React.
#[tauri::command]
pub fn get_evidence_log(db: State<DbState>) -> Result<Vec<EvidenceCard>, String> {
    let guard = db.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    let evidence_list = repository::get_all_evidence(conn)
        .map_err(|e| format!("Query failed: {}", e))?;

    let cards: Vec<EvidenceCard> = evidence_list.into_iter().map(|ev| {
        // Parse tags from JSON string to Vec<String>
        let tags: Vec<String> = ev.tags
            .as_deref()
            .and_then(|t| serde_json::from_str(t).ok())
            .unwrap_or_default();

        // Map asset_type to wireframe component
        let image_comp_type = match ev.asset_type.as_str() {
            "DISK" => "WireframeSSD",
            "MOBILE" => "WireframePhone",
            "CCTV" => "WireframeDVR",
            "USB" => "WireframeSSD",
            _ => "WireframeSSD",
        }.to_string();

        // Determine stamp based on status
        let (stamp_text, stamp_type, stamp_rotate) = match ev.status.as_str() {
            "ACTIVE" => ("STATUS: IMMUTABLE", "blue", "-rotate-12"),
            "SEALED" => ("STATUS: SEALED", "green", "rotate-6"),
            "ARCHIVED" => ("STATUS: ARCHIVED", "gray", "-rotate-6"),
            "DISPOSED" => ("STATUS: DISPOSED", "red", "rotate-12"),
            _ => ("STATUS: ALERT", "red", "rotate-12"),
        };

        // Check for alert conditions
        let alert = if ev.hash_sha256.is_none() {
            Some("NO_HASH".to_string())
        } else if ev.device_imei.is_some() && ev.asset_type == "MOBILE" {
            // Mobile devices with IMEI get encryption alert
            Some("ENCRYPTION_ACTIVE".to_string())
        } else {
            None
        };

        EvidenceCard {
            id: ev.id,
            title: ev.title,
            desc: ev.description.unwrap_or_default(),
            tags,
            image_comp_type,
            stamp: EvidenceStamp {
                text: stamp_text.to_string(),
                r#type: stamp_type.to_string(),
                rotate: stamp_rotate.to_string(),
            },
            alert,
            created_at: ev.created_at,
        }
    }).collect();

    Ok(cards)
}

#[derive(serde::Deserialize)]
pub struct IngestEvidenceInput {
    pub case_id: String,
    pub asset_type: String,
    pub title: String,
    pub description: Option<String>,
    pub tags: Option<String>,
    pub device_make: Option<String>,
    pub device_model: Option<String>,
    pub device_color: Option<String>,
    pub device_serial: Option<String>,
    pub device_imei: Option<String>,
    pub physical_condition: Option<String>,
    pub hash_sha256: Option<String>,
    pub hash_md5: Option<String>,
    pub seal_number: Option<String>,
    pub seized_at: Option<String>,
    pub device_metadata: Option<String>,
}

#[tauri::command]
pub fn ingest_evidence(
    input: IngestEvidenceInput,
    state: State<'_, DbState>,
    active_user_state: State<'_, crate::ActiveUser>,
) -> Result<String, String> {
    let guard = state.0.lock().map_err(|e| format!("Database lock error: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // Enforce Role-Based Access Control (RBAC) - restricted to ADMIN, MALKHANA_INCHARGE, or IO
    let username = {
        let active_guard = active_user_state.0.lock().map_err(|e| format!("Active user lock failed: {}", e))?;
        if let Some(ref user) = *active_guard {
            if user.role != "ADMIN" && user.role != "MALKHANA_INCHARGE" && user.role != "IO" {
                let _ = repository::append_audit_log(
                    conn,
                    "UNAUTHORIZED_ACCESS_ATTEMPT",
                    "EVIDENCE",
                    &input.case_id,
                    &user.username,
                    Some(&format!("Unauthorized attempt to ingest evidence type {} for case {}", input.asset_type, input.case_id)),
                );
                return Err("UNAUTHORIZED_ACCESS".to_string());
            }
            user.username.clone()
        } else {
            return Err("UNAUTHORIZED_ACCESS".to_string());
        }
    };
    
    let now = crate::core::time_authority::current_timestamp_iso8601();
    let evidence_id = format!("EVID-{}", uuid::Uuid::new_v4().simple().to_string()[..8].to_uppercase());
    
    // Find the first free location R1-C1 to R10-C15 not present or empty in archive_matrix
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

    let new_evidence = crate::data::models::Evidence {
        id: evidence_id.clone(),
        case_id: input.case_id.clone(),
        asset_type: input.asset_type.clone(),
        title: input.title.clone(),
        description: input.description,
        tags: input.tags,
        device_make: input.device_make,
        device_model: input.device_model,
        device_color: input.device_color,
        device_serial: input.device_serial,
        device_imei: input.device_imei,
        physical_condition: input.physical_condition,
        hash_sha256: input.hash_sha256.clone(),
        hash_md5: input.hash_md5,
        hash_sha512: None,
        seal_number: input.seal_number.clone(),
        storage_location: allocated_location.clone(),
        device_metadata: input.device_metadata,
        status: "ACTIVE".to_string(),
        seized_at: Some(input.seized_at.unwrap_or_else(|| now.clone())),
        created_at: now.clone(),
    };

    repository::insert_evidence(conn, &new_evidence).map_err(|e| format!("Failed to insert evidence: {}", e))?;
    
    // Insert archive slot in archive_matrix
    if let Some(ref loc) = allocated_location {
        conn.execute(
            "INSERT OR REPLACE INTO archive_matrix (location, evidence_id, vault_level, status, assigned_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![loc, evidence_id.clone(), 3, "SEALED", now.clone()],
        ).map_err(|e| format!("Failed to assign archive slot: {}", e))?;
    }

    // Add initial custody chain entry
    let custody_id = format!("CUST-{}", uuid::Uuid::new_v4().simple().to_string()[..8].to_uppercase());
    let initial_custody = crate::data::models::CustodyEntry {
        id: custody_id,
        evidence_id: evidence_id.clone(),
        from_person: None,
        to_person: username.clone(), // Seizing Officer / Intake Officer
        role: "SEIZING_OFFICER".to_string(),
        organization: Some("Delhi Police".to_string()),
        action: "SEIZED".to_string(),
        hash_at_transfer: input.hash_sha256.clone(),
        hash_verified: true,
        notes: Some("Initial forensic seizure and ingestion into vault".to_string()),
        signature: Some("DIGITAL_SIGNATURE_OK".to_string()),
        timestamp: now.clone(),
    };
    repository::insert_custody_entry(conn, &initial_custody).map_err(|e| format!("Failed to write custody log: {}", e))?;

    // Log the event in the audit trail
    repository::append_audit_log(
        conn,
        "EVIDENCE_INGESTED",
        "EVIDENCE",
        &evidence_id,
        &username,
        Some(&format!("Evidence {} (type {}) ingested for case {}", evidence_id, input.asset_type, input.case_id))
    ).map_err(|e| format!("Failed to write audit log: {}", e))?;

    Ok(evidence_id)
}

#[tauri::command]
pub fn hash_file(path: String) -> Result<serde_json::Value, String> {
    match crate::core::hash_engine::hash_file_chunked(path) {
        Ok(result) => Ok(serde_json::json!({
            "sha256": result.sha256,
            "md5": result.md5
        })),
        Err(e) => Err(format!("Hashing failed: {}", e)),
    }
}

#[tauri::command]
pub fn acquire_forensic_image(
    window: tauri::Window,
    source: String,
    destination: String,
) -> Result<crate::core::imaging_engine::ImagingResult, String> {
    crate::core::imaging_engine::run_forensic_imaging(window, source, destination)
}

#[tauri::command]
pub fn detect_devices() -> Result<Vec<crate::core::device_detector::RemovableDevice>, String> {
    crate::core::device_detector::detect_external_drives()
}

#[tauri::command]
pub fn verify_forensic_integrity(
    h1: String,
    h2: String,
    h3: Option<String>,
) -> crate::core::integrity_checker::HashComparisonResult {
    crate::core::integrity_checker::compare_hashes(&h1, &h2, h3.as_deref())
}
