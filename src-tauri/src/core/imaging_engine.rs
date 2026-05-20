use std::fs::File;
use std::io::{self, Read, Write, BufReader, BufRead};
use std::path::Path;
use std::process::{Command, Stdio};
use std::time::{Instant, Duration};
use sha2::{Sha256, Digest};
use md5::Md5;
use serde::Serialize;
use tauri::Emitter;

#[derive(Serialize, Clone, Debug)]
pub struct ProgressPayload {
    pub percentage: f64,
    pub bytes_copied: u64,
    pub total_bytes: u64,
    pub speed_mb_s: f64,
    pub eta_seconds: f64,
    pub status: String,
}

#[derive(Serialize, Clone, Debug)]
pub struct ImagingResult {
    pub sha256: String,
    pub md5: String,
    pub bytes_copied: u64,
    pub engine: String,
}

/// Helper to check if dc3dd is installed in the system PATH
pub fn is_dc3dd_available() -> bool {
    let cmd = if cfg!(target_os = "windows") { "dc3dd.exe" } else { "dc3dd" };
    Command::new(cmd)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

/// Run forensic imaging with real-time progress events emitted via Tauri window emitter.
pub fn run_forensic_imaging(
    window: tauri::Window,
    source: String,
    destination: String,
) -> Result<ImagingResult, String> {
    log::info!("Initiating forensic acquisition: {} -> {}", source, destination);

    // Ensure the parent directories of the destination exist
    if let Some(parent) = Path::new(&destination).parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create destination directories: {}", e))?;
    }

    if is_dc3dd_available() {
        log::info!("dc3dd utility detected. Launching system imager...");
        run_dc3dd_engine(window, &source, &destination)
    } else {
        log::info!("dc3dd not found. Engaging native Rust bit-stream copy engine...");
        run_native_rust_engine(window, &source, &destination)
    }
}

/// Forensic Engine A: dc3dd integration
fn run_dc3dd_engine(
    window: tauri::Window,
    source: &str,
    destination: &str,
) -> Result<ImagingResult, String> {
    let cmd = if cfg!(target_os = "windows") { "dc3dd.exe" } else { "dc3dd" };
    
    // We run dc3dd with logging and stderr piping
    // dc3dd output includes progress updates to stderr
    let mut child = Command::new(cmd)
        .arg(format!("if={}", source))
        .arg(format!("of={}", destination))
        .arg("hash=sha256")
        .arg("hash=md5")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn dc3dd: {}", e))?;

    let stderr = child.stderr.take().ok_or("Failed to open dc3dd stderr stream")?;
    let reader = BufReader::new(stderr);
    let start_time = Instant::now();

    // Since we don't know the file size directly from dc3dd, we'll try to get it
    let total_bytes = Path::new(source).metadata().map(|m| m.len()).unwrap_or(0);

    for line in reader.lines() {
        if let Ok(line_content) = line {
            log::info!("dc3dd raw stderr: {}", line_content);
            
            // dc3dd progress reports look like:
            // "   524288 bytes ( 512 K ) copied (  1% ),   0 s, 10.2 MB/s"
            if line_content.contains("bytes") && line_content.contains("copied") {
                let parts: Vec<&str> = line_content.split_whitespace().collect();
                if !parts.is_empty() {
                    // Try to parse the first number (bytes copied)
                    let bytes_copied = parts[0].replace(",", "").parse::<u64>().unwrap_or(0);
                    
                    let elapsed = start_time.elapsed().as_secs_f64();
                    let speed_mb_s = if elapsed > 0.0 {
                        (bytes_copied as f64) / (elapsed * 1024.0 * 1024.0)
                    } else {
                        0.0
                    };
                    
                    let percentage = if total_bytes > 0 {
                        (bytes_copied as f64) / (total_bytes as f64) * 100.0
                    } else {
                        0.0
                    };
                    
                    let eta_seconds = if speed_mb_s > 0.0 && total_bytes > bytes_copied {
                        ((total_bytes - bytes_copied) as f64) / (speed_mb_s * 1024.0 * 1024.0)
                    } else {
                        0.0
                    };

                    let payload = ProgressPayload {
                        percentage,
                        bytes_copied,
                        total_bytes,
                        speed_mb_s,
                        eta_seconds,
                        status: "IMAGING_RUNNING_DC3DD".to_string(),
                    };
                    let _ = window.emit("imaging-progress", payload);
                }
            }
        }
    }

    let output = child.wait_with_output().map_err(|e| format!("dc3dd wait failed: {}", e))?;
    if !output.status.success() {
        return Err(format!("dc3dd exited with code: {:?}", output.status.code()));
    }

    // Now extract final hashes from dc3dd summary
    let summary = String::from_utf8_lossy(&output.stderr);
    let mut sha256 = String::new();
    let mut md5 = String::new();

    for line in summary.lines() {
        // dc3dd output formats for hashes:
        // "sha256: 4e3d..." or "md5: 8fbc..."
        let clean_line = line.trim().to_lowercase();
        if clean_line.starts_with("sha256:") {
            sha256 = clean_line.replace("sha256:", "").trim().to_string();
        } else if clean_line.starts_with("md5:") {
            md5 = clean_line.replace("md5:", "").trim().to_string();
        }
    }

    // Fallback if summary format parsing failed
    if sha256.is_empty() {
        log::warn!("Failed to parse sha256 from dc3dd output. Running fallback hash engine...");
        if let Ok(hashes) = crate::core::hash_engine::hash_file_chunked(destination) {
            sha256 = hashes.sha256;
            md5 = hashes.md5;
        }
    }

    Ok(ImagingResult {
        sha256,
        md5,
        bytes_copied: total_bytes,
        engine: "dc3dd".to_string(),
    })
}

