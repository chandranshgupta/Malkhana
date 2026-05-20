use serde::{Deserialize, Serialize};

// ============================================================
// USER / AUTH
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
    #[serde(skip_serializing)]  // Never send password hash to frontend
    pub password_hash: String,
    pub role: String,
    pub full_name: Option<String>,
    pub designation: Option<String>,
    pub organization: Option<String>,
    pub public_key: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================================
// CASE MANAGEMENT
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Case {
    pub id: String,
    pub cnr: Option<String>,
    pub fir_number: String,
    pub investigating_officer: String,
    pub jurisdiction: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

// ============================================================
// EVIDENCE
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Evidence {
    pub id: String,
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
    pub hash_sha512: Option<String>,
    pub seal_number: Option<String>,
    pub storage_location: Option<String>,
    pub device_metadata: Option<String>,
    pub status: String,
    pub seized_at: Option<String>,
    pub created_at: String,
}

// ============================================================
// CHAIN OF CUSTODY
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustodyEntry {
    pub id: String,
    pub evidence_id: String,
    pub from_person: Option<String>,
    pub to_person: String,
    pub role: String,
    pub organization: Option<String>,
    pub action: String,
    pub hash_at_transfer: Option<String>,
    pub hash_verified: bool,
    pub notes: Option<String>,
    pub signature: Option<String>,
    pub timestamp: String,
}

// ============================================================
// BSA SECTION 63 CERTIFICATE
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Certificate {
    pub id: String,
    pub evidence_id: String,
    // Part A
    pub custodian_name: String,
    pub custodian_parent: Option<String>,
    pub custodian_address: Option<String>,
    pub designation: String,
    pub seal_number: String,
    pub device_type: String,
    pub device_description: Option<String>,
    pub control_type: String,
    // Part B
    pub examiner_name: String,
    pub examiner_parent: Option<String>,
    pub examiner_address: Option<String>,
    pub lab_id: String,
    pub hash_algorithm: String,
    // Seal
    pub evidence_hash: String,
    pub document_hash: String,
    pub is_locked: bool,
    pub signed_at: Option<String>,
    pub created_at: String,
}

/// Input DTO for creating a certificate from the frontend
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CertificateInput {
    pub evidence_id: String,
    pub custodian_name: String,
    pub custodian_parent: Option<String>,
    pub custodian_address: Option<String>,
    pub designation: String,
    pub seal_number: String,
    pub device_type: String,
    pub device_description: Option<String>,
    pub control_type: String,
    pub examiner_name: String,
    pub examiner_parent: Option<String>,
    pub examiner_address: Option<String>,
    pub lab_id: String,
    pub hash_algorithm: String,
}

// ============================================================
// SEALED ARCHIVE MATRIX
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ArchiveSlot {
    pub location: String,
    pub evidence_id: Option<String>,
    pub vault_level: i32,
    pub status: String,
    pub assigned_at: Option<String>,
}

// ============================================================
// AUDIT LOG
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditLogEntry {
    pub id: i64,
    pub event_type: String,
    pub entity_type: String,
    pub entity_id: String,
    pub actor: String,
    pub details: Option<String>,
    pub prev_hash: Option<String>,
    pub entry_hash: Option<String>,
    pub timestamp: String,
}

// ============================================================
// SETTINGS
// ============================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub category: String,
    pub is_locked: bool,
    pub updated_at: String,
}

// ============================================================
// UI-SPECIFIC VIEW MODELS (for frontend rendering)
// ============================================================

/// Evidence card as displayed in the EvidenceLog view
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EvidenceCard {
    pub id: String,
    pub title: String,
    pub desc: String,
    pub tags: Vec<String>,
    pub image_comp_type: String,
    pub stamp: EvidenceStamp,
    pub alert: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EvidenceStamp {
    pub text: String,
    pub r#type: String,
    pub rotate: String,
}

/// Lightweight evidence summary for dropdowns/selectors
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EvidenceSummary {
    pub id: String,
    pub title: String,
    pub asset_type: String,
    pub hash_sha256: Option<String>,
    pub seal_number: Option<String>,
    pub case_fir: Option<String>,
}
