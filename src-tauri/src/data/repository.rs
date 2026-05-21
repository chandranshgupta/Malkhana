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

/// Save a new evidence item to the database
pub fn insert_evidence(conn: &Connection, ev: &Evidence) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO evidence (id, case_id, asset_type, title, description, tags,
            device_make, device_model, device_color, device_serial, device_imei,
            physical_condition, hash_sha256, hash_md5, hash_sha512,
            seal_number, storage_location, device_metadata, status, seized_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21)",
        params![
            ev.id, ev.case_id, ev.asset_type, ev.title, ev.description, ev.tags,
            ev.device_make, ev.device_model, ev.device_color, ev.device_serial, ev.device_imei,
            ev.physical_condition, ev.hash_sha256, ev.hash_md5, ev.hash_sha512,
            ev.seal_number, ev.storage_location, ev.device_metadata, ev.status,
            ev.seized_at, ev.created_at
        ],
    )?;
    Ok(())
}

/// Save a custody transfer record
pub fn insert_custody_entry(conn: &Connection, entry: &CustodyEntry) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role,
            organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            entry.id, entry.evidence_id, entry.from_person, entry.to_person, entry.role,
            entry.organization, entry.action, entry.hash_at_transfer,
            if entry.hash_verified { 1 } else { 0 },
            entry.notes, entry.signature, entry.timestamp
        ],
    )?;
    Ok(())
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

/// Get all users
pub fn get_all_users(conn: &Connection) -> Result<Vec<User>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, role, full_name, designation, organization, public_key, is_active, created_at, updated_at
         FROM users WHERE is_active = 1"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            password_hash: row.get(2)?,
            role: row.get(3)?,
            full_name: row.get(4)?,
            designation: row.get(5)?,
            organization: row.get(6)?,
            public_key: row.get(7)?,
            is_active: row.get::<_, i32>(8)? != 0,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    rows.collect()
}

/// Retrieve custody entries ordered chronologically for a specific evidence item
pub fn get_custody_chain_for_evidence(conn: &Connection, evidence_id: &str) -> Result<Vec<CustodyEntry>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, evidence_id, from_person, to_person, role, organization, action,
                hash_at_transfer, hash_verified, notes, signature, timestamp
         FROM custody_chain
         WHERE evidence_id = ?1
         ORDER BY timestamp ASC"
    )?;

    let rows = stmt.query_map(params![evidence_id], |row| {
        Ok(CustodyEntry {
            id: row.get(0)?,
            evidence_id: row.get(1)?,
            from_person: row.get(2)?,
            to_person: row.get(3)?,
            role: row.get(4)?,
            organization: row.get(5)?,
            action: row.get(6)?,
            hash_at_transfer: row.get(7)?,
            hash_verified: row.get::<_, i32>(8)? != 0,
            notes: row.get(9)?,
            signature: row.get(10)?,
            timestamp: row.get(11)?,
        })
    })?;

    rows.collect()
}

/// Retrieve all slots in the archive_matrix
pub fn get_all_archive_slots(conn: &Connection) -> Result<Vec<ArchiveSlot>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT location, evidence_id, vault_level, status, assigned_at
         FROM archive_matrix"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ArchiveSlot {
            location: row.get(0)?,
            evidence_id: row.get(1)?,
            vault_level: row.get(2)?,
            status: row.get(3)?,
            assigned_at: row.get(4)?,
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
    // Retrieve the previous entry's hash to form a secure cryptographic chain.
    // If it's the genesis entry, use a zeroed-out SHA-256 seed.
    let prev_hash: String = conn.query_row(
        "SELECT entry_hash FROM audit_log ORDER BY id DESC LIMIT 1",
        [],
        |row| row.get(0)
    ).unwrap_or_else(|_| "0000000000000000000000000000000000000000000000000000000000000000".to_string());

    let details_str = details.unwrap_or("");
    let entry_hash = crate::core::merkle_tree::compute_entry_hash(
        &prev_hash,
        event_type,
        entity_type,
        entity_id,
        actor,
        details_str
    );

    conn.execute(
        "INSERT INTO audit_log (event_type, entity_type, entity_id, actor, details, prev_hash, entry_hash)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![event_type, entity_type, entity_id, actor, details, prev_hash, entry_hash],
    )?;
    Ok(())
}

