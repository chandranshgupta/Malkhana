use rusqlite::{Connection, params};
use crate::data::models::*;

// ============================================================
// EVIDENCE QUERIES
// ============================================================

/// Get all evidence items, joining case info for display
pub fn get_all_evidence(conn: &Connection) -> Result<Vec<Evidence>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, case_id, asset_type, title, description, tags,
                device_make, device_model, device_color, device_serial, device_imei,
                physical_condition, hash_sha256, hash_md5, hash_sha512,
                seal_number, storage_location, device_metadata, status,
                seized_at, created_at
         FROM evidence ORDER BY created_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Evidence {
            id: row.get(0)?,
            case_id: row.get(1)?,
            asset_type: row.get(2)?,
            title: row.get(3)?,
            description: row.get(4)?,
            tags: row.get(5)?,
            device_make: row.get(6)?,
            device_model: row.get(7)?,
            device_color: row.get(8)?,
            device_serial: row.get(9)?,
            device_imei: row.get(10)?,
            physical_condition: row.get(11)?,
            hash_sha256: row.get(12)?,
            hash_md5: row.get(13)?,
            hash_sha512: row.get(14)?,
            seal_number: row.get(15)?,
            storage_location: row.get(16)?,
            device_metadata: row.get(17)?,
            status: row.get(18)?,
            seized_at: row.get(19)?,
            created_at: row.get(20)?,
        })
    })?;

    rows.collect()
}

/// Get lightweight evidence summaries for certificate dropdown selector
pub fn get_evidence_summaries(conn: &Connection) -> Result<Vec<EvidenceSummary>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT e.id, e.title, e.asset_type, e.hash_sha256, e.seal_number, c.fir_number
         FROM evidence e
         LEFT JOIN cases c ON e.case_id = c.id
         ORDER BY e.created_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(EvidenceSummary {
            id: row.get(0)?,
            title: row.get(1)?,
            asset_type: row.get(2)?,
            hash_sha256: row.get(3)?,
            seal_number: row.get(4)?,
            case_fir: row.get(5)?,
        })
    })?;

    rows.collect()
}

/// Get a single evidence item by ID
pub fn get_evidence_by_id(conn: &Connection, id: &str) -> Result<Option<Evidence>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, case_id, asset_type, title, description, tags,
                device_make, device_model, device_color, device_serial, device_imei,
                physical_condition, hash_sha256, hash_md5, hash_sha512,
                seal_number, storage_location, device_metadata, status,
                seized_at, created_at
         FROM evidence WHERE id = ?1"
    )?;

    let mut rows = stmt.query_map(params![id], |row| {
        Ok(Evidence {
            id: row.get(0)?,
            case_id: row.get(1)?,
            asset_type: row.get(2)?,
            title: row.get(3)?,
            description: row.get(4)?,
            tags: row.get(5)?,
            device_make: row.get(6)?,
            device_model: row.get(7)?,
            device_color: row.get(8)?,
            device_serial: row.get(9)?,
            device_imei: row.get(10)?,
            physical_condition: row.get(11)?,
            hash_sha256: row.get(12)?,
            hash_md5: row.get(13)?,
            hash_sha512: row.get(14)?,
            seal_number: row.get(15)?,
            storage_location: row.get(16)?,
            device_metadata: row.get(17)?,
            status: row.get(18)?,
            seized_at: row.get(19)?,
            created_at: row.get(20)?,
        })
    })?;

    match rows.next() {
        Some(row) => Ok(Some(row?)),
        None => Ok(None),
    }
}

// ============================================================
// CERTIFICATE QUERIES
// ============================================================

