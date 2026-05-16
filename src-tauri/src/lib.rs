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
            commands::archive_commands::search_archive,
            commands::search_commands::global_search,
            commands::settings_commands::get_settings,
            commands::settings_commands::update_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Malkhana Vault");
}
