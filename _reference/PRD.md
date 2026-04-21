# MALKHANA VAULT — Product Requirements Document

**Version:** 4.0 (Definitive)  
**Classification:** Internal — Architecture & Execution Reference  
**Last Updated:** 2026-04-22  
**Status:** LOCKED after approval  

---

# 1. Executive Summary

Malkhana Vault is an **offline-first, forensically sound digital evidence management system** purpose-built for the Indian legal framework. It automates the chain of custody, evidence ingestion, cryptographic verification, and **BSA Section 63 certificate generation** — the single document that determines whether digital evidence is admissible in Indian courts.

The system is designed as a **custodian, not an analyzer**. It does not perform forensic analysis (that is the domain of Autopsy, FTK, Cellebrite). Instead, it ensures that every piece of digital evidence — from seizure to court submission — is tracked, hashed, sealed, and legally documented with zero gaps in the chain of custody.

**Key Differentiators:**

- First open-source tool built specifically for BSA 2023 compliance (not retrofitted from IEA §65B)
- Offline-first architecture — works in police stations with zero internet
- Portable deployment via USB — usable at crime scenes
- Exact BSA Schedule certificate format (not paraphrased)
- Triple-Hash verification protocol (H1 at seizure → H2 at receipt → H3 at analysis)
- Blueprint/brutalist UI designed for precision and zero ambiguity

**Target Delivery:** 2–3 months for Phase 1 (Linux), phased cross-platform thereafter.

---

# 2. Problem Statement & Vision

## 2.1 The Problem

In the Indian criminal justice system, digital evidence is rejected at an alarming rate due to:

1. **Missing or incorrect Section 63 certificates** — Courts require the exact BSA Schedule format. Most officers don't know how to generate hash values or fill the certificate correctly.

2. **Broken chain of custody** — The "Malkhana Gap": unexplained hours between seizure and FSL receipt where the device's integrity is unverifiable. In 2026, High Courts have held that even a 4-hour unexplained gap is sufficient for exclusion.

3. **No hash at seizure** — Officers seize devices but don't generate H1 (birth hash) at the spot. By the time the device reaches the FSL, there's no baseline to prove data wasn't altered.

4. **Ad-hoc record keeping** — Chain of custody logs are handwritten registers prone to gaps, illegible entries, and tampering.

5. **No integrated workflow** — Officers must use separate tools for imaging (dc3dd), hashing (sha256sum), certificate drafting (Word), and custody logging (paper register). No single system connects these steps.

## 2.2 The Vision

**A single application that a police officer can plug into a USB, boot at a crime scene, and within minutes: seize evidence with a hash, log the custody chain, generate a legally valid Section 63 certificate, and export a court-ready package — all without internet.**

The system makes it nearly impossible to break the chain of custody because every action is logged, hashed, and immutable from the moment of first contact with evidence.

## 2.3 Legal Anchors

| Statute | Relevance |
|---|---|
| **BSA §63** (Bharatiya Sakshya Adhiniyam, 2023) | Admissibility of electronic records; certificate requirement |
| **BSA §63(4)** | Mandatory certificate in BSA Schedule format at each submission |
| **BSA §39** | Definition of "expert" — impacts Part B certificate signatory |
| **BNSS §153** | Seizure powers; chain of custody as statutory document |
| **IT Act §79A** | Examiner of Electronic Evidence designation |
| **2026 National Cyber Forensic Protocol** | Form CC-1 mandatory chain of custody document |

---

# 3. Target Users & Personas

## 3.1 Primary Users

### Persona A: Investigating Officer (IO)

- **Who:** Police sub-inspector to inspector rank
- **Context:** Arrives at a crime scene, seizes a mobile phone or hard drive
- **Pain:** Doesn't know how to generate hash values, fill Section 63 certificate, or maintain digital chain of custody
- **Need:** One-click seizure logging with auto-hash and auto-certificate

### Persona B: Malkhana In-Charge (Custodian)

- **Who:** Police constable or head constable managing the property room
- **Context:** Receives seized devices, stores them, transfers to FSL
- **Pain:** Paper register system with no way to verify seal integrity or track custody gaps
- **Need:** Digital Malkhana with coordinate-based storage tracking and custody transfer logging

### Persona C: FSL Examiner (Forensic Expert)

- **Who:** Forensic Science Laboratory examiner handling digital evidence
- **Context:** Receives forensic images, performs analysis, signs Part B of certificate
- **Pain:** No standardized system to verify H1 matches H2 upon receipt, fragmented certificate workflow
- **Need:** Hash verification dashboard, Part B signing workflow, examination report templates

### Persona D: Private Forensic Consultant

- **Who:** Independent forensic examiner hired by defense or prosecution
- **Context:** Verifies chain of custody, audits hash logs, challenges evidence integrity
- **Pain:** No standardized format for custody audit reports
- **Need:** Audit trail viewer, hash comparison tools, exportable custody reports

## 3.2 Secondary Users

### Persona E: Forensic Institute / Academy

- **Who:** Training institutions (NFSU, CDAC, university forensic departments)
- **Context:** Teaching students digital evidence handling procedures
- **Need:** Demo mode with simulated evidence workflows, educational documentation

### Persona F: Court / Judge (Read-Only)

- **Who:** Judicial officers reviewing submitted evidence
- **Context:** Receiving evidence packages with certificates and custody logs
- **Need:** QR-verifiable certificates, clear audit trail exports, tamper-evident seals

---

# 4. Product Tiers & Monetization

## 4.1 Tier Structure

