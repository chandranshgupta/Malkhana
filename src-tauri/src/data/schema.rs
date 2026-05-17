/// Database schema for Malkhana Vault — BSA Section 63 Compliant
/// Aligned with PRD v6.0 §11 Database Schema
/// 
/// FORENSIC: All tables use TEXT PRIMARY KEY (UUID v4) for non-sequential IDs.
/// FORENSIC: No DELETE operations allowed — enforced at application level.
/// FORENSIC: All timestamps stored as ISO 8601 TEXT in IST (UTC+05:30).
pub const SCHEMA: &str = r#"

-- ============================================================
-- CORE IDENTITY
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('IO', 'MALKHANA_INCHARGE', 'FSL_EXAMINER', 'COURT_CLERK', 'SUPERVISOR', 'ADMIN')),
    full_name TEXT,
    designation TEXT,
    organization TEXT,
    public_key TEXT,
    is_active INTEGER DEFAULT 1,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
);

-- ============================================================
-- CASE MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    cnr TEXT UNIQUE,                           -- Computerized Node Record
    fir_number TEXT NOT NULL,
    investigating_officer TEXT NOT NULL,
    jurisdiction TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SEALED', 'DISPOSED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
);

-- ============================================================
-- EVIDENCE REGISTRY
-- ============================================================

CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK(asset_type IN ('DISK', 'MOBILE', 'CCTV', 'USB', 'CLOUD', 'FILES', 'OTHER')),
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT,                                 -- JSON array string
    device_make TEXT,
    device_model TEXT,
    device_color TEXT,
    device_serial TEXT,
    device_imei TEXT,
    physical_condition TEXT,
    hash_sha256 TEXT,
    hash_md5 TEXT,
    hash_sha512 TEXT,
    seal_number TEXT,
    storage_location TEXT,                    -- Matrix coordinate (R5-C8)
    device_metadata TEXT,                     -- JSON (additional fields)
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SEALED', 'ARCHIVED', 'DISPOSED')),
    seized_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- ============================================================
-- CHAIN OF CUSTODY
-- ============================================================

CREATE TABLE IF NOT EXISTS custody_chain (
    id TEXT PRIMARY KEY,
    evidence_id TEXT NOT NULL,
    from_person TEXT,
    to_person TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SEIZING_OFFICER', 'INTAKE_CLERK', 'EXAMINER', 'ANALYST', 'SUPERVISOR', 'COURT')),
    organization TEXT,
    action TEXT NOT NULL CHECK(action IN ('SEIZED', 'TRANSFERRED', 'EXAMINED', 'SEALED', 'RETURNED', 'DISPOSED')),
    hash_at_transfer TEXT,                    -- Hash verification at this custody point
    hash_verified INTEGER DEFAULT 0,          -- Boolean: H(n) == H(n-1)
    notes TEXT,
    signature TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
);

-- ============================================================
-- BSA SECTION 63 CERTIFICATES
-- ============================================================

CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    evidence_id TEXT NOT NULL,
    -- Part A: Custodian / Party details
    custodian_name TEXT NOT NULL,
    custodian_parent TEXT,                     -- S/o, D/o, W/o
    custodian_address TEXT,
    designation TEXT NOT NULL,
    seal_number TEXT NOT NULL,
    device_type TEXT NOT NULL,
    device_description TEXT,                  -- Make, model, color, serial
    control_type TEXT DEFAULT 'MAINTAINED',
    -- Part B: Expert / Examiner details
    examiner_name TEXT NOT NULL,
    examiner_parent TEXT,
    examiner_address TEXT,
    lab_id TEXT NOT NULL,
    hash_algorithm TEXT DEFAULT 'SHA-256',
    -- Seal metadata
    evidence_hash TEXT NOT NULL,              -- Hash of the evidence at time of certification
    document_hash TEXT NOT NULL,              -- Cryptographic signature of the certificate content
    is_locked INTEGER DEFAULT 0,
    signed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes')),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
);

-- ============================================================
-- SEALED ARCHIVE MATRIX
-- ============================================================

CREATE TABLE IF NOT EXISTS archive_matrix (
    location TEXT PRIMARY KEY,                -- R5-C8 format
    evidence_id TEXT,
    vault_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'EMPTY' CHECK(status IN ('EMPTY', 'OCCUPIED', 'SEALED')),
    assigned_at TEXT,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
);

-- ============================================================
-- APPEND-ONLY AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT,                             -- JSON
    prev_hash TEXT,                           -- Merkle chain: hash of previous entry
    entry_hash TEXT,                          -- Merkle chain: hash of this entry
    timestamp TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
    -- FORENSIC: NO DELETE allowed — append-only enforced at app level
);

-- ============================================================
-- APPLICATION SETTINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('FORENSIC_ENGINE', 'SYNC', 'WORKFLOW', 'LEGAL', 'UI')),
    is_locked INTEGER DEFAULT 0,              -- Legal compliance settings cannot be changed
    updated_at TEXT NOT NULL DEFAULT (datetime('now', '+5 hours', '+30 minutes'))
);

-- ============================================================
-- DEFAULT SETTINGS (seed on first run)
-- ============================================================

INSERT OR IGNORE INTO settings (key, value, category, is_locked) VALUES
    ('hash_algorithm', 'SHA-256', 'FORENSIC_ENGINE', 1),
    ('dual_hash_enabled', 'true', 'FORENSIC_ENGINE', 1),
    ('timezone', 'IST', 'FORENSIC_ENGINE', 1),
    ('imager_tool', 'dc3dd', 'FORENSIC_ENGINE', 0),
    ('thread_count', '4', 'FORENSIC_ENGINE', 0),
    ('auto_verify_on_transfer', 'true', 'WORKFLOW', 1),
    ('append_only_audit', 'true', 'LEGAL', 1),
    ('bsa_section_63_format', 'v2023', 'LEGAL', 1);

"#;
