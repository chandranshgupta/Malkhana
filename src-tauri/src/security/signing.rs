use ed25519_dalek::{SigningKey, VerifyingKey, Signer, Verifier, Signature};
use rand::rngs::OsRng;
use sha2::{Sha256, Digest};

/// Generate a new Ed25519 signing keypair.
/// Returns (hex_public_key, hex_private_key).
pub fn generate_signing_keypair() -> (String, String) {
    let signing_key = SigningKey::generate(&mut OsRng);
    let verifying_key = signing_key.verifying_key();

    let private_hex = hex::encode(signing_key.to_bytes());
    let public_hex = hex::encode(verifying_key.to_bytes());

    (public_hex, private_hex)
}

/// Sign a document hash (or any data) using an Ed25519 private key (hex-encoded).
/// Returns the hex-encoded signature.
pub fn sign_data(data: &str, private_key_hex: &str) -> Result<String, String> {
    let key_bytes = hex::decode(private_key_hex)
        .map_err(|e| format!("Invalid private key hex: {}", e))?;

    let key_array: [u8; 32] = key_bytes
        .try_into()
        .map_err(|_| "Private key must be exactly 32 bytes".to_string())?;

    let signing_key = SigningKey::from_bytes(&key_array);

    // Hash the data first with SHA-256 to get a fixed-size message
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let digest = hasher.finalize();

    let signature = signing_key.sign(&digest);
    Ok(hex::encode(signature.to_bytes()))
}

/// Verify a signature against a document hash using an Ed25519 public key (hex-encoded).
pub fn verify_signature(data: &str, signature_hex: &str, public_key_hex: &str) -> bool {
    let Ok(pub_bytes) = hex::decode(public_key_hex) else { return false };
    let Ok(pub_array): Result<[u8; 32], _> = pub_bytes.try_into() else { return false };
    let Ok(verifying_key) = VerifyingKey::from_bytes(&pub_array) else { return false };

    let Ok(sig_bytes) = hex::decode(signature_hex) else { return false };
    let Ok(sig_array): Result<[u8; 64], _> = sig_bytes.try_into() else { return false };
    let signature = Signature::from_bytes(&sig_array);

    // Hash the data the same way as signing
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let digest = hasher.finalize();

    verifying_key.verify(&digest, &signature).is_ok()
}
