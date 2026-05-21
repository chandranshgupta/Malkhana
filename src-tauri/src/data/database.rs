use rusqlite::{Connection, Result};
use std::path::Path;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Option<Connection>>);

/// Decrypts, opens, verifies, and initializes the SQLCipher database.
pub fn open_db_with_key<P: AsRef<Path>>(path: P, key: &str) -> Result<Connection> {
    let conn = Connection::open(path)?;
    
    conn.pragma_update(None, "key", key)?;
    
    // Enable WAL mode — prevents database corruption on power loss
    // Critical for Indian police stations with unreliable electricity (PRD R8)
    conn.pragma_update(None, "journal_mode", "WAL")?;
    
    // Enable foreign key enforcement
    conn.pragma_update(None, "foreign_keys", "ON")?;
    
    // Verify encryption is working by running a simple query
    let _: i64 = conn.query_row("SELECT count(*) FROM sqlite_master;", [], |row| row.get(0))?;
    
    // Run integrity check on startup — detect any corruption early
    let integrity: String = conn.query_row(
        "PRAGMA integrity_check;", [], |row| row.get(0)
    )?;
    if integrity != "ok" {
        log::error!("DATABASE INTEGRITY CHECK FAILED: {}", integrity);
    }
    
    // Execute schema initialization
    conn.execute_batch(crate::data::schema::SCHEMA)?;
    
    // Seed default data if database is empty
    if let Err(e) = crate::data::repository::seed_if_empty(&conn) {
        log::warn!("Seed data insertion skipped/failed: {}", e);
    }
    
    log::info!("Database decrypted and initialized successfully");
    
    Ok(conn)
}

pub fn resolve_db_path(_app: &tauri::AppHandle) -> std::path::PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            return exe_dir.join("malkhana.db");
        }
    }
    std::path::PathBuf::from("malkhana.db")
}
