use sha2::{Sha256, Digest};

/// Calculates the SHA-256 hash of an audit log entry.
/// By concatenating the previous entry's hash, we form an append-only cryptographic hash chain (similar to a blockchain or Merkle path).
pub fn compute_entry_hash(
    prev_hash: &str,
    event_type: &str,
    entity_type: &str,
    entity_id: &str,
    actor: &str,
    details: &str,
) -> String {
    let mut hasher = Sha256::new();
    
    // Concatenate fields with a delimiter to prevent collision attacks
    let payload = format!(
        "{}:{}:{}:{}:{}:{}",
        prev_hash, event_type, entity_type, entity_id, actor, details
    );
    
    hasher.update(payload.as_bytes());
    format!("{:x}", hasher.finalize())
}