| Tier | Name | Target | Cost |
|---|---|---|---|
| **Tier 0** | Community Edition | Open source, full-featured for individual use | **Free (forever)** |
| **Tier 1** | Station License | Police stations, single-unit deployment | Freemium / Donation |
| **Tier 2** | Lab Edition | FSL / forensic labs with multi-user + sync | Paid (subscription) |
| **Tier 3** | Enterprise | State-level deployment with central dashboard | Custom pricing |

## 4.2 Monetization Strategy

This is primarily a **passion project with social impact**. Monetization is secondary but planned for sustainability:

1. **Open Core** — Core evidence management + certificate generation is always free and open source
2. **Paid Add-ons** — Multi-user sync (Supabase), enterprise audit dashboard, priority support
3. **Training & Certification** — Partnering with forensic academies (NFSU, CDAC) for certified training programs
4. **Government Procurement** — State police tenders for station-wide deployment after establishing credibility
5. **Forensic Consultant Marketplace** — Future: connecting evidence submitters with certified Part B experts

> [!NOTE]
> Monetization is explicitly Phase 4+. The immediate focus is building a tool that works perfectly and establishing credibility in the forensic community.

---

# 5. Feature Specification

## 5.1 Core Features (Phase 1)

### F1: Case Management

- Create new cases with FIR number, CNR, IO details, jurisdiction
- Link to existing cases via CNR (with format auto-validation per state)
- Case dashboard showing all linked evidence, custody events, certificates
- Case search by CNR, FIR number, IO name, date range

### F2: Evidence Ingestion

- **File-based ingestion** (Phase 1 priority): Hash any file (PDF, image, video, document)
- Capture metadata: file name, format, source origin, file size
- Auto-generate SHA-256 hash at ingestion (H1 — birth hash)
- Optional dual-hash (MD5 + SHA-256) as per BSA recommendation
- Seal number assignment and physical condition logging
- Timestamp locked to system IST (non-overridable)

### F3: Chain of Custody Logging

Every custody event records:

- **From** → **To** (person name, designation, organization)
- **Date & Time** (IST, 24-hour, auto-captured)
- **Purpose** (Seizure / Storage / Analysis / Transport / Court Submission / Return)
- **Seal Number** and **Seal Status** (Intact / Broken / Re-sealed)
- **Hash Verification** at each transfer (H1 → H2 → H3 protocol)
- **Physical Condition** (mandatory text field)
- **Location** (station/lab/court)
- **Panch Witness Details** (name, address — for seizure events)
- **Remarks**

> [!IMPORTANT]
> The Triple-Hash Protocol:
>
> - **H1 (Birth Hash):** Generated at seizure/ingestion — proves original state
> - **H2 (Receipt Hash):** Generated when custody transfers — proves no alteration during transport
> - **H3 (Analysis Hash):** Generated before forensic examination — proves no alteration during storage
>
> If H1 ≠ H2 at any transfer point, the system flags a **CHAIN INTEGRITY ALERT** — evidence may have been compromised during the gap.

### F4: Section 63 Certificate Engine

- **Exact BSA Schedule format** — sourced from `_reference/BSA Section 63 Certificate.pdf`
- **Part A** (Person in Charge / IO / Custodian):
  - Device identification and description
  - Manner of production
  - Declaration of regular use and proper operation
  - Hash value with algorithm checkbox (MD5 / SHA-1 / SHA-256)
  - Signed by person in charge of the device
- **Part B** (Expert):
  - Independent verification of electronic record
  - Hash verification confirmation
  - Expert qualifications and designation
  - Signed by expert (flexible — system allows same or different person)
- **Hash Report Annexure**: Auto-generated, attached to certificate
  - File name, hash algorithm, hash value, timestamp (IST)
- **Signature types**: Typed (Phase 1), Scanned image (Phase 1), DSC (Phase 3)
- **Immutability**: Once both parts are signed → PDF generated → document hash sealed → no further edits
- **QR Code**: Embedded in printed certificate encoding certificate UUID + hash + timestamp

### F5: File Vault (Designated Storage)

- Evidence files organized by case hierarchy: `/{CASE_CNR}/{EVIDENCE_UUID}/`
- Original files stored with read-only permissions
- Forensic images stored separately from originals
- Hash manifest file alongside each evidence item
- No delete operations — ever. Only append.
- Vault location configurable (XDG data path or external drive)

### F6: Search & Retrieval

- Global search across cases, evidence, custody logs, certificates
- Search by: CNR, FIR number, evidence ID, hash value, person name, date range, device type, seal number
- Coordinate-based search in Sealed Archive Matrix (as in UI)
- Results with relevance ranking and quick-jump to source

## 5.2 Secondary Features (Phase 2)

### F7: Forensic Imaging Interface

- Write-blocker verification before imaging
- dc3dd integration (primary), dd fallback
- Live terminal output during imaging process
- Hash computed simultaneously during imaging
- Support for E01, raw/dd output formats

### F8: Advanced Custody Board

- Visual custody trace (pin-board style, as in UI)
- Chronological thread of all personnel handling evidence
- Integration with personnel directory (name, designation, org, clearance level)
- Red-thread visualization connecting custody chain

### F9: Sealed Archive Matrix

- Digital twin of the physical Malkhana
- Coordinate-based grid (Row × Column) mapping to physical storage
- Search-to-locate: type case ID → grid highlights physical location
- Printable barcode labels for physical evidence bags
- Storage condition tracking

### F10: Device-Specific Evidence Types

