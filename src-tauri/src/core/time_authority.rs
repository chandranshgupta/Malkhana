use chrono::{DateTime, FixedOffset, Utc};

/// Returns the current time in IST (Indian Standard Time, UTC+05:30)
pub fn now_ist() -> DateTime<FixedOffset> {
    let ist_offset = FixedOffset::east_opt(5 * 3600 + 30 * 60).unwrap();
    Utc::now().with_timezone(&ist_offset)
}

/// Returns the current time formatted as an ISO 8601 string in IST
pub fn current_timestamp_iso8601() -> String {
    now_ist().format("%Y-%m-%dT%H:%M:%S+05:30").to_string()
}