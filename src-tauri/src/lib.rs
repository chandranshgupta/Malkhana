pub mod commands;
pub mod core;
pub mod data;
pub mod security;
pub mod utils;

use tauri::Manager;

pub struct ActiveUser(pub std::sync::Mutex<Option<crate::data::models::User>>);

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
            // Register database state as None initially (requires Master Password input to decrypt)
            app.manage(data::database::DbState(std::sync::Mutex::new(None)));
            // Register active user state as None initially
            app.manage(ActiveUser(std::sync::Mutex::new(None)));

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
            commands::user_commands::is_vault_initialized,
            commands::user_commands::is_vault_locked,
            commands::user_commands::unlock_vault,
            commands::user_commands::lock_vault,
            commands::user_commands::reset_database,
            commands::search_commands::global_search,
            commands::settings_commands::get_settings,
            commands::settings_commands::update_setting,
            commands::settings_commands::get_hardware_info,
            commands::audit_commands::get_audit_log,
            commands::audit_commands::verify_audit_log_trail,
            commands::evidence_commands::detect_devices,
            commands::evidence_commands::verify_forensic_integrity,
            commands::signing_commands::generate_user_signing_key,
            commands::signing_commands::sign_certificate,
            commands::signing_commands::verify_certificate_signature,
            commands::session_commands::authenticate_session,
            commands::session_commands::close_session,
            commands::session_commands::reauth_session,
            commands::session_commands::register_pin,
            commands::session_commands::save_encrypted_vault_key,
            commands::session_commands::try_pin_unlock,
            commands::session_commands::delete_pin_vault,
            commands::session_commands::is_pin_vault_enabled,
            commands::session_commands::cosign_session,
            commands::session_commands::log_system_health_event,
            commands::session_commands::get_system_health_log,
            commands::disposition_commands::dispose_evidence,
        ])

        .run(tauri::generate_context!())
        .expect("error while running Malkhana Vault");
}
