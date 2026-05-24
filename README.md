# MALKHANA VAULT — DIGITAL EVIDENCE CUSTODIAN

Malkhana Vault is an **offline-first, forensic-grade digital evidence management system** designed specifically for Indian law enforcement. It digitizes physical Malkhana (police property room) logs into a secure local desktop application, establishing compliance under the **Bharatiya Sakshya Adhiniyam (BSA), 2023** and **Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023**.

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

## 1. System Architecture

Malkhana Vault separates concerns across a React-based industrial Webview frontend, a secure Tauri IPC bridge, and a memory-safe Rust backend.

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

## 5. Directory Mapping & Documentation Index

All primary documentation resides in the `docs/` folder to ensure this README remains high-level and scannable:

- **[Sandbox Evaluation Guide](file:///d:/Carrer/Projects/Malkhana/docs/evaluation.md):** Pre-seeded credentials (batch numbers, passwords, PINs) and walking through a trial ingestion.
- **[Step 0 Login Custody Explainer](file:///d:/Carrer/Projects/Malkhana/docs/session-custody.md):** Background on lawful control, fingerprinting, and session seals under BSA §63(2).
- **[Triple-Hash Verification details](file:///d:/Carrer/Projects/Malkhana/docs/triple-hash.md):** Detailed breakdown of H1, H2, H3 validation and handling forensic mismatches.
- **[Hardware & Offline Fallback FAQ](file:///d:/Carrer/Projects/Malkhana/docs/hardware-faq.md):** Operational guidelines for rural stations lacking cameras, mics, or persistent internet.
- **[Compilation & Contributing Guide](file:///d:/Carrer/Projects/Malkhana/docs/contributing.md):** Compilation steps for Node.js/Rust build chains and statically bundling SQLCipher.
