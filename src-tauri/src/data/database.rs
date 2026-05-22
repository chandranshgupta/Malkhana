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
    
    // Perform lightweight migrations for any newly introduced columns
    let _ = conn.execute("ALTER TABLE certificates ADD COLUMN compliance_note TEXT;", []);
    
    // Seed default data if database is empty
    if let Err(e) = crate::data::repository::seed_if_empty(&conn) {
        log::warn!("Seed data insertion skipped/failed: {}", e);
    }
    
    log::info!("Database decrypted and initialized successfully");
    
    Ok(conn)
}

/// Rotates database backups up to 3 generations: malkhana.db.bak, malkhana.db.bak.1, malkhana.db.bak.2
pub fn rotate_backups(db_path: &Path) {
    let bak = db_path.with_extension("db.bak");
    let bak1 = db_path.with_extension("db.bak.1");
    let bak2 = db_path.with_extension("db.bak.2");

    // Remove oldest backup and shift the others
    if bak2.exists() {
        let _ = std::fs::remove_file(&bak2);
    }
    if bak1.exists() {
        let _ = std::fs::rename(&bak1, &bak2);
    }
    if bak.exists() {
        let _ = std::fs::rename(&bak, &bak1);
    }
    // Copy the current database to the primary backup
    if db_path.exists() {
        let _ = std::fs::copy(db_path, &bak);
    }
}

/// Attempts to open the database normally. If it fails, checks if a healthy backup exists,
/// restores the backup, and attempts to reopen it.
pub fn try_open_or_restore<P: AsRef<Path>>(path: P, key: &str) -> std::result::Result<Connection, crate::utils::errors::AppError> {
    let path_ref = path.as_ref();
    
    match open_db_with_key(path_ref, key) {
        Ok(conn) => {
            // Successfully opened, so rotate the backups on startup
            rotate_backups(path_ref);
            Ok(conn)
        }
        Err(e) => {
            log::warn!("Failed to open main database: {}. Attempting restoration from backup...", e);
            let bak = path_ref.with_extension("db.bak");
            
            if bak.exists() {
                // Verify if the backup is healthy using the same key
                match open_db_with_key(&bak, key) {
                    Ok(bak_conn) => {
                        // Backup is good! Close it before copy
                        drop(bak_conn);
                        
                        log::info!("Backup database verified successfully. Restoring...");
                        
                        // Move corrupted db out of the way
                        let corrupted = path_ref.with_extension("db.corrupted");
                        let _ = std::fs::remove_file(&corrupted);
                        if path_ref.exists() {
                            let _ = std::fs::rename(path_ref, &corrupted);
                        }
                        
                        // Clean up WAL/SHM files to avoid mismatch with restored database
                        let wal_path = path_ref.with_extension("db-wal");
                        let shm_path = path_ref.with_extension("db-shm");
                        let _ = std::fs::remove_file(&wal_path);
                        let _ = std::fs::remove_file(&shm_path);
                        
                        // Copy backup to main database path
                        if let Err(copy_err) = std::fs::copy(&bak, path_ref) {
                            log::error!("Failed to copy backup file: {}", copy_err);
                            return Err(crate::utils::errors::AppError::Io(copy_err));
                        }
                        
                        // Retry opening from the restored database
                        Ok(open_db_with_key(path_ref, key)?)
                    }
                    Err(bak_err) => {
                        log::error!("Backup database is also corrupt or invalid key: {}", bak_err);
                        Err(crate::utils::errors::AppError::Database(e))
                    }
                }
            } else {
                log::error!("No database backup found for restoration.");
                Err(crate::utils::errors::AppError::Database(e))
            }
        }
    }
}

pub fn resolve_db_path(_app: &tauri::AppHandle) -> std::path::PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            return exe_dir.join("malkhana.db");
        }
    }
    std::path::PathBuf::from("malkhana.db")
}
