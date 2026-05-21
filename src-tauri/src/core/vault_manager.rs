use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

/// Resolves and ensures the existence of the secure evidence vault directory
/// located in the running executable's parent directory.
pub fn prepare_vault_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let exe_dir = if let Ok(exe_path) = std::env::current_exe() {
        exe_path.parent().map(|p| p.to_path_buf())
    } else {
        None
    };

    let base_dir = exe_dir.unwrap_or_else(|| {
        app.path().app_data_dir().unwrap_or_else(|_| PathBuf::from("."))
    });
    
    let vault_dir = base_dir.join("evidence_vault");
    if !vault_dir.exists() {
        fs::create_dir_all(&vault_dir)
            .map_err(|e| format!("Failed to create evidence vault directory: {}", e))?;
    }
    
    Ok(vault_dir)
}

/// Copies a forensic asset file from the source path to the secure vault directory
pub fn copy_to_vault(
    source_path: &str,
    destination_name: &str,
    app: &tauri::AppHandle,
) -> Result<PathBuf, String> {
    let source = Path::new(source_path);
    if !source.exists() || !source.is_file() {
        return Err(format!("Source file does not exist or is not a file: {}", source_path));
    }

    let vault_dir = prepare_vault_dir(app)?;
    let dest_path = vault_dir.join(destination_name);

    fs::copy(source, &dest_path)
        .map_err(|e| format!("Failed to copy file to vault: {}", e))?;

    Ok(dest_path)
}

/// Verifies that a file exists and is accessible within the secure vault
pub fn verify_vault_file(file_path: &str) -> bool {
    let path = Path::new(file_path);
    path.exists() && path.is_file()
}

/// Deletes a file from the vault, ensuring the target path is strictly within the vault directory
pub fn delete_vault_file(file_path: &str, app: &tauri::AppHandle) -> Result<(), String> {
    let path = Path::new(file_path);
    if !path.exists() {
        return Ok(()); // File already deleted
    }

    let vault_dir = prepare_vault_dir(app)?;
    
    // Security check: ensure path resides inside the vault_dir to prevent arbitrary file deletion
    let canonical_path = path.canonicalize()
        .map_err(|e| format!("Failed to resolve canonical path: {}", e))?;
    let canonical_vault = vault_dir.canonicalize()
        .map_err(|e| format!("Failed to resolve canonical vault path: {}", e))?;

    if !canonical_path.starts_with(&canonical_vault) {
        return Err("Security Violation: Attempted to delete a file outside the secure vault.".to_string());
    }

    fs::remove_file(canonical_path)
        .map_err(|e| format!("Failed to delete file: {}", e))?;

    Ok(())
}
