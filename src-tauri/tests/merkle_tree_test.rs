#[test]
fn test_compute_entry_hash_chaining() {
    let prev_hash = "0000000000000000000000000000000000000000000000000000000000000000";
    let event_type = "SESSION_OPENED";
    let entity_type = "SESSION";
    let entity_id = "sess-123";
    let actor = "op_092";
    let details = "Custody session started";

    let hash1 = app_lib::core::merkle_tree::compute_entry_hash(
        prev_hash,
        event_type,
        entity_type,
        entity_id,
        actor,
        details,
    );

    // Chaining: hash1 becomes prev_hash for hash2
    let hash2 = app_lib::core::merkle_tree::compute_entry_hash(
        &hash1,
        "VIEW",
        "EVIDENCE",
        "ev-456",
        "op_092",
        "Viewed evidence details",
    );

    assert_ne!(hash1, hash2);
    assert_eq!(hash1.len(), 64);
    assert_eq!(hash2.len(), 64);
}
