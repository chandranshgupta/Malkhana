use sha2::{Sha256, Digest};
use md5::Md5;
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

pub struct HashResult {
    pub sha256: String,
    pub md5: String,
}

pub fn hash_file_chunked<P: AsRef<Path>>(path: P) -> io::Result<HashResult> {
    let mut file = File::open(path)?;
    let mut sha256_hasher = Sha256::new();
    let mut md5_hasher = Md5::new();
    
    let mut buffer = [0; 65536]; // 64KB chunks
    
    loop {
        let n = file.read(&mut buffer)?;
        if n == 0 { break; }
        
        sha256_hasher.update(&buffer[..n]);
        md5_hasher.update(&buffer[..n]);
    }
    
    Ok(HashResult {
        sha256: format!("{:x}", sha256_hasher.finalize()),
        md5: format!("{:x}", md5_hasher.finalize()),
    })
}

pub fn verify_integrity(path: &str, expected_sha256: &str) -> bool {
    match hash_file_chunked(path) {
        Ok(result) => result.sha256 == expected_sha256,
        Err(_) => false,
    }
}
