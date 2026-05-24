# SECURITY POLICY — MALKHANA VAULT

Malkhana Vault is a forensic-grade digital evidence custody application designed for Indian Law Enforcement. Evidence integrity and data confidentiality are critical.

## Local Data Sovereignty & No-Cloud Guarantee

1. **100% Offline-First Architecture:** Malkhana Vault does not connect to any external cloud service or transmit metadata/evidence files over the internet.
2. **Zero External Data Leakage:** All cases, evidence assets, timestamps, audit trails, and biometric hashes reside strictly on the local installation machine.
3. **No Backdoors:** No remote access interfaces, telemetry, or diagnostic reporting channels are compiled into the application binary.

## Cryptographic Security Disclosures

- **Database Encryption:** Case metadata and logs are secured using a SQLCipher (AES-256-CBC) database.
- **Key Derivation:** Master passwords are run through PBKDF2 key derivation with 256,000 iterations before generating the database decryption key. The key is never cached on disk.
- **Hash Verification:** Dual hashing (SHA-256 and MD5) is performed on all evidence items to conform with the Indian National Cyber Forensic Protocol and BSA 2023 admissibility rules.
- **Session Sealing:** Custody session logs are sealed cryptographically using a sequential Merkle-rooted hash chain.

## Reporting Vulnerabilities

If you discover a security vulnerability in Malkhana Vault, please report it via the contact below. Do not open public GitHub issues for security bugs.

- **Reporting Channel:** Send details to `chandranshgupta@proton.me` (or the repository administrator's secure email address).
- **Required Details:** Please include a proof of concept (PoC), steps to reproduce, and details of the operating environment.
- **Responsible Disclosure:** We request that you give us reasonable time to patch the issue before making it public.