/// Forensic Engine B: Native block copier fallback
fn run_native_rust_engine(
    window: tauri::Window,
    source: &str,
    destination: &str,
) -> Result<ImagingResult, String> {
    let mut src_file = File::open(source).map_err(|e| format!("Failed to open source file/device: {}", e))?;
    let mut dest_file = File::create(destination).map_err(|e| format!("Failed to create destination clone file: {}", e))?;

    let total_bytes = src_file.metadata().map(|m| m.len()).unwrap_or(0);
    let mut bytes_copied = 0;
    
    let mut sha256_hasher = Sha256::new();
    let mut md5_hasher = Md5::new();

    let mut buffer = [0u8; 65536]; // 64KB block buffer size
    let start_time = Instant::now();
    let mut last_emit = Instant::now();

    loop {
        let n = src_file.read(&mut buffer).map_err(|e| format!("Read error: {}", e))?;
        if n == 0 {
            break;
        }

        // Write directly to clone file
        dest_file.write_all(&buffer[..n]).map_err(|e| format!("Write error: {}", e))?;

        // Update hashes
        sha256_hasher.update(&buffer[..n]);
        md5_hasher.update(&buffer[..n]);

        bytes_copied += n as u64;

        // Emit progress reports every 200ms
        if last_emit.elapsed() >= Duration::from_millis(200) || bytes_copied == total_bytes {
            let elapsed_secs = start_time.elapsed().as_secs_f64();
            let speed_mb_s = if elapsed_secs > 0.0 {
                (bytes_copied as f64) / (elapsed_secs * 1024.0 * 1024.0)
            } else {
                0.0
            };

            let percentage = if total_bytes > 0 {
                (bytes_copied as f64) / (total_bytes as f64) * 100.0
            } else {
                100.0
            };

            let eta_seconds = if speed_mb_s > 0.0 && total_bytes > bytes_copied {
                ((total_bytes - bytes_copied) as f64) / (speed_mb_s * 1024.0 * 1024.0)
            } else {
                0.0
            };

            let payload = ProgressPayload {
                percentage,
                bytes_copied,
                total_bytes,
                speed_mb_s,
                eta_seconds,
                status: "IMAGING_RUNNING_NATIVE".to_string(),
            };

            let _ = window.emit("imaging-progress", payload);
            last_emit = Instant::now();
        }
        
        // Add artificial delay for testing/simulation if the file is extremely small
        if total_bytes < 1_000_000 {
            std::thread::sleep(Duration::from_millis(15));
        }
    }

    // Flush and force write to storage sectors
    dest_file.sync_all().map_err(|e| format!("Disk flush error: {}", e))?;

    let final_sha256 = format!("{:x}", sha256_hasher.finalize());
    let final_md5 = format!("{:x}", md5_hasher.finalize());

    Ok(ImagingResult {
        sha256: final_sha256,
        md5: final_md5,
        bytes_copied,
        engine: "native_rust".to_string(),
    })
}
