use std::process::{Command, Stdio};

/// Runs the dc3dd command-line utility to create a forensic image of a drive.
/// This is the foundation for the H1/H2/H3 imaging process.
pub fn run_dc3dd(input_drive: &str, output_image: &str, hash_algo: &str, log_path: &str) -> Result<String, String> {
    log::info!("Starting dc3dd imaging: {} -> {} (hash: {})", input_drive, output_image, hash_algo);
    
    let mut child = Command::new("dc3dd")
        .arg(format!("if={}", input_drive))
        .arg(format!("of={}", output_image))
        .arg(format!("hash={}", hash_algo))
        .arg(format!("log={}", log_path))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn dc3dd command. Ensure dc3dd is installed. Error: {}", e))?;

    let output = child.wait_with_output()
        .map_err(|e| format!("Failed to wait for dc3dd process: {}", e))?;

    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();

    if output.status.success() {
        log::info!("dc3dd imaging completed successfully.");
        // dc3dd usually outputs progress and results to stderr
        Ok(format!("STDOUT:\n{}\nSTDERR:\n{}", stdout, stderr))
    } else {
        log::error!("dc3dd imaging failed: {}", stderr);
        Err(format!("dc3dd failed with exit code: {:?}\nError output:\n{}", output.status.code(), stderr))
    }
}