- **Mobile**: IMEI, model, OS, ICCID, extraction type (Logical/Physical/FS)
- **CCTV/DVR**: Camera ID, location, time offset to IST, FPS, codec
- **Disk/SSD**: Capacity, filesystem, serial, interface type
- **USB/Pendrive**: Volume label, VID/PID, capacity, write-protect status
- **Cloud**: Account ID, IP, timezone, download checksum

## 5.3 Tertiary Features (Phase 3+)

### F11: Beyond Physical Devices

- Screenshots / screen recordings (with metadata capture)
- Email exports (.eml, .pst)
- Server/application logs
- IoT device data
- Cryptocurrency / blockchain records

### F12: Multi-Language Certificates

- English (Phase 1, locked)
- Hindi (Phase 3)
- Bilingual mode (both languages on same page)

### F13: Supabase Sync

- Queue-based sync engine
- Metadata only (case ID, evidence UUID, hash, custody logs)
- No file paths, no secrets, no evidence files in cloud
- Conflict handling: latest wins, previous versions preserved
- Offline-tolerant with retry logic

### F14: Report Templates

- FSL examination request forms
- Court submission cover sheets
- Evidence return/disposal receipts
- Custody audit reports

### F15: Merkle Audit Trail

- Every system action = leaf node in Merkle tree
- Merkle root exportable and independently verifiable
- Optional anchoring to OpenTimestamps (public timestamping)

---

# 6. Technical Architecture

## 6.1 Stack Decision

| Layer | Choice | Rationale |
|---|---|---|
| **Language** | Python 3.11+ | Rapid iteration, cross-platform, forensic tool ecosystem |
| **UI Framework** | PySide6 / Qt6 | Native desktop, Flatpak/AppImage support, cross-platform |
| **Primary DB** | SQLite + SQLCipher | Local-first, encrypted at rest for sensitive data |
| **Sync Layer** | Supabase (PostgreSQL) | Optional, metadata-only cloud sync |
| **Authentication** | Supabase Auth (when synced) | Multi-user access control |
| **Hashing** | hashlib (stdlib) | SHA-256, SHA-512, MD5 — no external dependencies |
| **Imaging** | dc3dd / dd (subprocess) | Industry-standard forensic imaging |
| **PDF Generation** | ReportLab / WeasyPrint | Certificate and report PDF output |
| **QR Codes** | qrcode (Python lib) | Certificate verification codes |
| **Environment** | Python venv | Clean dependency isolation |
| **Linter** | Ruff | Replaces Black + Flake8 + isort |
| **Testing** | pytest | Industry standard |
| **CI/CD** | GitHub Actions | Automated testing, packaging |
| **Packaging** | Flatpak / AppImage | Linux distribution |

> [!IMPORTANT]
> **The React/Vite UI (`App.jsx`) is the canonical design reference.** The production application is built in Python/PySide6, but **the base UI design is locked and must not be changed**. The blueprint/brutalist aesthetic, the 6 core views, the component layouts, the interaction patterns — all of it is preserved 1:1 in the Qt translation. **Only additions are accepted; no modifications to the existing design.**

## 6.2 UI Design Reference

The `App.jsx` (1374 lines) defines 6 locked views:

| View | Description | Key Interactions |
|---|---|---|
| **Evidence Log** | Card grid of seized evidence with wireframe illustrations, stamps, tags | Filter, view details, jump to ingestion |
| **Active Custody Board** | Pin-board with red-thread custody trace connecting personnel cards | Hover to highlight chain, pan/zoom |
| **Reports (Section 63 Drafting Table)** | Split-pane: inputs left, live document preview right | Part A → lock → Part B → hold-to-seal |
| **Sealed Archive Matrix** | 150-cell coordinate grid (10×15) representing physical Malkhana | Type-to-search with highlight animation |
| **System Settings** | Forensic engine config, sync controls, legal compliance lock | Sliders, toggles, locked bedrock section |
| **New Ingestion Workflow** | 4-stage wizard: Case Anchor → Classification → Custody Log → Terminal | Sequential stages, terminal simulation |

**Design Tokens (from App.jsx):**

- Background: `#f4f7f9` (light blueprint paper)
- Grid: 20px minor / 100px major grid lines at `rgba(100,116,139, 0.15/0.3)`
- Borders: `border-slate-400` (1px solid)
- Shadows: `shadow-[4px_4px_0px_rgba(100,116,139,0.1)]` (brutalist offset)
- Typography: `font-mono` for data, `font-serif` for legal text, `font-sans` for UI labels
- Accent: `#0ea5e9` (sky blue for certificate preview and active states)
- Alert: `#dc2626` (red for integrity warnings)
- Corner marks on all cards (registration marks)
- Stamps with circular forensic-control branding

## 6.3 Application Architecture

