use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce
};
use aes_gcm::aead::generic_array::GenericArray;
use rand::RngCore;

const SALT: &[u8] = b"malkhana-forensic-vault-salt-2026";
const ITERATIONS: u32 = 256_000;

const PIN_SALT: &[u8] = b"malkhana-pin-vault-salt-2026";
const PIN_ITERATIONS: u32 = 100_000;

/// Derives a 32-byte key from the vault master password using PBKDF2-HMAC-SHA256.
pub fn derive_key_from_password(password: &str) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), SALT, ITERATIONS, &mut key);
    key
}

/// Derives a 32-byte key from the user PIN using PBKDF2-HMAC-SHA256.
pub fn derive_key_from_pin(pin: &str) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(pin.as_bytes(), PIN_SALT, PIN_ITERATIONS, &mut key);
    key
}

/// Encrypts the master password using a key derived from the user PIN (AES-256-GCM).
pub fn encrypt_master_key(master_key: &str, pin: &str) -> Result<String, String> {
    let key_bytes = derive_key_from_pin(pin);
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher
        .encrypt(nonce, master_key.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;
        
    let mut combined = Vec::with_capacity(nonce_bytes.len() + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);
    
    Ok(hex::encode(combined))
}

/// Decrypts the master password using a key derived from the user PIN (AES-256-GCM).
pub fn decrypt_master_key(encrypted_hex: &str, pin: &str) -> Result<String, String> {
    let combined = hex::decode(encrypted_hex).map_err(|e| format!("Invalid hex: {}", e))?;
    if combined.len() < 12 {
        return Err("Encrypted data too short".to_string());
    }
    
    let (nonce_bytes, ciphertext) = combined.split_at(12);
    
    let key_bytes = derive_key_from_pin(pin);
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(nonce_bytes);
    
    let decrypted_bytes = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;
        
    String::from_utf8(decrypted_bytes).map_err(|e| format!("Invalid UTF-8: {}", e))
}
