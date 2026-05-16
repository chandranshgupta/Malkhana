use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct EvidenceStamp {
    pub text: String,
    pub r#type: String,
    pub rotate: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EvidenceItem {
    pub id: String,
    pub title: String,
    pub desc: String,
    pub tags: Vec<String>,
    pub image_comp_type: String,
    pub stamp: EvidenceStamp,
    pub alert: Option<String>,
}

#[tauri::command]
pub fn get_evidence_log() -> Result<Vec<EvidenceItem>, String> {
    Ok(vec![
        EvidenceItem {
            id: "S50-9926-X1".to_string(),
            title: "1TB_NVME_SSD".to_string(),
            desc: "Seized from location Alpha-9. Primary storage for workstation suspect-01. Physical casing intact, no signs of tampering.".to_string(),
            tags: vec!["CAPACITY: 1024GB".to_string(), "INTERFACE: PCIE_X4".to_string()],
            image_comp_type: "WireframeSSD".to_string(),
            stamp: EvidenceStamp { text: "STATUS: IMMUTABLE".to_string(), r#type: "blue".to_string(), rotate: "-rotate-12".to_string() },
            alert: None,
        },
        EvidenceItem {
            id: "MOB-1142-922".to_string(),
            title: "SAMSUNG_S22_ULTRA".to_string(),
            desc: "Recovered from vehicle search. Screen damaged but functional. Multiple failed login attempts recorded in vault log.".to_string(),
            tags: vec!["OS: ANDROID_13".to_string(), "SIGNAL: ISOLATED".to_string()],
            image_comp_type: "WireframePhone".to_string(),
            stamp: EvidenceStamp { text: "STATUS: ALERT".to_string(), r#type: "red".to_string(), rotate: "rotate-12".to_string() },
            alert: Some("ENCRYPTION_ACTIVE".to_string()),
        },
        EvidenceItem {
            id: "DVR-4402-2Y".to_string(),
            title: "SONY_CCTV_DVR_R4".to_string(),
            desc: "Seized from retail location during incident investigation. 4-channel continuous recording. Password bypass pending.".to_string(),
            tags: vec!["CHANNELS: 04".to_string(), "FORMAT: H.264".to_string()],
            image_comp_type: "WireframeDVR".to_string(),
            stamp: EvidenceStamp { text: "STATUS: IMMUTABLE".to_string(), r#type: "blue".to_string(), rotate: "-rotate-6".to_string() },
            alert: None,
        }
    ])
}

#[tauri::command]
pub fn ingest_evidence(case_id: String, asset_type: String) -> Result<String, String> {
    Ok(format!("Ingested asset type {} for case {}", asset_type, case_id))
}

#[tauri::command]
pub fn hash_file(path: String) -> Result<String, String> {
    Ok(format!("Simulated hash for {}", path))
}
