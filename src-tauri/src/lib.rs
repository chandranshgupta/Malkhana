pub mod commands;
pub mod core;
pub mod data;
pub mod security;
pub mod utils;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            // Resolve DB Path: check for portable mode (DB next to executable) first
            let mut db_path = None;
            if let Ok(exe_path) = std::env::current_exe() {
                if let Some(exe_dir) = exe_path.parent() {
                    // Check directly next to executable
                    let local_db = exe_dir.join("malkhana.db");
                    if local_db.exists() {
                        db_path = Some(local_db);
                    } else {
                        // Check inside a "data" directory next to executable
                        let local_data_db = exe_dir.join("data").join("malkhana.db");
                        if local_data_db.exists() {
                            db_path = Some(local_data_db);
                        }
                    }
                }
            }

            let resolved_db_path = db_path.unwrap_or_else(|| {
                // Default to system AppData directory
                let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
                if !app_data_dir.exists() {
                    std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
                }
                app_data_dir.join("malkhana.db")
            });
            
            // Initialize the SQLCipher database
            let conn = data::database::init_db(&resolved_db_path).expect("failed to initialize database");
            
            // Seed demo data on first run (if tables are empty)
            if let Err(e) = data::repository::seed_if_empty(&conn) {
                log::warn!("Seed data insertion skipped: {}", e);
            }
            
            // Register database state
            app.manage(data::database::DbState(std::sync::Mutex::new(conn)));

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::case_commands::create_case,
            commands::case_commands::get_all_cases,
            commands::evidence_commands::get_evidence_log,
            commands::evidence_commands::get_evidence_details,
            commands::evidence_commands::ingest_evidence,
            commands::evidence_commands::hash_file,
            commands::evidence_commands::acquire_forensic_image,
            commands::custody_commands::transfer_custody,
            commands::custody_commands::get_custody_chain,
            commands::certificate_commands::generate_certificate,
            commands::certificate_commands::get_certificate,
            commands::certificate_commands::get_evidence_for_certificate,
            commands::archive_commands::search_archive,
            commands::archive_commands::get_archive_matrix,
            commands::user_commands::get_all_users,
            commands::user_commands::authenticate_user,
            commands::search_commands::global_search,
            commands::settings_commands::get_settings,
            commands::settings_commands::update_setting,
            commands::settings_commands::get_hardware_info,
            commands::audit_commands::get_audit_log,
            commands::audit_commands::verify_audit_log_trail,
            commands::evidence_commands::detect_devices,
            commands::evidence_commands::verify_forensic_integrity,
        ])

        .run(tauri::generate_context!())
        .expect("error while running Malkhana Vault");
}
