use std::fs::File;
use std::io::Write;
// We can just use std::env::temp_dir() or a local temp file in the workspace to avoid extra dependencies!
// That's much safer and simpler.

#[test]
fn test_hash_file_chunked_success() {
    let temp_path = std::env::temp_dir().join("malkhana_test_hash.txt");
    
    // Write test content "hello world"
    let mut file = File::create(&temp_path).expect("Failed to create temp file");
    file.write_all(b"hello world").expect("Failed to write to temp file");
    drop(file);
    
    // Calculate hashes
    let result = app_lib::core::hash_engine::hash_file_chunked(&temp_path)
        .expect("Failed to hash file");
        
    // Verify hashes for "hello world"
    // MD5: 5eb63bbbe01eeed093cb22bb8f5acdc3
    // SHA-256: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    assert_eq!(result.md5, "5eb63bbbe01eeed093cb22bb8f5acdc3");
    assert_eq!(result.sha256, "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
    
    // Verify integrity function
    let is_valid = app_lib::core::hash_engine::verify_integrity(
        temp_path.to_str().unwrap(),
        "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    );
    assert!(is_valid);
    
    // Clean up
    let _ = std::fs::remove_file(temp_path);
}