/// Save a sealed certificate to the database
pub fn insert_certificate(conn: &Connection, cert: &Certificate) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO certificates (id, evidence_id, custodian_name, custodian_parent,
            custodian_address, designation, seal_number, device_type, device_description,
            control_type, examiner_name, examiner_parent, examiner_address, lab_id,
            hash_algorithm, evidence_hash, document_hash, is_locked, signed_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
        params![
            cert.id, cert.evidence_id, cert.custodian_name, cert.custodian_parent,
            cert.custodian_address, cert.designation, cert.seal_number, cert.device_type,
            cert.device_description, cert.control_type, cert.examiner_name, cert.examiner_parent,
            cert.examiner_address, cert.lab_id, cert.hash_algorithm, cert.evidence_hash,
            cert.document_hash, cert.is_locked, cert.signed_at, cert.created_at,
        ],
    )?;
    Ok(())
}

/// Get certificate by evidence_id
pub fn get_certificate_by_evidence(conn: &Connection, evidence_id: &str) -> Result<Option<Certificate>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, evidence_id, custodian_name, custodian_parent, custodian_address,
                designation, seal_number, device_type, device_description, control_type,
                examiner_name, examiner_parent, examiner_address, lab_id, hash_algorithm,
                evidence_hash, document_hash, is_locked, signed_at, created_at
         FROM certificates WHERE evidence_id = ?1 ORDER BY created_at DESC LIMIT 1"
    )?;

    let mut rows = stmt.query_map(params![evidence_id], |row| {
        Ok(Certificate {
            id: row.get(0)?,
            evidence_id: row.get(1)?,
            custodian_name: row.get(2)?,
            custodian_parent: row.get(3)?,
            custodian_address: row.get(4)?,
            designation: row.get(5)?,
            seal_number: row.get(6)?,
            device_type: row.get(7)?,
            device_description: row.get(8)?,
            control_type: row.get(9)?,
            examiner_name: row.get(10)?,
            examiner_parent: row.get(11)?,
            examiner_address: row.get(12)?,
            lab_id: row.get(13)?,
            hash_algorithm: row.get(14)?,
            evidence_hash: row.get(15)?,
            document_hash: row.get(16)?,
            is_locked: row.get(17)?,
            signed_at: row.get(18)?,
            created_at: row.get(19)?,
        })
    })?;

    match rows.next() {
        Some(row) => Ok(Some(row?)),
        None => Ok(None),
    }
}

// ============================================================
// CASE QUERIES
// ============================================================

/// Insert a new case
pub fn insert_case(conn: &Connection, case: &Case) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO cases (id, cnr, fir_number, investigating_officer, jurisdiction,
            title, description, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            case.id, case.cnr, case.fir_number, case.investigating_officer,
            case.jurisdiction, case.title, case.description, case.status,
            case.created_at, case.updated_at,
        ],
    )?;
    Ok(())
}

/// Get all cases
pub fn get_all_cases(conn: &Connection) -> Result<Vec<Case>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, cnr, fir_number, investigating_officer, jurisdiction,
                title, description, status, created_at, updated_at
         FROM cases ORDER BY created_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Case {
            id: row.get(0)?,
            cnr: row.get(1)?,
            fir_number: row.get(2)?,
            investigating_officer: row.get(3)?,
            jurisdiction: row.get(4)?,
            title: row.get(5)?,
            description: row.get(6)?,
            status: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    rows.collect()
}

// ============================================================
// AUDIT LOG
// ============================================================

/// Append an entry to the audit log (NEVER delete)
pub fn append_audit_log(
    conn: &Connection,
    event_type: &str,
    entity_type: &str,
    entity_id: &str,
    actor: &str,
    details: Option<&str>,
) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO audit_log (event_type, entity_type, entity_id, actor, details)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![event_type, entity_type, entity_id, actor, details],
    )?;
    Ok(())
}

// ============================================================
// SETTINGS
// ============================================================

/// Get all settings
pub fn get_all_settings(conn: &Connection) -> Result<Vec<Setting>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT key, value, category, is_locked, updated_at FROM settings ORDER BY category, key"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Setting {
            key: row.get(0)?,
            value: row.get(1)?,
            category: row.get(2)?,
            is_locked: row.get(3)?,
            updated_at: row.get(4)?,
        })
    })?;

    rows.collect()
}

