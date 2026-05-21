use tauri::State;
use crate::data::database::DbState;
use crate::data::models::{Certificate, CertificateInput, EvidenceSummary};
use crate::data::repository;
use crate::core::certificate_engine;

/// Returns lightweight evidence summaries for the certificate evidence selector dropdown
#[tauri::command]
pub fn get_evidence_for_certificate(db: State<DbState>) -> Result<Vec<EvidenceSummary>, String> {
    let guard = db.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    repository::get_evidence_summaries(conn).map_err(|e| format!("Query failed: {}", e))
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
) -> Result<Certificate, String> {
    let guard = db.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // 1. Fetch the evidence record to get its actual hash
    let evidence = repository::get_evidence_by_id(conn, &input.evidence_id)
        .map_err(|e| format!("Evidence query failed: {}", e))?
        .ok_or_else(|| format!("Evidence not found: {}", input.evidence_id))?;

    let evidence_hash = evidence.hash_sha256
        .as_deref()
        .unwrap_or("NO_HASH_AVAILABLE");

    // 2. Generate certificate ID and timestamp (IST)
    let cert_id = format!("CERT-{}", uuid::Uuid::new_v4());
    let timestamp = crate::core::time_authority::current_timestamp_iso8601();

    // 3. Build certificate with cryptographic seal
    let cert = certificate_engine::build_certificate(
        &cert_id, &input, evidence_hash, &timestamp,
    );

    // 4. Persist to encrypted database
    repository::insert_certificate(conn, &cert)
        .map_err(|e| format!("Certificate insert failed: {}", e))?;

    // 5. Append audit trail
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
    ).map_err(|e| format!("Audit log failed: {}", e))?;

    log::info!("Certificate sealed: {} for evidence {}", cert_id, input.evidence_id);

    Ok(cert)
}

/// Retrieves an existing certificate for a given evidence item
#[tauri::command]
pub fn get_certificate(
    db: State<DbState>,
    evidence_id: String,
) -> Result<Option<Certificate>, String> {
    let guard = db.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;
    repository::get_certificate_by_evidence(conn, &evidence_id)
        .map_err(|e| format!("Query failed: {}", e))
}
