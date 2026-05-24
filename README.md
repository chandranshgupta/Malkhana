<table border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="65%" valign="top">

# MALKHANA VAULT — DIGITAL EVIDENCE CUSTODIAN

> **Malkhana Vault** is an offline-first, forensic-grade digital evidence management system built for Indian law enforcement. It transforms physical Malkhana (police property room) logbooks into a cryptographically secured local desktop application — establishing a court-admissible chain of custody under the **Bharatiya Sakshya Adhiniyam (BSA), 2023** and **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**.
>
> Every login opens a legally-bound custody session. Every evidence entry is anchored to a birth hash. Every handoff is triple-verified. The system produces a signed BSA Section 63 Admissibility Certificate exportable directly to court.


</td>
<td width="35%" valign="middle" align="center">
  <img src="assets/Logo.gif" alt="Malkhana Vault" width="240" />
</td>
</tr>
</table>

---

## Compliance & Technology Badges

![BSA 2023 Compliance](https://img.shields.io/badge/BSA%202023-Section%2063%20Admissible-success?style=for-the-badge&color=2e7d32)
![BNSS 2023 Seizure Power](https://img.shields.io/badge/BNSS%202023-Section%20153%20Compliant-blue?style=for-the-badge&color=1565c0)
![Tauri Framework](https://img.shields.io/badge/Tauri-v2.11%20Stable-orange?style=for-the-badge&logo=tauri&logoColor=white)
![Rust Backend](https://img.shields.io/badge/Rust-1.95%20Edition-black?style=for-the-badge&logo=rust&logoColor=white)
![React Frontend](https://img.shields.io/badge/React-19.2%20Vite-blue?style=for-the-badge&logo=react&logoColor=white)
![Database Encryption](https://img.shields.io/badge/SQLCipher-AES%20256%20CBC-purple?style=for-the-badge&logo=sqlite&logoColor=white)
![Offline First Policy](https://img.shields.io/badge/Execution-100%25%20Offline-darkgreen?style=for-the-badge)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Ingestion to Court Data Flow](#2-ingestion-to-court-data-flow)
3. [Session-as-Chain-of-Custody (Step 0)](#3-session-as-chain-of-custody-step-0)
4. [Triple-Hash Verification Sequence](#4-triple-hash-verification-sequence)
5. [User Personas & Operational Roles](#5-user-personas--operational-roles)
6. [National Cyber Forensic Protocol Alignment](#6-national-cyber-forensic-protocol-alignment)
7. [Security & Database Architecture](#7-security--database-architecture)
8. [Sandbox & Demo Credentials](#8-sandbox--demo-credentials)
9. [Developer Onboarding & Local Build](#9-developer-onboarding--local-build)
10. [Known Issues & Technical Debt](#10-known-issues--technical-debt)
11. [Documentation Index](#11-documentation-index)

---

## 1. System Architecture

Malkhana Vault separates concerns across a React-based industrial WebView frontend, a secure Tauri IPC bridge, and a memory-safe Rust backend.

| Architectural Layer | Technology | Key Concern & Forensic Guardrail |
|---------------------|------------|---------------------------------|
| **Frontend UI** | React 19.2 + Vite + Tailwind CSS | Modern blueprint-style interface, zero local storage caching, locale translation context. |
| **Desktop Shell** | Tauri v2.11 WebView | Secure sandboxed shell, IPC command bridge (`tauri::invoke`), local file/process management. |
| **Backend Core** | Rust 1.95 (Stable) | Multi-threaded chunked file hashing, dc3dd process spawning, local system validation. |
| **Data Layer** | rusqlite + bundled-sqlcipher | Statically compiled open-source database with AES-256-CBC encryption, WAL logging. |
| **Temporal Guard** | System RTC (locked to IST) | Enforces tamper-free, chronological timelines (UTC+05:30) for legal logs. |

```mermaid
graph TB
    subgraph UI["React Frontend (WebView)"]
        direction TB
        EL[EVIDENCE_LOG]
        AC[ACTIVE_CUSTODY]
        SA[SEALED_ARCHIVE]
        RP[REPORTS]
        SS[SYSTEM_SETTINGS]
        NI[NEW_INGESTION]
        LP[Language Picker]
        LG[Login / Step 0]
    end

    subgraph BRIDGE["Tauri IPC Bridge"]
        INV["invoke() — type-safe commands"]
        EVT["emit/listen — async events"]
        STORE["tauri-plugin-store (prefs)"]
    end

    subgraph RUST["Rust Backend (src-tauri)"]
        direction TB
        subgraph CMD["Commands Layer"]
            CC[case_commands]
            EC[evidence_commands]
            CUC[custody_commands]
            CERT[certificate_commands]
            SES[session_commands]
            SET[settings_commands]
        end
        subgraph CORE["Core Engines"]
            HE[hash_engine\nSHA-256 + MD5]
            ME[merkle_tree]
            SE[session_engine]
            CE[certificate_engine]
            IE[imaging_engine\ndc3dd]
            TA[time_authority\nIST-locked]
            AUL[audit_logger\nappend-only]
        end
        subgraph DATA["Data Layer"]
            DB[(SQLCipher DB\nAES-256)]
            FS[File Vault\nencrypted]
        end
        subgraph I18N["i18n Module"]
            LOC[locale loader\n22 JSON files]
        end
    end

    subgraph EXTERNAL["External / Hardware"]
        CAM[Camera\nbiometric snapshot]
        MIC[Microphone\nvoice sample]
        USB[USB Block Device\nevidence media]
        PDF[Court PDF\nexport]
        SHL[system_health_log\nBSA §63-2-c]
    end

    UI -- invoke/listen --> BRIDGE
    BRIDGE -- Rust fn calls --> CMD
    CMD --> CORE
    CMD --> DATA
    CORE --> DATA
    SE --> CAM
    SE --> MIC
    IE --> USB
    CE --> PDF
    CORE --> SHL
    LOC --> UI
```

---

## 2. Ingestion to Court Data Flow

Tracks the chronological custody and verification checks applied to digital evidence:

```mermaid
flowchart LR
    A([Crime Scene\nIO + Panch]) -->|"Seize device\n+ Faraday bag"| B[NEW_INGESTION\nStage 1: Case Anchor]
    B -->|Link CNR / create case| C[Stage 2: Asset Details\ntype, IMEI, serial]
    C -->|"Panch witness names\n+ physical condition"| D[Stage 3: Physical Custody\nwrite-blocker checkbox]
    D -->|"dc3dd imaging\n→ bit-stream copy"| E[Stage 4: Zero-Trust Terminal\nH1 hash generated]
    E -->|"SHA-256 + MD5\nstored in DB"| F[(evidence table\nH1 locked)]

    F -->|Transport to station| G[SEALED_ARCHIVE\nMatrix slot assigned\nH2 verification]
    G -->|"H1 == H2 ✅\nno Malkhana Gap"| H[(custody_chain\nINTAKE entry)]

    H -->|Transfer to FSL| I[FSL Receipt\nH2 re-verified\non arrival]
    I -->|"Forensic imaging\nanalysis on copy"| J[H3 hash generated\npost-analysis]
    J -->|"H2 == H3 ✅\ndata integrity confirmed"| K[REPORTS view\nSection 63 draft]

    K -->|"Hold-to-seal\nreal hash from Rust"| L[certificate table\nlocked + signed]
    L -->|PDF export| M([Court Submission])

    style A fill:#1e293b,color:#f4f7f9
    style M fill:#1e293b,color:#f4f7f9
    style F fill:#0ea5e9,color:#fff
    style H fill:#0ea5e9,color:#fff
    style L fill:#0ea5e9,color:#fff
```

---

## 3. Session-as-Chain-of-Custody (Step 0)

Rather than just restricting user views, logging into Malkhana Vault opens a legally-bound custody session:

```mermaid
stateDiagram-v2
    [*] --> PRE_LOGIN : App launched

    PRE_LOGIN --> IDENTIFYING : Officer enters\nbatch_no + PIN

    IDENTIFYING --> WITNESSING : PIN verified
    IDENTIFYING --> PRE_LOGIN : PIN rejected\n(3 attempts → lockout)

    WITNESSING --> ACTIVE : System fingerprint captured\nCamera snap + audio hashed\nSession record opened\nsessions.opened_at written

    ACTIVE --> ACTIVE : Officer works\nSession events logged\nEvery click → session_events

    ACTIVE --> AUTO_LOCKED : 3 min inactivity\n(unless op in progress)

    AUTO_LOCKED --> REAUTHING : Officer returns\nPIN entry screen shown

    REAUTHING --> ACTIVE : PIN verified\nNew biometric captured\nREAUTH event logged

    REAUTHING --> AUTO_LOCKED : PIN rejected

    ACTIVE --> COSIGN_PENDING : Second officer\ninitiated co-sign

    COSIGN_PENDING --> COSIGNED : Co-signer batch_no + PIN\n+ biometric verified\nsession_cosigners written

    COSIGNED --> ACTIVE : Co-sign released

    ACTIVE --> SEALING : Officer clicks Logout

    SEALING --> SEALED : Session summary generated\nMerkle root computed\nsessions.closed_at written\nImmutable record finalized

    SEALED --> [*]

    note right of WITNESSING
        BSA §63(2)(a)
        Lawful control period begins
    end note

    note right of SEALED
        BSA §63(2)(a)
        Lawful control period ends
        Court-ready session record
    end note
```

---

## 4. Triple-Hash Verification Sequence

```mermaid
sequenceDiagram
    participant IO as Investigating Officer
    participant APP as Malkhana Vault
    participant DB as SQLCipher DB
    participant MIC as Malkhana In-Charge
    participant FSL as FSL Examiner

    Note over IO,APP: CRIME SCENE — Device Seized
    IO->>APP: NEW_INGESTION → Stage 4
    APP->>APP: dc3dd bit-stream image
    APP->>APP: SHA-256 + MD5 chunked hash
    APP-->>IO: H1 value displayed
    IO->>APP: Confirm + sign (Panch present)
    APP->>DB: evidence.hash_sha256 = H1<br/>evidence.hash_md5 = H1_md5<br/>seized_at = IST timestamp
    APP->>DB: custody_chain → SEIZED entry

    Note over MIC,APP: POLICE STATION — Malkhana Receipt
    MIC->>APP: Scan sealed evidence, enter H1
    APP->>APP: Re-hash original image → H2
    APP->>APP: Compare H1 == H2?

    alt H1 == H2 — Integrity confirmed
        APP-->>MIC: ✅ MALKHANA ACCEPTED
        APP->>DB: custody_chain → INTAKE<br/>hash_at_transfer = H2<br/>hash_verified = 1
        APP->>DB: archive_matrix slot assigned
    else H1 ≠ H2 — Malkhana Gap detected
        APP-->>MIC: 🚨 HASH MISMATCH — MALKHANA GAP<br/>Evidence may have been accessed in transit
        APP->>DB: custody_chain → INTAKE<br/>hash_verified = 0<br/>notes = MISMATCH FLAGGED
        Note over APP,DB: Certificate engine will<br/>include gap warning
    end

    Note over FSL,APP: FSL LAB — Analysis
    FSL->>APP: Receive sealed device, verify H2
    APP->>APP: Re-hash on FSL machine → H3
    APP->>APP: Compare H2 == H3?

    alt H2 == H3 — No FSL tampering
        APP-->>FSL: ✅ ANALYSIS AUTHORISED
        APP->>DB: custody_chain → EXAMINED<br/>hash_at_transfer = H3<br/>hash_verified = 1
    else H2 ≠ H3 — FSL alteration detected
        APP-->>FSL: 🚨 HASH MISMATCH — FSL ALTERATION<br/>Forensic examiner may have modified data
        APP->>DB: custody_chain → EXAMINED<br/>hash_verified = 0<br/>notes = FSL MISMATCH
    end

    FSL->>APP: Generate Section 63 certificate
    APP->>DB: Read all custody_chain entries
    APP->>APP: Build certificate with hash audit trail
    APP-->>FSL: PDF ready for court submission
```

---

## 5. User Personas & Operational Roles

Malkhana Vault uses Role-Based Access Control (RBAC) designed around four key law enforcement roles:

- **Investigating Officer (IO):** Initiates cases, logs new seizures, runs crime-scene hash triage, captures Panch witness details, and generates Form CC-1.
- **Malkhana In-Charge:** Oversees physical evidence intake, maps devices to the 150-drawer matrix grid, and executes the H2 Receipt Hash integrity check.
- **Forensic Examiner (FSL Expert):** Generates bit-stream images, runs post-extraction H3 hashes, audits the chain, and signs the Section 63 Admissibility Certificate.
- **Court Records Clerk:** Verifies the cryptographic chain and validates exported digital signatures before presenting evidence to the magistrate.

---

## 6. National Cyber Forensic Protocol Alignment

The application matches the step-by-step custody lifecycle defined in the **National Cyber Forensic Protocol**:

1. **Crime Scene Ingestion:** IO generates the **H1 Birth Hash** immediately at the scene. Panch witness details and write-blocker usage are recorded.
2. **Sealed Storage Handoff:** Malkhana In-Charge assigns physical coordinates (matrix grid) and verifies the **H2 Receipt Hash** ($H_1 == H_2$) to detect any "Malkhana Gap" during transport.
3. **Laboratory Forensic Imaging:** FSL Examiner re-verifies the H2 hash, writes a bit-stream forensic image copy, generates the **H3 Analysis Hash**, and verifies that $H_2 == H_3$ to prove zero alteration by the analyst.
4. **Admissibility Certification:** The FSL Expert exports the cryptographically-sealed **BSA Section 63 Admissibility Certificate** containing the full audit history.

---

## 7. Security & Database Architecture

### Cryptographic Ledger (SQLCipher Schema)

All transaction schemas are cryptographically linked in an encrypted, append-only SQLite database:

- **`officer_profiles` & `sessions`:** Auth is treated as a custody event (Step 0). Captures system fingerprints (MAC, IP, Hostname) and biometrics.
- **`cases` & `evidence`:** Maps digital evidence parameters, status (`ACTIVE`, `SEALED`, `DISPOSED`), and H1/H2/H3 hash values.
- **`audit_log`:** Encoded as a chronological Merkle Tree log. Any attempt to modify a past row invalidates the Merkle Root, rendering database tampering immediately obvious.
- **`system_health_log`:** Captures system lifecycle events (`STARTUP`, `SHUTDOWN`, `POWER_LOSS`, `CRASH`) for automated compliance with **BSA Section 63(2)(c)**.

### Power Loss & Offline Resilience

- **SQLite WAL Mode:** Police stations in rural regions experience frequent load-shedding. The database operates in Write-Ahead Logging (WAL) mode — transactions are committed to a log file first, ensuring zero database corruption if the machine drops power mid-write.
- **PBKDF2 Key Derivation:** Master database encryption keys are derived using 256,000 PBKDF2 iterations with SHA-256, defending against offline brute-force attacks.
- **Multilingual Vernacular Support:** Full localization for all 22 scheduled languages of India (treated equally without hierarchy) ensures clear UI operation in regional languages.

> ⚠️ **Offline Font Note:** The application loads Space Mono and 22 Noto script fonts from Google Fonts CDN at startup. On fully air-gapped machines, font fetches will fail silently and the OS fallback fonts will be used. UI layout remains functional, but regional script rendering may degrade. A bundled-font build variant is planned.

---

## 8. Sandbox & Demo Credentials

For testing and evaluation in the sandbox environment, use the following pre-seeded credentials:

| Field | Value |
|---|---|
| **Officer ID / Batch Number** | `op_092` |
| **PIN** | `092092` |
| **Password** | `092092` |
| **Role** | Administrator / Investigating Officer |

> ⚠️ **Do not delete `malkhana.db`** during testing unless you intend to wipe all local state. To reset safely, re-run with demo credentials above.

---

## 9. Developer Onboarding & Local Build

### Key Files to Read First

| File | Why |
|---|---|
| `src-tauri/src/data/schema.rs` | Defines the forensic database schema — the source of truth for all data models |
| `src/api/invoke.js` | Tauri IPC bridge — every frontend-to-backend call goes through here |
| `src/App.jsx` | Monolithic frontend controller — manages auth, routing, and view state |

### Mental Model

Think of it as a high-security vault: the React frontend is the teller window, the Tauri IPC is the pneumatic tube, and the Rust/SQLCipher backend is the cryptographic vault itself.

### Prerequisites

1. **Rust:** Stable toolchain (1.77.2+)
2. **Node.js:** v18+ (v20 recommended) with `npm`
3. **C++ Build Tools:** Required to compile SQLCipher from source
4. **OpenSSL:** Win64 OpenSSL v3.x or v1.1.1 (Windows only — ensure `OPENSSL_DIR` is set)

### Getting Started

```bash
# Install frontend dependencies
npm install

# Launch in development mode
npm run tauri:dev
```

### Compile Production Installers

```bash
npm run tauri:build
```

- **Windows:** Produces `.msi` and `.exe` (NSIS) installers in `src-tauri/target/release/bundle/`
- **Linux:** Produces `.deb`, `.AppImage`, and `.rpm` packages

### Where to Make Changes

| Task | Location |
|---|---|
| Add DB tables | `schema.rs` + `models.rs` |
| Add backend logic | `commands/*.rs` |
| Add UI views | `src/components/` → wire in `App.jsx` |
| Add translations | `src/i18n.js` (locale dictionaries) |

---

## 10. Known Issues & Technical Debt

These are tracked and acknowledged — contributions are welcome:

| Severity | Issue |
|---|---|
| 🔴 High | **Hardcoded fallback key** in `user_commands.rs` (`malkhana-vault-2024-secure-key-v1`). Must be removed before any production deployment. |
| 🔴 High | **`App.jsx` is a God Object** — handles auth, routing, state, and layout. Needs decomposition into context providers and a proper router. |
| 🟡 Medium | **Schema avoidance in `signing_commands.rs`** — digital signatures are stuffed into the `device_description` text column to bypass SQLite migrations. |
| 🟡 Medium | **No `.env.example`** and no developer setup guide for Windows/Linux-specific OpenSSL path configuration. |
| 🟡 Medium | **Stub files are empty** — `encryption.rs`, `integrity_checker.rs`, `constants.rs`, `formatters.rs`, `validators.rs` contain no logic yet. |
| 🟢 Low | **Font CDN dependency** — `fontLoader.js` fetches from Google Fonts, breaking regional script rendering on air-gapped machines. |
| 🟢 Low | **Test coverage is minimal** — cryptographic and Merkle validation paths lack integration tests. |

> See `SECURITY.md` (planned) for responsible disclosure of security-related issues.

---

## 11. Documentation Index

Extended documentation is published to the `gh-pages` branch and served via GitHub Pages:

- **[Live Project Homepage & Demo Walkthrough](https://chandranshgupta.github.io/Malkhana/)**
- **[Printable Product Brief (PDF)](https://chandranshgupta.github.io/Malkhana/collateral/product-brief.pdf)**
- **[Cryptographic Architecture Whitepaper (PDF)](https://chandranshgupta.github.io/Malkhana/collateral/cryptographic-whitepaper.pdf)**
- **[Forensic & Legal Compliance Report (PDF)](https://chandranshgupta.github.io/Malkhana/compliance-report.pdf)**
- **[Sandbox Evaluation & Credentials Manual (PDF)](https://chandranshgupta.github.io/Malkhana/evaluation.pdf)**
- **[Step 0 Login Custody Explainer (PDF)](https://chandranshgupta.github.io/Malkhana/session-custody.pdf)**
- **[Triple-Hash Verification Protocol (PDF)](https://chandranshgupta.github.io/Malkhana/triple-hash.pdf)**
- **[Hardware & Offline Fallback FAQ (PDF)](https://chandranshgupta.github.io/Malkhana/hardware-faq.pdf)**
- **[Compilation & Developer Onboarding Guide (PDF)](https://chandranshgupta.github.io/Malkhana/contributing.pdf)**

---

> **License:** Proprietary. All rights reserved. This software is developed for Indian law enforcement use in compliance with BSA 2023 and BNSS 2023.