/// Update a single setting (respects is_locked)
pub fn update_setting(conn: &Connection, key: &str, value: &str) -> Result<bool, rusqlite::Error> {
    let changed = conn.execute(
        "UPDATE settings SET value = ?1, updated_at = datetime('now', '+5 hours', '+30 minutes')
         WHERE key = ?2 AND is_locked = 0",
        params![value, key],
    )?;
    Ok(changed > 0)
}

// ============================================================
// SEED DATA (for first-run / demo mode)
// ============================================================

/// Seeds sample data if the database is completely empty
pub fn seed_if_empty(conn: &Connection) -> Result<(), rusqlite::Error> {
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM cases", [], |r| r.get(0))?;
    if count > 0 {
        return Ok(());
    }

    log::info!("Empty database detected — seeding demo data for first run");

    let now = "2026-05-17T14:30:00+05:30";

    // Seed a demo case
    conn.execute(
        "INSERT INTO cases (id, cnr, fir_number, investigating_officer, jurisdiction, title, description, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            "CASE-001", "DLSE01-001234-2026", "FIR/2026/0192",
            "SI Rajesh Sharma", "South-East Delhi",
            "CYBER_FRAUD_INVESTIGATION", "Digital fraud involving unauthorized access to banking systems",
            "ACTIVE", now, now,
        ],
    )?;

    // Seed evidence items matching the existing UI cards
    conn.execute(
        "INSERT INTO evidence (id, case_id, asset_type, title, description, tags, device_make, device_model, hash_sha256, hash_md5, seal_number, status, seized_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
        params![
            "S50-9926-X1", "CASE-001", "DISK",
            "1TB_NVME_SSD",
            "Seized from location Alpha-9. Primary storage for workstation suspect-01. Physical casing intact, no signs of tampering.",
            "[\"CAPACITY: 1024GB\", \"INTERFACE: PCIE_X4\"]",
            "Samsung", "980 PRO",
            "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
            "d41d8cd98f00b204e9800998ecf8427e",
            "SEAL-2026-0192-A", "ACTIVE", now, now,
        ],
    )?;

    conn.execute(
        "INSERT INTO evidence (id, case_id, asset_type, title, description, tags, device_make, device_model, device_imei, hash_sha256, hash_md5, seal_number, status, seized_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
        params![
            "MOB-1142-922", "CASE-001", "MOBILE",
            "SAMSUNG_S22_ULTRA",
            "Recovered from vehicle search. Screen damaged but functional. Multiple failed login attempts recorded in vault log.",
            "[\"OS: ANDROID_13\", \"SIGNAL: ISOLATED\"]",
            "Samsung", "Galaxy S22 Ultra", "354123098765432",
            "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
            "098f6bcd4621d373cade4e832627b4f6",
            "SEAL-2026-0192-B", "ACTIVE", now, now,
        ],
    )?;

    conn.execute(
        "INSERT INTO evidence (id, case_id, asset_type, title, description, tags, device_make, device_model, hash_sha256, hash_md5, seal_number, status, seized_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
        params![
            "DVR-4402-2Y", "CASE-001", "CCTV",
            "SONY_CCTV_DVR_R4",
            "Seized from retail location during incident investigation. 4-channel continuous recording. Password bypass pending.",
            "[\"CHANNELS: 04\", \"FORMAT: H.264\"]",
            "Sony", "DVR-R4",
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "c4ca4238a0b923820dcc509a6f75849b",
            "SEAL-2026-0192-C", "ACTIVE", now, now,
        ],
    )?;

    // Seed audit log entry
    conn.execute(
        "INSERT INTO audit_log (event_type, entity_type, entity_id, actor, details)
         VALUES ('SYSTEM_INIT', 'SYSTEM', 'VAULT', 'SYSTEM', 'Database initialized with seed data')",
        [],
    )?;

    log::info!("Seed data inserted: 1 case, 3 evidence items");
    Ok(())
}