```
malkhana-vault/
├── src/
│   ├── main.py                     # Entry point, app initialization
│   ├── app.py                      # QApplication setup, main window
│   │
│   ├── ui/                         # All UI components (PySide6)
│   │   ├── main_window.py          # Main window with sidebar + view stack
│   │   ├── components/             # Reusable UI components
│   │   │   ├── blueprint_bg.py     # Blueprint grid background widget
│   │   │   ├── stamp.py            # Forensic stamp widget
│   │   │   ├── corner_marks.py     # Registration corner mark widget
│   │   │   ├── industrial_toggle.py
│   │   │   ├── search_bar.py
│   │   │   └── status_bar.py
│   │   ├── views/                  # 6 core views
│   │   │   ├── evidence_log.py
│   │   │   ├── active_custody.py
│   │   │   ├── reports_drafting.py
│   │   │   ├── sealed_archive.py
│   │   │   ├── system_settings.py
│   │   │   └── new_ingestion.py
│   │   ├── dialogs/                # Modal dialogs
│   │   │   ├── evidence_detail.py
│   │   │   ├── custody_transfer.py
│   │   │   └── certificate_preview.py
│   │   └── styles/                 # QSS stylesheets
│   │       ├── blueprint.qss       # Core blueprint theme
│   │       └── tokens.py           # Design token constants
│   │
│   ├── core/                       # Business logic (UI-agnostic)
│   │   ├── case_manager.py         # Case CRUD operations
│   │   ├── evidence_manager.py     # Evidence ingestion + vault operations
│   │   ├── custody_manager.py      # Chain of custody operations
│   │   ├── certificate_engine.py   # Section 63 certificate generation
│   │   ├── hash_engine.py          # Cryptographic hashing (SHA-256, MD5)
│   │   ├── imaging_engine.py       # dc3dd / dd subprocess management
│   │   ├── merkle_tree.py          # Merkle audit trail
│   │   ├── audit_logger.py         # Immutable audit log
│   │   ├── search_engine.py        # Global search across all entities
│   │   ├── vault_manager.py        # File vault operations + path management
│   │   ├── pdf_generator.py        # PDF output (certificates, reports)
│   │   ├── qr_generator.py         # QR code for certificates
│   │   └── time_authority.py       # IST time management + NTP verification
│   │
│   ├── data/                       # Data layer
│   │   ├── database.py             # SQLite/SQLCipher connection management
│   │   ├── models.py               # Data models (dataclasses)
│   │   ├── schema.py               # Schema definitions + migrations
│   │   ├── repository.py           # Data access layer (queries)
│   │   └── sync/                   # Supabase sync (Phase 3)
│   │       ├── sync_engine.py
│   │       ├── sync_queue.py
│   │       └── conflict_resolver.py
│   │
│   ├── security/                   # Security module
│   │   ├── encryption.py           # SQLCipher key management
│   │   ├── key_derivation.py       # KDF for master password → DB key
│   │   ├── integrity_checker.py    # Hash verification + chain validation
│   │   └── auth.py                 # Local auth (master password)
│   │
│   └── utils/                      # Shared utilities
│       ├── constants.py            # App-wide constants
│       ├── xdg_paths.py            # XDG directory resolution
│       ├── validators.py           # CNR format, input validation
│       ├── formatters.py           # Date/time formatting (IST)
│       └── logging_config.py       # Structured logging setup
│
├── assets/
│   ├── icons/                      # App icons (scalable SVG)
│   ├── fonts/                      # Bundled fonts if needed
│   ├── templates/                  # Certificate templates
│   │   └── section_63_template.json
│   └── org.malkhana.vault.desktop  # Desktop entry
│
├── tests/
│   ├── conftest.py
│   ├── test_hash_engine.py
│   ├── test_certificate_engine.py
│   ├── test_custody_manager.py
│   ├── test_vault_manager.py
│   ├── test_merkle_tree.py
│   └── test_integrity_checker.py
│
├── packaging/
│   ├── flatpak/
│   │   └── org.malkhana.vault.yml
│   └── appimage/
│       ├── AppRun
│       └── AppDir/
│
├── scripts/
│   ├── build.sh
│   └── run_tests.sh
│
├── _reference/                     # Design & legal references (not shipped)
│   ├── PRD.md
│   ├── Foundation.md
│   ├── BSA.pdf
│   ├── BSA Section 63 Certificate.pdf
│   └── App.jsx                     # UI design reference (React mockup)
│
├── .github/workflows/ci.yml
├── .pre-commit-config.yaml
├── pyproject.toml
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 6.4 Database Schema (SQLite + SQLCipher)

### Encryption Strategy

- **SQLCipher** for the primary database — all data encrypted at rest
- Master password → PBKDF2 (100,000 iterations) → AES-256 encryption key
- Key never stored on disk — derived at runtime from user's master password
- Unencrypted SQLite fallback for demo/educational mode

### Core Tables

```sql
-- Cases
CREATE TABLE cases (
    id              TEXT PRIMARY KEY,        -- UUID
    cnr             TEXT UNIQUE,             -- Case Number Record
    fir_number      TEXT,
    investigating_officer TEXT NOT NULL,
    jurisdiction    TEXT NOT NULL,
    court           TEXT,
    status          TEXT DEFAULT 'ACTIVE',   -- ACTIVE | CLOSED | ARCHIVED
    created_at      TEXT NOT NULL,           -- ISO 8601, IST
    updated_at      TEXT NOT NULL,
    remarks         TEXT
);

-- Evidence items
CREATE TABLE evidence (
    id              TEXT PRIMARY KEY,        -- UUID
    case_id         TEXT NOT NULL REFERENCES cases(id),
    evidence_number TEXT NOT NULL,           -- Human-readable (e.g., "EVD-001")
    device_type     TEXT NOT NULL,           -- DISK | MOBILE | CCTV | PENDRIVE | CLOUD | FILE
    description     TEXT NOT NULL,
    metadata_json   TEXT,                    -- Device-specific metadata (JSON)
    seal_number     TEXT,
    physical_condition TEXT,
    vault_path      TEXT,                    -- Relative path in file vault
    status          TEXT DEFAULT 'SEIZED',   -- SEIZED | IN_CUSTODY | UNDER_ANALYSIS | SEALED | RETURNED
    seized_at       TEXT NOT NULL,           -- ISO 8601, IST
    seized_by       TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    UNIQUE(case_id, evidence_number)
);

