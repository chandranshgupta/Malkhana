use sha2::{Sha256, Digest};
use crate::data::models::{Certificate, CertificateInput};

/// FORENSIC: Computes a SHA-256 document seal hash over all certificate fields.
/// This hash proves the certificate content has not been altered after sealing.
/// Any change to any field will produce a completely different hash.
pub fn compute_document_hash(
    input: &CertificateInput,
    evidence_hash: &str,
    timestamp: &str,
    compliance_note: Option<&str>,
) -> String {
    let mut hasher = Sha256::new();

    // Hash all certificate fields in a deterministic order
    hasher.update(input.evidence_id.as_bytes());
    hasher.update(b"|");
    hasher.update(input.custodian_name.as_bytes());
    hasher.update(b"|");
    hasher.update(input.custodian_parent.as_deref().unwrap_or("").as_bytes());
    hasher.update(b"|");
    hasher.update(input.custodian_address.as_deref().unwrap_or("").as_bytes());
    hasher.update(b"|");
    hasher.update(input.designation.as_bytes());
    hasher.update(b"|");
    hasher.update(input.seal_number.as_bytes());
    hasher.update(b"|");
    hasher.update(input.device_type.as_bytes());
    hasher.update(b"|");
    hasher.update(input.device_description.as_deref().unwrap_or("").as_bytes());
    hasher.update(b"|");
    hasher.update(input.control_type.as_bytes());
    hasher.update(b"|");
    hasher.update(input.examiner_name.as_bytes());
    hasher.update(b"|");
    hasher.update(input.examiner_parent.as_deref().unwrap_or("").as_bytes());
    hasher.update(b"|");
    hasher.update(input.examiner_address.as_deref().unwrap_or("").as_bytes());
    hasher.update(b"|");
    hasher.update(input.lab_id.as_bytes());
    hasher.update(b"|");
    hasher.update(input.hash_algorithm.as_bytes());
    hasher.update(b"|");
    hasher.update(evidence_hash.as_bytes());
    hasher.update(b"|");
    hasher.update(timestamp.as_bytes());
    hasher.update(b"|");
    hasher.update(compliance_note.unwrap_or("").as_bytes());

    format!("{:x}", hasher.finalize())
}

/// Builds a complete Certificate struct from input, evidence hash, and computed seal
pub fn build_certificate(
    cert_id: &str,
    input: &CertificateInput,
    evidence_hash: &str,
    timestamp: &str,
    compliance_note: Option<String>,
) -> Certificate {
    let document_hash = compute_document_hash(input, evidence_hash, timestamp, compliance_note.as_deref());

    Certificate {
        id: cert_id.to_string(),
        evidence_id: input.evidence_id.clone(),
        custodian_name: input.custodian_name.clone(),
        custodian_parent: input.custodian_parent.clone(),
        custodian_address: input.custodian_address.clone(),
        designation: input.designation.clone(),
        seal_number: input.seal_number.clone(),
        device_type: input.device_type.clone(),
        device_description: input.device_description.clone(),
        control_type: input.control_type.clone(),
        examiner_name: input.examiner_name.clone(),
        examiner_parent: input.examiner_parent.clone(),
        examiner_address: input.examiner_address.clone(),
        lab_id: input.lab_id.clone(),
        hash_algorithm: input.hash_algorithm.clone(),
        evidence_hash: evidence_hash.to_string(),
        document_hash,
        is_locked: true,
        signed_at: Some(timestamp.to_string()),
        compliance_note,
        created_at: timestamp.to_string(),
    }
}
