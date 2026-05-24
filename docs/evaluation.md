# EVALUATION & SANDBOX WALKTHROUGH GUIDE

This document provides quick-start credentials and sandbox instructions for testing and evaluating Malkhana Vault.

## Secure Master Password (Decryption Screen)

Before accessing the login portal, the database vault must be decrypted. If the application is freshly installed or has been reset, initialize it with a master password:

- **Master Password:** `admin` (or any custom password of your choice during initial setup)
- **PIN Vault (Quick Unlock):** If enabled in settings, you can unlock the vault using a 6-digit device PIN: `111111`.

---

## Demo Officer Profiles & Credentials

Once the vault is decrypted, you will see the **Secure Access Portal** (Login Screen). The following profiles are pre-seeded in the database for demonstration and audit purposes:

### 1. System Administrator (Admin)
- **Role:** Full system management, resetting environments, adding/modifying profiles.
- **Batch No / Username:** `admin`
- **Session PIN:** `111111`
- **Master Password:** `admin`

### 2. Malkhana In-charge (HC Priya Verma / Operator 092)
- **Role:** Accepting seized devices, verifying seals, assigning vault grid locations.
- **Batch No / Username:** `op_092`
- **Session PIN:** `092092`
- **Master Password:** `op_092`

### 3. Sub-Inspector (SI Rajesh Sharma)
- **Role:** Investigating Officer (IO). Creates cases, logs new seizures, runs crime-scene hash triage.
- **Batch No / Username:** `io_rajesh`
- **Session PIN:** `112233`
- **Master Password:** `io_rajesh`

### 4. Forensic Examiner (Dr. Vance / FSL Expert)
- **Role:** Forensic imaging, generating H3 hashes, drafting and digitally signing BSA Section 63 certificates.
- **Batch No / Username:** `dr_vance`
- **Session PIN:** `445566`
- **Master Password:** `dr_vance`

---

## Sandbox Walkthrough Steps

To test the end-to-end Indian forensic chain of custody in the sandbox, follow this workflow:

1. **Step 0 — Forensic Login:**
   - Log in as Sub-Inspector Rajesh (`io_rajesh` / `112233`). This initiates a custody session.
2. **Step 1 — Case Seizure:**
   - Go to **NEW INGESTION** (`NEW_INGESTION`).
   - Enter a Case CNR, Case FIR (e.g. `FIR 45/2026`), and Investigating Officer details.
   - Stage 3: Enter Panch witness names, specify the device parameters, and check the write-blocker verification checkbox.
   - Stage 4: Run the zero-trust terminal to copy the device bit-stream and generate the baseline **H1 Birth Hash**.
3. **Step 2 — Malkhana Storage:**
   - Log out, then log in as the Malkhana In-charge (`op_092` / `092092`).
   - Go to the **SEALED ARCHIVE** matrix.
   - Assign the newly ingested item to a physical slot coordinate (e.g. Row 5, Column 8).
   - Perform the **H2 Receipt Hash** check. Verify that H1 matches H2.
4. **Step 3 — FSL Extraction & Certificate:**
   - Log out, then log in as Forensic Examiner Vance (`dr_vance` / `445566`).
   - Go to the **REPORTS** view.
   - Select the evidence item to draft the Section 63 Certificate.
   - Hold the seal button to cryptographically lock the certificate with the final **H3 Analysis Hash**.
   - Export the Section 63 Certificate as a court-admissible PDF.
