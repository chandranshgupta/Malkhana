use tauri::State;
use crate::data::database::DbState;
use crate::data::models::{EvidenceCard, EvidenceStamp};
use crate::data::repository;

/// Returns evidence items formatted for the EvidenceLog UI view.
/// Reads from the database and transforms into the card format expected by React.
#[tauri::command]
pub fn get_evidence_log(db: State<DbState>) -> Result<Vec<EvidenceCard>, String> {
    let conn = db.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let evidence_list = repository::get_all_evidence(&conn)
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
        }
    }).collect();

    Ok(cards)
}

#[tauri::command]
pub fn ingest_evidence(case_id: String, asset_type: String) -> Result<String, String> {
    // TODO: Phase 2 — full evidence ingestion with file copy + hash computation
    Ok(format!("Ingested asset type {} for case {}", asset_type, case_id))
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
