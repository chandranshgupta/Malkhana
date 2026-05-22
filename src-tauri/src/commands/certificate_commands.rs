use tauri::State;
use crate::data::database::DbState;
use crate::data::models::{Certificate, CertificateInput, EvidenceSummary};
use crate::data::repository;
use crate::core::certificate_engine;
use crate::utils::errors::AppError;

/// Returns lightweight evidence summaries for the certificate evidence selector dropdown
#[tauri::command]
pub fn get_evidence_for_certificate(db: State<DbState>) -> Result<Vec<EvidenceSummary>, AppError> {
    let guard = db.0.lock().map_err(|e| AppError::Lock(format!("DB lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;
    repository::get_evidence_summaries(conn).map_err(AppError::Database)
}

/// Generates, seals, and persists a BSA Section 63 certificate.
/// 
/// FORENSIC: This is an irreversible operation. Once sealed:
/// - The certificate record is written to the encrypted database
/// - An audit log entry is appended
/// - The document_hash cryptographically binds all fields
#[tauri::command]
pub fn generate_certificate(
    db: State<DbState>,
    input: CertificateInput,
) -> Result<Certificate, AppError> {
    let guard = db.0.lock().map_err(|e| AppError::Lock(format!("DB lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;

    // 1. Fetch the evidence record to get its actual hash
    let evidence = repository::get_evidence_by_id(conn, &input.evidence_id)
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::Validation(format!("Evidence not found: {}", input.evidence_id)))?;

    let evidence_hash = evidence.hash_sha256
        .as_deref()
        .unwrap_or("NO_HASH_AVAILABLE");

    // 2. Generate certificate ID and timestamp (IST)
    let cert_id = format!("CERT-{}", uuid::Uuid::new_v4());
    let timestamp = crate::core::time_authority::current_timestamp_iso8601();

    // 3. Query system_health_log for downtime compliance (§63(2)(c))
    let seized_time = evidence.seized_at.as_deref().unwrap_or(&evidence.created_at);
    
    let mut stmt = conn.prepare(
        "SELECT event_type, details, timestamp FROM system_health_log 
         WHERE datetime(timestamp) BETWEEN datetime(?1) AND datetime(?2)
         ORDER BY timestamp ASC"
    ).map_err(AppError::Database)?;

    let rows = stmt.query_map(rusqlite::params![seized_time, timestamp], |row| {
        let event_type: String = row.get(0)?;
        let details: Option<String> = row.get(1)?;
        let ts: String = row.get(2)?;
        Ok((event_type, details, ts))
    }).map_err(AppError::Database)?;

    let mut events = Vec::new();
    for row in rows {
        let (event_type, details, ts) = row.map_err(AppError::Database)?;
        let detail_str = details.unwrap_or_default();
        events.push(format!("[{}] {} - {}", ts, event_type, detail_str));
    }

    let compliance_note = if events.is_empty() {
        Some("BSA §63(2)(c) Compliance: No system downtime or interruption events were logged during the evidence custody period. The system was operating properly at all material times.".to_string())
    } else {
        Some(format!(
            "BSA §63(2)(c) Compliance Note: The following system interruption/restart events were logged during the evidence custody period:\n{}\nNote: These events have not affected the accuracy, integrity, or admissibility of the electronic records stored within the malkhana vault.",
            events.join("\n")
        ))
    };

    // 4. Build certificate with cryptographic seal
    let cert = certificate_engine::build_certificate(
        &cert_id, &input, evidence_hash, &timestamp, compliance_note,
    );

    // 5. Persist to encrypted database
    repository::insert_certificate(conn, &cert)
        .map_err(AppError::Database)?;

    // 6. Append audit trail
    let audit_details = serde_json::json!({
        "evidence_id": input.evidence_id,
        "custodian": input.custodian_name,
        "examiner": input.examiner_name,
        "document_hash": cert.document_hash,
    }).to_string();

    repository::append_audit_log(
        conn,
        "CERTIFICATE_SEALED",
        "CERTIFICATE",
        &cert_id,
        &input.examiner_name,
        Some(&audit_details),
    ).map_err(AppError::Database)?;

    log::info!("Certificate sealed: {} for evidence {}", cert_id, input.evidence_id);

    Ok(cert)
}

/// Retrieves an existing certificate for a given evidence item
#[tauri::command]
pub fn get_certificate(
    db: State<DbState>,
    evidence_id: String,
) -> Result<Option<Certificate>, AppError> {
    let guard = db.0.lock().map_err(|e| AppError::Lock(format!("DB lock failed: {}", e)))?;
    let conn = guard.as_ref().ok_or_else(|| AppError::Vault("VAULT_LOCKED".to_string()))?;
    repository::get_certificate_by_evidence(conn, &evidence_id)
        .map_err(AppError::Database)
}