-- Hash records (append-only, never modified)
CREATE TABLE hashes (
    id              TEXT PRIMARY KEY,
    evidence_id     TEXT NOT NULL REFERENCES evidence(id),
    algorithm       TEXT NOT NULL,           -- SHA-256 | MD5 | SHA-512
    hash_value      TEXT NOT NULL,
    hash_type       TEXT NOT NULL,           -- H1_SEIZURE | H2_RECEIPT | H3_ANALYSIS | VERIFICATION
    computed_at     TEXT NOT NULL,           -- ISO 8601, IST
    computed_by     TEXT NOT NULL,
    file_name       TEXT,                    -- Source file name
    file_size       INTEGER,                -- Bytes
    remarks         TEXT
);

-- Chain of custody (append-only)
CREATE TABLE custody_log (
    id              TEXT PRIMARY KEY,
    evidence_id     TEXT NOT NULL REFERENCES evidence(id),
    from_person     TEXT NOT NULL,
    from_designation TEXT,
    from_org        TEXT,
    to_person       TEXT NOT NULL,
    to_designation  TEXT,
    to_org          TEXT,
    purpose         TEXT NOT NULL,           -- SEIZURE | STORAGE | ANALYSIS | TRANSPORT | COURT | RETURN
    seal_number     TEXT,
    seal_status     TEXT,                    -- INTACT | BROKEN | RE_SEALED
    physical_condition TEXT,
    location        TEXT,
    hash_verified   INTEGER DEFAULT 0,      -- Boolean: was hash checked at transfer?
    hash_match      INTEGER,                -- Boolean: did hashes match? NULL if not checked
    panch_witness_1 TEXT,                    -- JSON: {name, address, phone}
    panch_witness_2 TEXT,                    -- JSON: {name, address, phone}
    transferred_at  TEXT NOT NULL,           -- ISO 8601, IST
    remarks         TEXT,
    created_at      TEXT NOT NULL
);

