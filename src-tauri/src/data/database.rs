use rusqlite::{Connection, Result};
use std::path::Path;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>);

pub fn init_db<P: AsRef<Path>>(path: P) -> Result<Connection> {
    let conn = Connection::open(path)?;
    
    // SECURITY: This static key is for DEVELOPMENT ONLY.
    // Before any production or government deployment, replace with PBKDF2-derived
    // key from user's master password via security::key_derivation module.
    // See PRD v6.0 §12 — "Master password → derived key (never stored on disk)"
    conn.pragma_update(None, "key", "malkhana-vault-2024-secure-key-v1")?;
    
    // Enable WAL mode — prevents database corruption on power loss
    // Critical for Indian police stations with unreliable electricity (PRD R8)
    conn.pragma_update(None, "journal_mode", "WAL")?;
    
    // Enable foreign key enforcement
    conn.pragma_update(None, "foreign_keys", "ON")?;
    
    // Verify encryption is working
    conn.execute("SELECT count(*) FROM sqlite_master;", [])?;
    
    // Run integrity check on startup — detect any corruption early
    let integrity: String = conn.query_row(
        "PRAGMA integrity_check;", [], |row| row.get(0)
    )?;
    if integrity != "ok" {
        log::error!("DATABASE INTEGRITY CHECK FAILED: {}", integrity);
        // In production, offer restore from backup here
    }
    
    // Execute schema initialization
    conn.execute_batch(crate::data::schema::SCHEMA)?;
    
    log::info!("Database initialized successfully (WAL mode, FK enforced)");
    
    Ok(conn)
}