/// Retrieve all audit log entries (newest first)
pub fn get_all_audit_logs(conn: &Connection) -> Result<Vec<crate::data::models::AuditLogEntry>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, event_type, entity_type, entity_id, actor, details, prev_hash, entry_hash, timestamp FROM audit_log ORDER BY id DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(crate::data::models::AuditLogEntry {
            id: row.get(0)?,
            event_type: row.get(1)?,
            entity_type: row.get(2)?,
            entity_id: row.get(3)?,
            actor: row.get(4)?,
            details: row.get(5)?,
            prev_hash: row.get(6)?,
            entry_hash: row.get(7)?,
            timestamp: row.get(8)?,
        })
    })?;
    let mut logs = Vec::new();
    for r in rows {
        logs.push(r?);
    }
    Ok(logs)
}

/// Verify the entire Merkle audit trail for content and link integrity.
/// Returns Ok(None) if the chain is fully verified and uncompromised.
/// Returns Ok(Some((compromised_id, reason))) if any link or value mismatch is found.
pub fn verify_audit_trail(conn: &Connection) -> Result<Option<(i64, String)>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, event_type, entity_type, entity_id, actor, details, prev_hash, entry_hash FROM audit_log ORDER BY id ASC"
    )?;
    let rows = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, Option<String>>(5)?,
            row.get::<_, Option<String>>(6)?,
            row.get::<_, Option<String>>(7)?,
        ))
    })?;

    let mut expected_prev = "0000000000000000000000000000000000000000000000000000000000000000".to_string();
    for r in rows {
        let (id, event_type, entity_type, entity_id, actor, details, prev_hash, entry_hash) = r?;
        let prev_hash_val = prev_hash.unwrap_or_default();
        let entry_hash_val = entry_hash.unwrap_or_default();

        // 1. Verify link back to previous element hash
        if prev_hash_val != expected_prev {
            return Ok(Some((id, format!("Hash link broken. Expected prev_hash: {}, got: {}", expected_prev, prev_hash_val))));
        }

        // 2. Re-compute SHA-256 for local content verification
        let details_str = details.unwrap_or_default();
        let computed = crate::core::merkle_tree::compute_entry_hash(
            &prev_hash_val,
            &event_type,
            &entity_type,
            &entity_id,
            &actor,
            &details_str
        );
        if computed != entry_hash_val {
            return Ok(Some((id, format!("Entry content hash mismatch. Computed: {}, stored: {}", computed, entry_hash_val))));
        }

        expected_prev = entry_hash_val;
    }

    Ok(None)
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
    let now = "2026-05-17T14:30:00+05:30";

    // 1. Seed forensic users if table is empty
    let user_count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))?;
    if user_count == 0 {
        log::info!("Seeding demo users...");
        let roles_and_names = vec![
            ("op_092", "MALKHANA_INCHARGE", "OPERATOR_092", "Malkhana In-charge"),
            ("io_rajesh", "IO", "SI Rajesh Sharma", "Sub-Inspector"),
            ("dr_vance", "FSL_EXAMINER", "DR. A. VANCE", "Lead Forensic Examiner"),
            ("admin", "ADMIN", "Administrator", "System Administrator"),
        ];
        for (uname, role, name, desg) in roles_and_names {
            let pass_hash = crate::security::password::hash_password(uname).unwrap_or_else(|_| "invalid_hash".to_string());
            conn.execute(
                "INSERT OR IGNORE INTO users (id, username, password_hash, role, full_name, designation, organization)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![uname, uname, pass_hash, role, name, desg, "Forensic Central"],
            )?;
        }
    }

    // 1b. Seed officer profiles if table is empty
    let officer_count: i64 = conn.query_row("SELECT COUNT(*) FROM officer_profiles", [], |r| r.get(0))?;
    if officer_count == 0 {
        log::info!("Seeding demo officer profiles...");
        let officers = vec![
            ("admin", "admin", "Administrator", "Administrator", "111111"),
            ("op_092", "op_092", "OPERATOR_092", "Operator", "092092"),
            ("io_rajesh", "io_rajesh", "SI Rajesh Sharma", "Sub-Inspector", "112233"),
            ("dr_vance", "dr_vance", "DR. A. VANCE", "Examiner", "445566"),
        ];
        for (id, batch_no, name, rank, pin) in officers {
            let pin_hash = crate::security::password::hash_password(pin).unwrap_or_else(|_| "invalid_hash".to_string());
            conn.execute(
                "INSERT OR IGNORE INTO officer_profiles (id, batch_no, full_name, rank, unit, jurisdiction, pin_hash)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![id, batch_no, name, rank, "Forensic Central", "Forensic Jurisdiction", pin_hash],
            )?;
        }
    }

    // 2. Seed a demo case if table is empty
    let case_count: i64 = conn.query_row("SELECT COUNT(*) FROM cases", [], |r| r.get(0))?;
    if case_count == 0 {
        log::info!("Seeding demo cases...");
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
    }

    // 3. Seed evidence if table is empty
    let evidence_count: i64 = conn.query_row("SELECT COUNT(*) FROM evidence", [], |r| r.get(0))?;
    if evidence_count == 0 {
        log::info!("Seeding demo evidence...");
        conn.execute(
            "INSERT INTO evidence (id, case_id, asset_type, title, description, tags, device_make, device_model, hash_sha256, hash_md5, seal_number, storage_location, status, seized_at, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                "S50-9926-X1", "CASE-001", "DISK",
                "1TB_NVME_SSD",
                "Seized from location Alpha-9. Primary storage for workstation suspect-01. Physical casing intact, no signs of tampering.",
                "[\"CAPACITY: 1024GB\", \"INTERFACE: PCIE_X4\"]",
                "Samsung", "980 PRO",
                "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a",
                "d41d8cd98f00b204e9800998ecf8427e",
                "SEAL-2026-0192-A", "R5-C8", "ACTIVE", now, now,
            ],
        )?;

        conn.execute(
            "INSERT INTO evidence (id, case_id, asset_type, title, description, tags, device_make, device_model, device_imei, hash_sha256, hash_md5, seal_number, storage_location, status, seized_at, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            params![
                "MOB-1142-922", "CASE-001", "MOBILE",
                "SAMSUNG_S22_ULTRA",
                "Recovered from vehicle search. Screen damaged but functional. Multiple failed login attempts recorded in vault log.",
                "[\"OS: ANDROID_13\", \"SIGNAL: ISOLATED\"]",
                "Samsung", "Galaxy S22 Ultra", "354123098765432",
                "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
                "098f6bcd4621d373cade4e832627b4f6",
                "SEAL-2026-0192-B", "R2-C3", "ACTIVE", now, now,
            ],
        )?;

        conn.execute(
            "INSERT INTO evidence (id, case_id, asset_type, title, description, tags, device_make, device_model, hash_sha256, hash_md5, seal_number, storage_location, status, seized_at, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
            params![
                "DVR-4402-2Y", "CASE-001", "CCTV",
                "SONY_CCTV_DVR_R4",
                "Seized from retail location during incident investigation. 4-channel continuous recording. Password bypass pending.",
                "[\"CHANNELS: 04\", \"FORMAT: H.264\"]",
                "Sony", "DVR-R4",
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "c4ca4238a0b923820dcc509a6f75849b",
                "SEAL-2026-0192-C", "R8-C12", "ACTIVE", now, now,
            ],
        )?;
    }

    // 4. Seed archive matrix if empty
    let matrix_count: i64 = conn.query_row("SELECT COUNT(*) FROM archive_matrix", [], |r| r.get(0))?;
    if matrix_count == 0 {
        log::info!("Seeding archive matrix...");
        conn.execute(
            "INSERT OR IGNORE INTO archive_matrix (location, evidence_id, status, vault_level, assigned_at)
             VALUES ('R5-C8', 'S50-9926-X1', 'SEALED', 3, ?1)",
            params![now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO archive_matrix (location, evidence_id, status, vault_level, assigned_at)
             VALUES ('R2-C3', 'MOB-1142-922', 'SEALED', 3, ?1)",
            params![now],
        )?;
        conn.execute(
            "INSERT OR IGNORE INTO archive_matrix (location, evidence_id, status, vault_level, assigned_at)
             VALUES ('R8-C12', 'DVR-4402-2Y', 'SEALED', 3, ?1)",
            params![now],
        )?;
    }

    // 5. Seed detailed custody chains if empty
    let chain_count: i64 = conn.query_row("SELECT COUNT(*) FROM custody_chain", [], |r| r.get(0))?;
    if chain_count == 0 {
        log::info!("Seeding custody chain...");
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-001', 'MOB-1142-922', NULL, 'SI Rajesh Sharma', 'SEIZING_OFFICER', 'Delhi Police', 'SEIZED', 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9', 1, 'Initial forensic seizure', 'SIG_RAJESH', '2026-05-17T10:00:00+05:30')",
            [],
        )?;
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-002', 'MOB-1142-922', 'SI Rajesh Sharma', 'OPERATOR_092', 'INTAKE_CLERK', 'Forensic Central', 'TRANSFERRED', 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9', 1, 'Transferred to Malkhana secure storage', 'SIG_OP092', '2026-05-17T11:30:00+05:30')",
            [],
        )?;
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-003', 'MOB-1142-922', 'OPERATOR_092', 'DR. A. VANCE', 'EXAMINER', 'Cyber Lab', 'TRANSFERRED', 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9', 1, 'Assigned to Lead Examiner for logical extraction', 'SIG_VANCE', '2026-05-17T14:30:00+05:30')",
            [],
        )?;

        // For SSD: SI Rajesh Sharma -> OPERATOR_092
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-004', 'S50-9926-X1', NULL, 'SI Rajesh Sharma', 'SEIZING_OFFICER', 'Delhi Police', 'SEIZED', 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a', 1, 'Seized at scene', 'SIG_RAJESH', '2026-05-17T10:00:00+05:30')",
            [],
        )?;
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-005', 'S50-9926-X1', 'SI Rajesh Sharma', 'OPERATOR_092', 'INTAKE_CLERK', 'Forensic Central', 'TRANSFERRED', 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a', 1, 'Ingested into central vault storage', 'SIG_OP092', '2026-05-17T12:00:00+05:30')",
            [],
        )?;

        // For DVR: SI Rajesh Sharma -> OPERATOR_092
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-006', 'DVR-4402-2Y', NULL, 'SI Rajesh Sharma', 'SEIZING_OFFICER', 'Delhi Police', 'SEIZED', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, 'Seized from retail DVR rack', 'SIG_RAJESH', '2026-05-17T10:00:00+05:30')",
            [],
        )?;
        conn.execute(
            "INSERT INTO custody_chain (id, evidence_id, from_person, to_person, role, organization, action, hash_at_transfer, hash_verified, notes, signature, timestamp)
             VALUES ('CUST-007', 'DVR-4402-2Y', 'SI Rajesh Sharma', 'OPERATOR_092', 'INTAKE_CLERK', 'Forensic Central', 'TRANSFERRED', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, 'Vault intake logged', 'SIG_OP092', '2026-05-17T12:15:00+05:30')",
            [],
        )?;
    }

    // Seed audit log entry
    conn.execute(
        "INSERT INTO audit_log (event_type, entity_type, entity_id, actor, details)
         VALUES ('SYSTEM_INIT', 'SYSTEM', 'VAULT', 'SYSTEM', 'Database initialized with seed data')",
        [],
    )?;

    log::info!("Seed data checked and updated");
    Ok(())
}
