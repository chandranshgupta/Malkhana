use serde::Serialize;
use std::process::Command;

#[derive(Serialize, Debug, Clone)]
pub struct RemovableDevice {
    pub name: String,
    pub path: String,
    pub file_system: String,
    pub size_bytes: u64,
}

#[cfg(target_os = "windows")]
pub fn detect_external_drives() -> Result<Vec<RemovableDevice>, String> {
    // Run PowerShell command to list logical disks in JSON format
    let output = Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "Get-CimInstance Win32_LogicalDisk | Select-Object Caption, DriveType, FileSystem, Size, VolumeName | ConvertTo-Json",
        ])
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if stdout.is_empty() {
        return Ok(vec![]);
    }

    // Parse the JSON output (it can be an array or a single object)
    let json_val: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse JSON output: {}", e))?;

    let mut devices = Vec::new();

    let items = if json_val.is_array() {
        json_val.as_array().unwrap().clone()
    } else {
        vec![json_val]
    };

    for item in items {
        let drive_type = item.get("DriveType").and_then(|v| v.as_u64()).unwrap_or(0);
        // DriveType 2 is Removable (USB / SD Card)
        if drive_type == 2 {
            let caption = item.get("Caption").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let volume_name = item.get("VolumeName").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let file_system = item.get("FileSystem").and_then(|v| v.as_str()).unwrap_or("UNKNOWN").to_string();
            let size = item.get("Size").and_then(|v| v.as_u64()).unwrap_or(0);

            let display_name = if volume_name.is_empty() {
                format!("Removable Drive ({})", caption)
            } else {
                format!("{} ({})", volume_name, caption)
            };

            // Path for Windows drives is Caption (e.g. E:) or E:\\
            let path = format!("{}\\", caption);

            devices.push(RemovableDevice {
                name: display_name,
                path,
                file_system,
                size_bytes: size,
            });
        }
    }

    Ok(devices)
}

#[cfg(not(target_os = "windows"))]
pub fn detect_external_drives() -> Result<Vec<RemovableDevice>, String> {
    // Run lsblk command on Linux to query block devices in JSON format
    let output = Command::new("lsblk")
        .args(&["-b", "-J", "-o", "NAME,TRAN,SIZE,MOUNTPOINT,FSTYPE,LABEL"])
        .output()
        .map_err(|e| format!("Failed to execute lsblk: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if stdout.is_empty() {
        return Ok(vec![]);
    }

    let json_val: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse lsblk JSON: {}", e))?;

    let mut devices = Vec::new();

    if let Some(blockdevices) = json_val.get("blockdevices").and_then(|v| v.as_array()) {
        for dev in blockdevices {
            let tran = dev.get("tran").and_then(|v| v.as_str()).unwrap_or("");
            let name = dev.get("name").and_then(|v| v.as_str()).unwrap_or("");
            
            // Check children partitions
            if let Some(children) = dev.get("children").and_then(|v| v.as_array()) {
                for child in children {
                    let mountpoint = child.get("mountpoint").and_then(|v| v.as_str()).unwrap_or("");
                    if tran == "usb" || mountpoint.starts_with("/media/") || mountpoint.starts_with("/run/media/") {
                        let child_name = child.get("name").and_then(|v| v.as_str()).unwrap_or("");
                        let size = child.get("size").and_then(|v| v.as_u64()).unwrap_or(0);
                        let label = child.get("label").and_then(|v| v.as_str()).unwrap_or("");
                        let fstype = child.get("fstype").and_then(|v| v.as_str()).unwrap_or("UNKNOWN").to_string();

                        let display_name = if label.is_empty() {
                            format!("Removable Drive (/dev/{})", child_name)
                        } else {
                            format!("{} (/dev/{})", label, child_name)
                        };

                        devices.push(RemovableDevice {
                            name: display_name,
                            path: format!("/dev/{}", child_name),
                            file_system: fstype,
                            size_bytes: size,
                        });
                    }
                }
            } else {
                let mountpoint = dev.get("mountpoint").and_then(|v| v.as_str()).unwrap_or("");
                if tran == "usb" || mountpoint.starts_with("/media/") || mountpoint.starts_with("/run/media/") {
                    let size = dev.get("size").and_then(|v| v.as_u64()).unwrap_or(0);
                    let label = dev.get("label").and_then(|v| v.as_str()).unwrap_or("");
                    let fstype = dev.get("fstype").and_then(|v| v.as_str()).unwrap_or("UNKNOWN").to_string();

                    let display_name = if label.is_empty() {
                        format!("Removable Drive (/dev/{})", name)
                    } else {
                        format!("{} (/dev/{})", label, name)
                    };

                    devices.push(RemovableDevice {
                        name: display_name,
                        path: format!("/dev/{}", name),
                        file_system: fstype,
                        size_bytes: size,
                    });
                }
            }
        }
    }

    Ok(devices)
}
