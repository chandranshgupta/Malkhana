# MALKHANA VAULT — PRODUCT BRIEF & SPECIFICATION
**Secure Digital Custody System for Police Stations (SHOs & Malkhana In-Charges)**

Malkhana Vault digitizes the tracking of physical and digital forensic evidence. It replaces manual paper registers with an offline, encrypted, tamper-proof system aligned with the **Bharatiya Sakshya Adhiniyam (BSA), 2023** and **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**.

---

## 1. Key Legal Capabilities (Why it Stands in Court)

- **BSA Section 63 Admissibility:** Automatically generates legally-compliant admissibility certificates, eliminating manual drafting errors.
- **Triple-Hash Protocol:** Calculates MD5 and SHA-256 hashes at seizure (**H1**), receipt (**H2**), and laboratory analysis (**H3**) to prove evidence has not been tampered with.
- **Append-Only Ledger:** The database is cryptographically sealed and append-only. Delete and edit operations do not exist in the codebase.
- **Downtime Logs (§63(2)(c)):** Automatic logging of system shutdowns or power failures. Compliance disclosures are appended directly to the court certificate.

---

## 2. Technical Safeguards (Air-Gapped Security)

- **100% Offline-First:** Works on local police computers without internet access, eliminating remote hacking or data leaks.
- **AES-256 DB Encryption:** The entire system database is encrypted at rest using SQLCipher (AES-256-CBC) with PBKDF2 key derivation (256,000 iterations).
- **Physical Drawer Matrix:** Integrates a visual 150-drawer coordinate grid (e.g. Row 5, Column 8) to map and track physical evidence locations.
- **Biometric Session Verification (Step 0):** Logs active sessions with silent biometric hashes (camera snapshot and voice capture) linking physical identity to digital actions.

---

## 3. Product Licensing & Tiers

| Tier | Name | Deployment | Target | Pricing | Key Features |
|------|------|------------|--------|---------|--------------|
| **T0** | **Open Core** | USB Portable | Single Officers / Small Stations | **Free** | Local DB, 3 concurrent cases, AppImage format, full BSA compliance. |
| **T1** | **Station** | Local PC Install | Individual Police Station | **₹15,000/yr** | 5 officer profiles, unlimited cases, .deb/.rpm installers, email support. |
| **T2** | **District** | Sync Cluster | SP Office / District HQ | **₹75,000/yr** | 25 seats, Supabase metadata sync (no raw files), SP metrics dashboard. |
| **T3** | **Enterprise** | On-Premises Server | State Cyber Cells / NIA / CBI | **₹3–8L/yr** | Unlimited seats, custom API integrations, dedicated support engineer. |

---

## 4. Minimum Hardware Requirements

- **Processor:** Intel i3 or AMD Ryzen 3 (Ryzen 5/i5 recommended for fast hashing)
- **Memory:** 4GB RAM (8GB recommended for multi-threaded triage)
- **Operating System:** Ubuntu 22.04 LTS+, Debian 12+, or Windows 10/11
- **Peripherals (Optional):** Webcam and microphone for biometric session verification
