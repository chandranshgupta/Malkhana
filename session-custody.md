# STEP 0 — SESSION-AS-CHAIN-OF-CUSTODY ARCHITECTURE

In standard applications, logging in is simply an authorization gate. In **Malkhana Vault**, authentication is treated as a **forensic custody event**. The moment an officer logs in, the legal custody chain of the digital vault itself begins.

This matches the requirements of **Section 63 of the Bharatiya Sakshya Adhiniyam (BSA), 2023**, establishing the period of "lawful control" over the computer system generating the electronic record.

---

## 1. The Step 0 Custody Hook

When an officer logs in using their **Batch Number** and **PIN**:
1. The backend immediately establishes a new custody session record (`sessions` table).
2. The officer's profile is loaded (`officer_profiles`).
3. An audit trail link is established: every subsequent action (viewing evidence, creating cases, running searches, modifying settings, or exporting documents) is recorded under this `session_id` in the `session_events` table.

```
+-------------------------------------------------------------+
|                      OFFICER AUTHENTICATION                 |
|                      Batch Number + PIN                     |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                    STEP 0 CUSTODY SESSION                    |
|  - Opened Timestamp (IST)                                   |
|  - Device Fingerprint (MAC, Hostname, OS)                   |
|  - Biometric Snapshot Hash (Webcam JPEG SHA-256)            |
|  - Biometric Audio Hash (Voice sample SHA-256)              |
+------------------------------+------------------------------+
                               |
                               v
+------------------------------+------------------------------+
|                     ACTIVE VAULT SESSION                     |
|  - Logs all actions to append-only session_events            |
|  - Auto-locks after 3 minutes of inactivity                 |
|  - Joint inspection co-signing support                       |
+-------------------------------------------------------------+
```

---

## 2. Silent System Witnessing & Fingerprinting

To comply with BSA §63(2)(a) (identifying the device and verifying its operational integrity), the system captures and logs a series of background markers:

| Parameter | Type | Storage Target | Forensic Purpose |
|-----------|------|----------------|------------------|
| **Opened Timestamp** | Temporal | `sessions.opened_at` | Establishes the exact start of lawful custody (IST timezone locked). |
| **Device Fingerprint** | Hardware | `sessions.device_fingerprint` | JSON object containing MAC address, local IP, hostname, OS version, and app build. |
| **Webcam Snapshot Hash** | Biometric | `sessions.camera_snapshot_hash` | SHA-256 hash of a webcam JPEG taken at login. The raw photo is NOT stored locally to protect privacy; only the hash is recorded for later forensic comparison. |
| **Voice Clip Hash** | Biometric | `sessions.audio_sample_hash` | SHA-256 hash of a 3-second voice sample taken at login for laboratory verification. |

### Hardware Fallbacks (Rural Deployment)
In rural or remote stations lacking webcams or microphones, the login sequence will log a `BIOMETRIC_UNAVAILABLE` event and allow the session to proceed. Biometric capture acts as *forensic enrichment*, not as a blocking gate.

---

## 3. Auto-Lock & Re-Authentication

To prevent unauthorized access to an unattended terminal:
- **Trigger:** The application tracks user activity (clicks, mouse movements, keystrokes). After **3 minutes of inactivity**, the screen is locked.
- **Lock Action:** The active view is hidden behind a PIN input mask.
- **Re-Auth:** The logged-in officer must enter their 6-digit PIN to resume. This captures a new webcam snapshot hash and logs a `REAUTH` event in the session log.
- **Suppression:** Auto-lock is automatically suppressed if a forensic imaging operation (via `dc3dd`) or a file hashing thread is active.

---

## 4. Joint Inspection & Co-Signing

For actions requiring witness verification (such as receipt verification or joint custody handovers), the active session supports co-signing:
- A secondary officer enters their Batch Number and PIN.
- The system captures the co-signer's biometric hashes.
- A `session_cosigners` entry links the second officer to the active `session_id`.
- Subsequent events are logged as joint-custody actions, satisfying the physical "Panch Witness" equivalent in the digital domain.

---

## 5. The Session Seal (Logout)

When the session is closed:
1. The `closed_at` timestamp is written.
2. The system compiles a `session_summary` (counting actions, cases accessed, and hashes generated).
3. The system computes a **Merkle root** of all `session_events` compiled during the session. The final event hash is written to the session database, sealing it cryptographically.
4. Any attempt to modify or inject an event into the database after closing will invalidate the Merkle root, making database tampering immediately obvious to audit checkers.
