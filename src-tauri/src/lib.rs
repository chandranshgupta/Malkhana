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
            // Get the application data directory
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            
            // Ensure the directory exists
            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            }
            
            let db_path = app_data_dir.join("malkhana.db");
            
            // Initialize the SQLCipher database
            let conn = data::database::init_db(&db_path).expect("failed to initialize database");
            
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
            commands::evidence_commands::get_evidence_log,
            commands::evidence_commands::ingest_evidence,
            commands::evidence_commands::hash_file,
            commands::custody_commands::transfer_custody,
            commands::certificate_commands::generate_certificate,
            commands::certificate_commands::get_certificate,
            commands::certificate_commands::get_evidence_for_certificate,
            commands::archive_commands::search_archive,
            commands::search_commands::global_search,
            commands::settings_commands::get_settings,
            commands::settings_commands::update_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Malkhana Vault");
}
