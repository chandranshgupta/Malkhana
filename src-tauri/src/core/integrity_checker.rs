use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct HashComparisonResult {
    pub h1: String,
    pub h2: String,
    pub h3: Option<String>,
    pub match_h1_h2: bool,
    pub match_h2_h3: bool,
    pub fully_authentic: bool,
    pub notes: String,
}

/// Performs comparison on Seizure Birth Hash (H1), Ingestion Hash (H2), and
/// optional Verification/Transfer Hash (H3).
pub fn compare_hashes(h1: &str, h2: &str, h3: Option<&str>) -> HashComparisonResult {
    let clean_h1 = h1.trim().to_lowercase();
    let clean_h2 = h2.trim().to_lowercase();
    let clean_h3 = h3.map(|s| s.trim().to_lowercase());

    let match_h1_h2 = !clean_h1.is_empty() && !clean_h2.is_empty() && clean_h1 == clean_h2;
    let match_h2_h3 = match &clean_h3 {
        Some(ref h3_val) => !clean_h2.is_empty() && !h3_val.is_empty() && &clean_h2 == h3_val,
        None => true, // Vacuously true if no H3 is provided
    };

    let fully_authentic = match_h1_h2 && match_h2_h3;

    let mut notes = Vec::new();
    if clean_h1.is_empty() {
        notes.push("Warning: Seizure Birth Hash (H1) is missing.");
    }
    if clean_h2.is_empty() {
        notes.push("Warning: Ingestion Hash (H2) is missing.");
    }

    if !match_h1_h2 && !clean_h1.is_empty() && !clean_h2.is_empty() {
        notes.push("ALERT: Tampering Detected between Seizure and Ingestion (H1 != H2)!");
    }

    if let Some(ref h3_val) = clean_h3 {
        if !match_h2_h3 && !clean_h2.is_empty() && !h3_val.is_empty() {
            notes.push("ALERT: Tampering Detected between Ingestion and Verification (H2 != H3)!");
        }
    } else {
        notes.push("Note: No third verification hash (H3) was provided for comparison.");
    }

    if fully_authentic {
        notes.push("Success: All hashes align. Chain of custody integrity cryptographically verified.");
    }

    HashComparisonResult {
        h1: h1.to_string(),
        h2: h2.to_string(),
        h3: h3.map(|s| s.to_string()),
        match_h1_h2,
        match_h2_h3,
        fully_authentic,
        notes: notes.join(" "),
    }
}
