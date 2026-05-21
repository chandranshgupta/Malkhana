use tauri::State;
use crate::data::database::DbState;
use crate::data::repository;

/// Generate a new Ed25519 keypair and store the public key on the user record.
/// Returns the private key hex (to be stored by the user or in a secure token).
#[tauri::command]
pub fn generate_user_signing_key(
    username: String,
    state: State<'_, DbState>,
) -> Result<serde_json::Value, String> {
    let guard = state.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    let (public_key_hex, private_key_hex) = crate::security::signing::generate_signing_keypair();

    // Store public key on the user record
    conn.execute(
        "UPDATE users SET public_key = ?1 WHERE username = ?2",
        rusqlite::params![public_key_hex, username],
    ).map_err(|e| format!("Failed to store public key: {}", e))?;

    repository::append_audit_log(
        conn,
        "DSC_KEYPAIR_GENERATED",
        "USER",
        &username,
        &username,
        Some("Ed25519 signing keypair generated for digital certificate signing"),
    ).unwrap_or(());

    Ok(serde_json::json!({
        "public_key": public_key_hex,
        "private_key": private_key_hex
    }))
}

/// Digitally sign a certificate's document_hash using the operator's Ed25519 private key.
/// Stores the signature and signer's public key on the certificate record.
#[tauri::command]
pub fn sign_certificate(
    certificate_id: String,
    private_key_hex: String,
    state: State<'_, DbState>,
) -> Result<serde_json::Value, String> {
    let guard = state.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // 1. Fetch the certificate's document_hash
    let (doc_hash, evidence_id): (String, String) = conn.query_row(
        "SELECT document_hash, evidence_id FROM certificates WHERE id = ?1",
        rusqlite::params![certificate_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|_| format!("Certificate not found: {}", certificate_id))?;

    // 2. Sign it
    let signature_hex = crate::security::signing::sign_data(&doc_hash, &private_key_hex)?;

    // 3. Derive the public key from the private key for verification
    let key_bytes = hex::decode(&private_key_hex)
        .map_err(|e| format!("Invalid private key: {}", e))?;
    let key_array: [u8; 32] = key_bytes
        .try_into()
        .map_err(|_| "Private key must be 32 bytes".to_string())?;
    let signing_key = ed25519_dalek::SigningKey::from_bytes(&key_array);
    let public_key_hex = hex::encode(signing_key.verifying_key().to_bytes());

    // 4. Store signature on certificate record (using device_description as dsc_signature field)
    // We store both signature and signer public key as JSON in a new column approach
    // For compatibility, store as JSON in a pragmatic way
    let dsc_data = serde_json::json!({
        "dsc_signature": signature_hex,
        "signer_public_key": public_key_hex,
        "signed_at": crate::core::time_authority::current_timestamp_iso8601(),
        "algorithm": "Ed25519-SHA256"
    }).to_string();

    conn.execute(
        "UPDATE certificates SET device_description = ?1 WHERE id = ?2",
        rusqlite::params![dsc_data, certificate_id],
    ).map_err(|e| format!("Failed to store DSC signature: {}", e))?;

    // 5. Audit log
    repository::append_audit_log(
        conn,
        "CERTIFICATE_DSC_SIGNED",
        "CERTIFICATE",
        &certificate_id,
        &public_key_hex,
        Some(&format!(
            "Certificate {} digitally signed for evidence {}",
            certificate_id, evidence_id
        )),
    ).unwrap_or(());

    Ok(serde_json::json!({
        "signature": signature_hex,
        "public_key": public_key_hex,
        "algorithm": "Ed25519-SHA256"
    }))
}

/// Verify a certificate's DSC signature against its document_hash.
#[tauri::command]
pub fn verify_certificate_signature(
    certificate_id: String,
    state: State<'_, DbState>,
) -> Result<serde_json::Value, String> {
    let guard = state.0.lock().map_err(|e| format!("DB lock failed: {}", e))?;
    let conn = guard.as_ref().ok_or("VAULT_LOCKED")?;

    // 1. Fetch certificate
    let (doc_hash, dsc_json): (String, Option<String>) = conn.query_row(
        "SELECT document_hash, device_description FROM certificates WHERE id = ?1",
        rusqlite::params![certificate_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).map_err(|_| format!("Certificate not found: {}", certificate_id))?;

    let dsc_json = dsc_json.ok_or("NO_DSC_SIGNATURE")?;
    let dsc: serde_json::Value = serde_json::from_str(&dsc_json)
        .map_err(|_| "Invalid DSC data on certificate".to_string())?;

    let signature_hex = dsc["dsc_signature"].as_str().ok_or("Missing signature field")?;
    let public_key_hex = dsc["signer_public_key"].as_str().ok_or("Missing public key field")?;

    // 2. Verify
    let is_valid = crate::security::signing::verify_signature(&doc_hash, signature_hex, public_key_hex);

    Ok(serde_json::json!({
        "valid": is_valid,
        "algorithm": "Ed25519-SHA256",
        "signer_public_key": public_key_hex
    }))
}