-- Section 63 Certificates
CREATE TABLE certificates (
    id              TEXT PRIMARY KEY,
    evidence_id     TEXT NOT NULL REFERENCES evidence(id),
    case_id         TEXT NOT NULL REFERENCES cases(id),
    
    -- Part A fields
    part_a_name     TEXT,
    part_a_designation TEXT,
    part_a_device_type TEXT,
    part_a_control_type TEXT,                -- OWNED | MAINTAINED | MANAGED | OPERATED
    part_a_seal_number TEXT,
    part_a_signed_at TEXT,
    part_a_signature_type TEXT,              -- TYPED | SCANNED | DSC
    part_a_signature_data TEXT,              -- Base64 for scanned
    
    -- Part B fields
    part_b_name     TEXT,
    part_b_designation TEXT,
    part_b_lab_id   TEXT,
    part_b_hash_algorithm TEXT,
    part_b_signed_at TEXT,
    part_b_signature_type TEXT,
    part_b_signature_data TEXT,
    
    -- Certificate state
    status          TEXT DEFAULT 'DRAFT',    -- DRAFT | PART_A_LOCKED | COMPLETE | SEALED
    pdf_path        TEXT,                    -- Path to generated PDF
    pdf_hash        TEXT,                    -- Hash of the sealed PDF
    qr_data         TEXT,                    -- QR code payload
    sealed_at       TEXT,                    -- Timestamp of final seal
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

-- Immutable audit log (append-only, never modified, never deleted)
CREATE TABLE audit_log (
    id              TEXT PRIMARY KEY,
    action          TEXT NOT NULL,           -- Action type
    entity_type     TEXT NOT NULL,           -- cases | evidence | custody_log | certificates
    entity_id       TEXT NOT NULL,
    actor           TEXT NOT NULL,           -- Who performed the action
    details_json    TEXT,                    -- Action-specific details
    merkle_hash     TEXT,                    -- Hash of this entry + previous entry
    created_at      TEXT NOT NULL            -- ISO 8601, IST
);

-- Sync queue (for Supabase, Phase 3)
CREATE TABLE sync_queue (
    id              TEXT PRIMARY KEY,
    entity_type     TEXT NOT NULL,
    entity_id       TEXT NOT NULL,
    operation       TEXT NOT NULL,           -- INSERT | UPDATE
    payload_json    TEXT NOT NULL,
    status          TEXT DEFAULT 'PENDING',  -- PENDING | SYNCED | FAILED
    retry_count     INTEGER DEFAULT 0,
    created_at      TEXT NOT NULL,
    synced_at       TEXT
);
```

### Schema Rules

- **No DELETE operations exist in the codebase** — not even soft deletes
- All tables are append-only or update-only (for status changes)
- `audit_log` has a trigger-based Merkle chain: each entry's `merkle_hash` = SHA-256(current_entry + previous_merkle_hash)
- Timestamps are always ISO 8601 in IST (UTC+05:30)
- Schema migrations are versioned and tested

## 6.5 Portable Deployment (USB Mode)

The application supports running directly from a USB drive:

1. **AppImage on USB**: Plug in → Run `./MalkhanaVault.AppImage` → Fully functional
2. **Data on USB**: XDG paths can be overridden via environment variable to store data on the USB itself
3. **Auth levels**: USB deployment uses local auth (master password) — no network required
4. **Use case**: IO at crime scene plugs USB into any Linux machine, generates H1 hash, logs seizure, prints certificate

```
USB_DRIVE/
├── MalkhanaVault.AppImage
├── data/                     # Portable data directory
│   ├── vault.db              # SQLCipher database
│   ├── evidence/             # Evidence file vault
│   └── exports/              # Generated PDFs
└── config/
    └── settings.json         # Portable config
```

---

# 7. Security Architecture

## 7.1 Core Security Principles

1. **No silent failures** — All errors logged with context, critical failures halt operation
2. **Append-only records** — No delete, no overwrite on evidence/custody/audit data
3. **Local secrets only** — No credentials in source code or committed files
4. **Zero-trust evidence handling** — Original device NEVER modified; analysis only on forensic image
5. **Encrypted at rest** — SQLCipher for database, evidence files in permission-controlled vault

## 7.2 Encryption Architecture

```
┌──────────────────────────────────────────┐
│           USER ENTERS MASTER PASSWORD     │
│                    │                      │
│                    ▼                      │
│          PBKDF2-HMAC-SHA256              │
│          (100,000 iterations)            │
│          Salt: per-installation random    │
│                    │                      │
│                    ▼                      │
│          256-bit AES KEY                 │
│                    │                      │
│         ┌──────────┴──────────┐          │
│         ▼                     ▼          │
│    SQLCipher DB          HMAC Key        │
│    (encrypted)        (audit integrity)  │
└──────────────────────────────────────────┘
```

- **Database**: SQLCipher with AES-256-CBC
- **Key derivation**: PBKDF2 with random per-install salt (stored in XDG config)
- **Key storage**: NEVER stored on disk — derived from password at each session
- **Supabase (when enabled)**: Only anon/public keys in client — no service role keys ever

## 7.3 Evidence Integrity

| Mechanism | Purpose |
|---|---|
| SHA-256 hashing | Primary integrity verification |
| Dual-hash (MD5 + SHA-256) | Collision resistance per BSA recommendation |
| Triple-Hash Protocol | H1→H2→H3 at each custody transfer |
| Merkle audit trail | Tamper-evident action log |
| Append-only tables | No historical data can be altered |
| PDF signing | Generated certificates are hash-sealed |
| QR verification | Independent hash check without system access |

---

# 8. Development Standards & Coding Conventions

## 8.1 Code Quality Rules

| Standard | Implementation |
|---|---|
| **Formatter** | Ruff (replaces Black) — enforced via pre-commit hook |
| **Linter** | Ruff (replaces Flake8 + isort) |
| **Type Hints** | Mandatory on all function signatures |
| **Docstrings** | Required on all public classes and functions (Google style) |
| **Naming** | `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE` for constants |
| **Max line length** | 99 characters |
| **Imports** | Sorted by Ruff (stdlib → third-party → local) |
| **Tests** | Every core module must have corresponding test file |
| **Logging** | `logging` module, structured format, daily rotation |

## 8.2 Architecture Rules (Non-Negotiable)

1. **XDG Base Directory Standard** — All mutable data uses XDG paths, resolved dynamically at runtime. No hardcoded absolute paths.

2. **Agnostic Core** — `src/core/` must NOT import from `src/ui/`. Core logic is UI-framework agnostic. No `APPIMAGE` or `FLATPAK_ID` checks in application code.

3. **Asset and Data Separation** — Static assets loaded relative to application directory. Mutable data uses XDG paths. Never mix.

4. **Secrets Management** — `python-dotenv` for local `.env`. Supabase anon keys only in client. Service role keys NEVER shipped.

5. **Fail Loud** — Missing config → crash at startup, not silent degradation. Missing required fields → block operation, show clear error.

6. **IST Everywhere** — All timestamps in IST (UTC+05:30), 24-hour format, ISO 8601 internally, human-readable in UI.

## 8.3 Git Workflow

- **Branches**: `main` (stable), `dev` (active development), `feature/*` (per-feature)
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **Pre-commit hooks**: Ruff format + lint, pytest (fast suite only)
- **CI**: GitHub Actions on push to `main`/`dev` and on PRs to `main`

---

# 9. Phased Execution Plan

## Phase 1: Foundation & Core (Weeks 1–4)

**Goal:** "Hash a file, log custody, generate a certificate"

- [ ] Project scaffolding (directory structure per §6.3)
- [ ] XDG paths module
- [ ] SQLCipher database setup with schema v1
- [ ] Hash engine (SHA-256, MD5)
- [ ] Case management (create, search, list)
- [ ] Evidence ingestion — file-based hashing
- [ ] Chain of custody logging (basic: from/to/purpose/time)
- [ ] Certificate engine — exact BSA Schedule format from reference PDF
- [ ] PDF generation for certificates
- [ ] QR code on certificates
- [ ] Audit logger (append-only)
- [ ] PySide6 UI: Evidence Log view (from App.jsx design)
- [ ] PySide6 UI: New Ingestion view (file-based only)
- [ ] PySide6 UI: Reports / Section 63 Drafting Table
- [ ] File vault with case-based directory structure
- [ ] Basic search (case ID, evidence ID)
- [ ] Master password auth + SQLCipher key derivation
- [ ] Unit tests for all core modules
- [ ] AppImage packaging for Linux

**Deliverable:** Working Linux app that can hash files, log custody, and produce court-ready Section 63 certificates.

---

## Phase 2: Evidence Lifecycle (Weeks 5–8)

**Goal:** "Full custody chain with device-specific ingestion"

- [ ] PySide6 UI: Active Custody Board view
- [ ] PySide6 UI: Sealed Archive Matrix view
- [ ] PySide6 UI: System Settings view
- [ ] Triple-Hash Protocol (H1, H2, H3 with chain integrity alerts)
- [ ] Device-specific evidence types (Mobile, CCTV, Disk, USB)
- [ ] Seal number tracking + physical condition logging
- [ ] Panch witness integration for seizure events
- [ ] Forensic imaging interface (dc3dd integration)
- [ ] Write-blocker verification
- [ ] Advanced search (full-text across all entities)
- [ ] Barcode label generation for evidence bags
- [ ] Merkle audit trail
- [ ] Export: custody audit report, chain of custody PDF
- [ ] USB portable mode

**Deliverable:** Full evidence lifecycle management with device-specific workflows.

---

## Phase 3: Multi-User & Sync (Weeks 9–12)

**Goal:** "Lab-grade multi-user deployment"

- [ ] Supabase sync engine (metadata-only)
- [ ] Role-Based Access Control (RBAC)
- [ ] Multi-user certificate workflow (Part A → Part B by different users)
- [ ] DSC (Digital Signature Certificate) integration
- [ ] Hindi certificate template
- [ ] Report templates (FSL request, court cover sheet, disposal receipt)
- [ ] Beyond-physical evidence types (screenshots, emails, server logs)
- [ ] Time authority verification (NTP check on startup)
- [ ] Flatpak packaging
- [ ] Integration tests + CI pipeline hardening

**Deliverable:** Multi-user forensic lab deployment with cloud sync.

---

## Phase 4: Scale & Monetize (Month 4+)

**Goal:** "Enterprise readiness"

- [ ] Cross-platform: Windows packaging (MSIX / installer)
- [ ] Enterprise audit dashboard
- [ ] RFID support for automated custody tracking
- [ ] Blockchain / OpenTimestamps hash anchoring
- [ ] Training mode / demo mode for forensic academies
- [ ] Monetization infrastructure (license management)
- [ ] macOS packaging
- [ ] External tool plugin API (Autopsy, FTK report import)

---

# 10. Risk Analysis & Mitigation

| # | Risk | Severity | Probability | Mitigation |
|---|---|---|---|---|
| R1 | **Certificate format rejected by court** | Critical | Medium | Use exact BSA Schedule template from official PDF. No paraphrasing. Legal review before v1.0 |
| R2 | **Chain of custody gap** | Critical | High | Mandatory fields on every transfer. System blocks operations if required fields missing. Triple-hash protocol flags discrepancies |
| R3 | **Evidence tampering** | Critical | Low | Append-only DB, Merkle audit trail, SHA-256 hashing at every stage, SQLCipher encryption |
| R4 | **System clock manipulation** | High | Medium | NTP verification on startup (warning if clock drifts >5s), IST locked, no user-overridable timestamps |
| R5 | **Lost USB / portable deployment** | High | Medium | SQLCipher encryption — database is unreadable without master password even if USB is stolen |
| R6 | **"Expert" definition changes** | Medium | High | Flexible Part B workflow — system allows same person or different person to sign. Easily adaptable when courts settle interpretation |
| R7 | **Hash collision (MD5)** | Medium | Low | Dual-hash strategy (MD5 + SHA-256). SHA-256 is primary; MD5 for BSA backward compatibility |
| R8 | **Cloud sync failure** | Low | Medium | Offline-first design — cloud is always optional. Queue-based sync with retry logic |
| R9 | **Data loss** | Critical | Low | Built-in backup/restore. Vault data integrity checks. Export to external media |
| R10 | **Scope creep** | Medium | High | Phased execution plan. Phase 1 is minimal viable legal product. No feature added without addressing a real legal workflow gap |

---

# 11. Key Performance Indicators (KPIs)

## Technical KPIs

| Metric | Target |
|---|---|
| Hash computation speed (1 GB file) | < 30 seconds |
| Certificate PDF generation time | < 3 seconds |
| Application cold start time | < 5 seconds |
| Database query response (10K records) | < 100ms |
| Memory usage (idle) | < 150 MB |
| AppImage size | < 200 MB |

## Product KPIs (Post-Launch)

| Metric | Target (6 months) |
|---|---|
| Certificates generated | 500+ |
| Forensic labs using the tool | 5+ |
| GitHub stars | 200+ |
| Community contributors | 10+ |
| Certificate court acceptance rate | 100% (zero rejections due to format) |

## Legal Compliance KPIs

| Metric | Target |
|---|---|
| BSA Schedule format accuracy | 100% match to official template |
| Chain of custody gap alerts | Zero false negatives |
| Audit trail integrity | 100% verifiable Merkle chain |
| Hash verification success rate | 100% (H1=H2=H3 when evidence is untampered) |

---

# 12. Competitive Landscape

## 12.1 Existing Solutions

| Product | Type | India-Specific? | BSA §63 Support | Chain of Custody | Offline? | Cost |
|---|---|---|---|---|---|---|
| **Cellebrite Guardian** | Enterprise DEM | No | No | Yes | No | $$$$ |
| **OpenText DEM** | Enterprise DEM | No | No | Yes | No | $$$$ |
| **Magnet AXIOM** | Forensic Suite | No | No | Partial | Partial | $$$ |
| **Autopsy** | Open Source Forensic | No | No | No | Yes | Free |
| **FTK** | Forensic Suite | No | No | Partial | Partial | $$$ |
| **Cyber Forensic Toolkit (Pendrive)** | USB Toolkit | India | No | No | Yes | $$ |
| **0xRuchiKaraShunti** | GitHub Project | India | No | Yes (IPFS) | Partial | Free |
| **Malkhana Vault** | **Evidence Management** | **Yes** | **Yes (exact)** | **Yes (Triple-Hash)** | **Yes** | **Free** |

## 12.2 Our Competitive Position

No existing tool in the market provides:

1. **Exact BSA Section 63 Schedule certificate generation** — everyone else either doesn't support it or requires manual Word/PDF drafting
2. **Triple-Hash custody chain** specifically designed for Indian police procedures
3. **Offline-first + USB portable** deployment for crime scene use
4. **Panch witness integration** in the custody chain
5. **Open source + India-specific** — all enterprise solutions are foreign, expensive, and opaque

The India Digital Evidence Management market is projected to reach **USD 8.2 Billion by 2031** (CAGR 17.4%). Malkhana Vault targets the massively under-served segment: **state police forces and government FSLs** that cannot afford Cellebrite-tier solutions.

---

# 13. Appendix

## A. Chain of Custody — Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVIDENCE LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ SEIZURE  │───▶│ STORAGE  │───▶│ IMAGING  │───▶│ ANALYSIS │ │
│  │          │    │          │    │          │    │          │ │
│  │ • IO     │    │ • Malkhana│   │ • Write  │    │ • FSL    │ │
│  │ • Panch  │    │ • Seal   │    │   Blocker│    │ • Expert │ │
│  │ • H1 hash│    │ • H2 hash│    │ • dc3dd  │    │ • H3 hash│ │
│  │ • Seal   │    │ • Log    │    │ • Image  │    │ • Report │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│       │               │               │               │       │
│       ▼               ▼               ▼               ▼       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │CERT §63  │    │ CUSTODY  │    │   HASH   │    │  COURT   │ │
│  │ Part A   │    │   LOG    │    │  VERIFY  │    │SUBMISSION│ │
│  │          │    │(append)  │    │ H1=H2=H3 │    │ • Cert   │ │
│  └──────────┘    └──────────┘    └──────────┘    │ • Report │ │
│                                                   │ • QR     │ │
│                                                   └──────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MERKLE AUDIT TRAIL                     │  │
│  │  Every action above is a leaf node. Root is exportable.  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## B. Section 63 Certificate — Field Mapping

Source: `_reference/BSA Section 63 Certificate.pdf` (official BSA Schedule format)

### Part A (Person in Charge)

| Field | UI Component | Validation |
|---|---|---|
| Name of person | Text input | Required |
| Designation | Text input | Required |
| Device type | Checkbox group (Computer/Storage, DVR, Mobile, Flash Drive, CD/DVD, Server, Cloud, Other) | At least one required |
| Device control type | Radio group (Owned, Maintained, Managed, Operated) | Required |
| Regular use declaration | Pre-filled legal text | Auto |
| Proper operation declaration | Pre-filled legal text | Auto |
| Seal number | Text input | Required |
| Hash value | Auto-filled from H1 | Auto |
| Hash algorithm | Checkbox (MD5, SHA-1, SHA-256) | At least one |
| Signature | Typed / Scanned / DSC | Required |
| Date | IST auto-captured | Auto |

### Part B (Expert)

| Field | UI Component | Validation |
|---|---|---|
| Expert name | Text input | Required |
| Expert designation | Text input | Required |
| Lab / Organization ID | Text input | Required |
| Hash verification declaration | Pre-filled legal text + auto-verified | Auto |
| Hash algorithm used | Auto-filled from Part A | Auto |
| Hash value confirmed | Auto-filled + verified against stored hash | Auto |
| Signature | Typed / Scanned / DSC | Required |
| Date | IST auto-captured | Auto |

## C. RBAC Matrix

| Permission | Admin | Investigator | Custodian | Examiner | Reviewer | Police (Read) | Court (Read) |
|---|---|---|---|---|---|---|---|
| Manage system config | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create case | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ingest evidence | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Log custody transfer | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sign Part A | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Sign Part B | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Verify & approve cert | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View cases | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View custody chain | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View audit trail | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

## D. Locked Decisions

| # | Decision | Status | Rationale |
|---|---|---|---|
| D1 | Section 63 certificate uses exact BSA Schedule format | ✅ LOCKED | Legal admissibility depends on exact format |
| D2 | Hash included inside certificate (no separate hash certificate) | ✅ LOCKED | BSA Schedule has hash fields built-in |
| D3 | Offline-first — local DB is source of truth | ✅ LOCKED | Police stations have unreliable internet |
| D4 | Supabase is optional sync layer, not primary | ✅ LOCKED | Cloud dependency would break offline-first |
| D5 | No file paths or evidence files in cloud sync | ✅ LOCKED | Evidence data is sensitive and local-only |
| D6 | No delete operations anywhere in the system | ✅ LOCKED | Legal integrity requires immutable records |
| D7 | IST timezone, 24-hour format, non-overridable | ✅ LOCKED | Indian jurisdiction requirement |
| D8 | App.jsx blueprint UI design is the canonical reference | ✅ LOCKED | Additions accepted, modifications rejected |
| D9 | Linux-first, cross-platform later (Phase 4) | ✅ LOCKED | Focus resources on getting Phase 1 right |
| D10 | SQLCipher for database encryption at rest | ✅ LOCKED | Evidence data must be protected |
| D11 | Python 3.11+ / PySide6 / Qt6 — production stack | ✅ LOCKED | React UI is design reference only |
| D12 | Flexible Part B expert workflow | ✅ LOCKED | Legal interpretation is still evolving |
| D13 | USB portable deployment supported | ✅ LOCKED | Crime scene usability requirement |
| D14 | Dual signature mandatory (Part A + Part B) | ✅ LOCKED | BSA §63(4) requirement |
| D15 | Triple-Hash Protocol (H1→H2→H3) | ✅ LOCKED | Chain integrity verification standard |

---

**END OF DOCUMENT**

*This PRD is the single source of truth for Malkhana Vault. All development decisions reference this document. Changes require a documented decision in the Decision Log with explicit rationale.*
