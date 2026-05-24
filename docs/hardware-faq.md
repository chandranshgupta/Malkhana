# HARDWARE & OFFLINE DEPLOYMENT FAQ (RURAL STATIONS)

Malkhana Vault is built for "offline-first" deployment. Many police stations (especially in rural and remote regions) operate with limited hardware resources, older desktop computers, and no internet connectivity.

This FAQ details how the application handles peripheral hardware absences (such as missing cameras/microphones) and offline database constraints.

---

## 1. What happens if the workstation does not have a webcam or microphone?

The application will **not** block officer logins or evidence ingestion.

- **Non-blocking Flow:** If the camera or microphone is missing, the authentication sequence proceeds normally.
- **Biometric Unavailable Log:** A warning is printed to the system logs, and a `BIOMETRIC_UNAVAILABLE` event is recorded in the session's event history.
- **User Alert:** A brief, non-blocking banner appears on the login screen: `[!] BIOMETRIC_CAP_DISABLED: CAMERA/MIC OFFLINE`.
- **Legal Attestation:** The biometric hashes are treated as *custody enrichment* (extra evidence of identity) rather than access locks. The login remains legally sound based on the officer's Batch Number and PIN combination.

---

## 2. Does the app require an internet connection?

**No. Malkhana Vault is 100% offline-first.**

- All database operations are written locally to the SQLCipher database file (`malkhana.db`) stored on the local disk.
- Hashing operations (SHA-256 and MD5) occur entirely in CPU memory using local Rust crates.
- PDF generation for the BSA Section 63 Certificate is processed locally in the WebView using standard print-to-file libraries; no external APIs are called.

---

## 3. How do we sync data if there is no internet?

For police circles utilizing remote database aggregation (such as a District HQ Dashboard under a T2 License):

1. **Local Staging:** The local station operates offline normally, staging metadata and hashes in SQLite.
2. **Sneakernet / USB Sync:** An officer can export the encrypted transaction log to a secure USB drive and transport it to the District Cyber Cell.
3. **Delayed Upload:** Once the database file is loaded onto an internet-connected computer at the District HQ, the Tauri background sync syncs case metadata (never raw evidence files) to the centralized database.

---

## 4. What happens during a power failure? Will the database corrupt?

Indian police stations frequently suffer from load-shedding and power fluctuations. To mitigate this risk, Malkhana Vault features:

- **SQLite WAL Mode:** The database is initialized with `PRAGMA journal_mode = WAL;` (Write-Ahead Logging). Transactions are written to a WAL log first, preventing corruption if the PC shuts down mid-write.
- **Auto-Recovery on Startup:** On boot, the database engine checks `PRAGMA integrity_check;`. If corruption is found, the system automatically restores the latest healthy backup (`malkhana.db.bak`).
- **Downtime Logs:** Every power loss / startup recovery is written to the `system_health_log`. The BSA Certificate generator scans this log and adds compliance notes showing that database integrity was maintained through startup recovery.

---

## 5. How do we ensure the system clock is correct offline?

Timestamps are critical for the admissibility of evidence. If a workstation is offline, its motherboard clock (RTC) may drift:

- **IST Locking:** Malkhana Vault locks all database timestamps to Indian Standard Time (IST, UTC+05:30).
- **Drift Warning:** On session startup, the backend compares the system time against the internal Rust database metadata timeline. If the system clock is set to a time *earlier* than the last recorded database event, the app blocks operations and requires an administrator to correct the system clock.
- **RTC Synchronization:** For field deployments, it is recommended to sync the workstation clock with a secure GPS time-receiver or a hardware RTC module.
