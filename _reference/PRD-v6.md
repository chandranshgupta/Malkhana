# MALKHANA VAULT — PRD v6.0
## Forensic Evidence Management System
### Tauri v2 + React + Rust Architecture

> **Classification:** INTERNAL — DEVELOPMENT REFERENCE  
> **Version:** 6.0.0 | **Date:** 2026-05-16  
> **Author:** Chandransh Gupta  
> **Supersedes:** PRD v5.0 (Python/PySide6 Architecture)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Pivot](#2-architectural-pivot)
3. [Target Users & Personas](#3-target-users--personas)
4. [Legal Framework Alignment](#4-legal-framework-alignment)
5. [Product Tiers & Monetization](#5-product-tiers--monetization)
6. [Locked Design Decisions](#6-locked-design-decisions)
7. [Technical Stack](#7-technical-stack)
8. [Rust Backend Architecture](#8-rust-backend-architecture)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Development Standards & Coding Conventions](#10-development-standards--coding-conventions)
11. [Database Schema](#11-database-schema)
12. [Security Architecture](#12-security-architecture)
13. [Feature Specification — UI Gap Analysis](#13-feature-specification)
14. [Indian Investigation Workflow Alignment](#14-indian-investigation-workflow)
15. [Risk Analysis & Mitigation](#15-risk-analysis--mitigation)
16. [Key Performance Indicators (KPIs)](#16-key-performance-indicators)
17. [Competitive Landscape](#17-competitive-landscape)
18. [Packaging & Deployment](#18-packaging--deployment)
19. [Phased Execution](#19-phased-execution)
20. [Agent Skills Reference](#20-agent-skills-reference)
21. [Glossary](#21-glossary)

---

## 1. Executive Summary

Malkhana Vault is a **forensic-grade digital evidence management system** built for Indian law enforcement. It digitizes the physical Malkhana (police property room) into an offline-first desktop application with cryptographic integrity verification, BSA Section 63 certificate generation, and immutable chain-of-custody tracking.

**What changed in v6.0:** The entire backend pivots from Python/PySide6 to **Rust via Tauri v2**. The React UI (App.jsx, 1380 lines) that was previously a "design reference" is now the **production frontend** running inside Tauri's WebView. This eliminates the Qt translation effort entirely.

---

## 2. Architectural Pivot

### What Changed

| Aspect | PRD v5.0 | PRD v6.0 | Rationale |
|--------|----------|----------|-----------|
| Backend | Python 3.11 / PySide6 | **Rust / Tauri v2** | 10x faster hashing, memory-safe, native Linux packaging |
| Frontend | PySide6 QSS (translated from React) | **React 19 + Tailwind** (direct) | Already built — zero translation needed |
| Desktop Shell | Qt6 Window | **Tauri WebView** | Lightweight (~5MB vs ~150MB Qt), native OS integration |
| Database | SQLCipher via Python | **rusqlite + bundled-sqlcipher** | Battle-tested encryption, Rust-native |
| Packaging | Flatpak / custom AppImage | **Tauri bundler** (deb, AppImage, RPM) | Built-in, one command |
| PDF Generation | ReportLab / WeasyPrint | **WebView print-to-PDF** | Zero extra deps, uses existing React certificate UI |
| IPC | N/A | **tauri::invoke()** | Type-safe React↔Rust bridge |

### What Did NOT Change

All 17 original design decisions (D1–D17) remain locked except D8 and D11:
- D1: BSA Section 63 exact certificate format ✅
- D2: Offline-first architecture ✅  
- D3: Triple-Hash Protocol (H1→H2→H3) ✅
- D4: IST timezone locked (UTC+05:30) ✅
- D5: Blueprint/brutalist UI aesthetic ✅
- D6: USB portable deployment ✅
- D7: Append-only, no deletes ✅
- D9: Mono font, uppercase labels ✅
- D10: 6 core views ✅

---

## 3. Target Users & Personas

### 3.1 Primary Users

| Persona | Role | Key Pain Point | How Vault Solves It |
|---------|------|----------------|---------------------|
| **SI Rajesh Sharma** | Investigating Officer (IO) | Manually writes panchnama, forgets hash at scene, evidence challenged in court | One-click H1 hash generation at seizure, auto-populates Form CC-1 |
| **HC Priya Verma** | Malkhana In-Charge | Paper register, items get lost, no tracking of who accessed what | Digital matrix grid, H2 verification on receipt, audit trail |
| **Dr. Amit Patel** | FSL Forensic Examiner | Receives devices without hash, spends hours on paperwork instead of analysis | H2/H3 verification, auto-generated Section 63 certificate |
| **Clerk Sunita Devi** | Court Records Clerk | Receives evidence in inconsistent formats, can't verify chain | Standardized PDF exports, hash verification log included |

### 3.2 Secondary Users

| Persona | Role | Use Case |
|---------|------|----------|
| **SP / DIG** | Supervisory Officer | Dashboard metrics — how many cases active, evidence backlog, SLA breaches |
| **Cyber Cell Head** | State Cyber Police | Bulk digital evidence management (500+ USB drives per quarter) |
| **NIA / CBI Agent** | Central Agency | Cross-jurisdiction evidence transfer with federal chain compliance |
| **Defense Advocate** | Legal Aid Counsel | Audit the chain of custody to challenge prosecution evidence |

### Deployment Context

- **Typical Malkhana:** 1 desktop PC, no internet, shared by 3–5 officers
- **FSL Lab:** Networked workstation, specialized forensic tools (Cellebrite, FTK)
- **Court:** Receives PDF reports only — no app installation needed
- **USB Mode:** IO carries AppImage on a USB stick to crime scenes with a laptop

---

## 4. Legal Framework Alignment

### BSA 2023 — Section 63 (replaces IEA Section 65B)

The Section 63 certificate must attest to:
1. **Device Health** — the computer was operating properly during the period of record creation
2. **Automated Storage** — data was fed into the device in the ordinary course of activities
3. **Integrity** — no unauthorized alteration affects the accuracy
4. **Chain of Custody** — unbroken log from seizure to court

### Triple-Hash Verification Protocol (Validated by 2026 Forensic Standards)

| Hash | When | Who | Purpose |
|------|------|-----|---------|
| **H1 (Birth Hash)** | At crime scene seizure | Investigating Officer (IO) | Baseline proof of original state |
| **H2 (Receipt Hash)** | Before opening seal at FSL/Malkhana | Malkhana In-Charge / FSL Expert | Proves no tampering during transport |
| **H3 (Analysis Hash)** | After forensic imaging | Forensic Examiner | Confirms data integrity post-extraction |

**Rule:** If H1 ≠ H2 → "Malkhana Gap" (device accessed during transport). If H2 ≠ H3 → FSL expert altered data. Both are grounds for evidence exclusion.

### BNSS 2023 — Section 153 (Seizure Power)

- Mandatory Form CC-1 (Chain of Custody form) signed by Seizing Officer, Imaging Specialist, and Malkhana Safe-Keeper
- Panch witnesses must verify hash generation at scene
- Movement Register must log every second of device location

### Common Court Rejection Reasons (our app must prevent these)

1. No hash value generated at seizure scene
2. Gap in chain of custody timeline (even 5 minutes)
3. Device connected without write-blocker
4. Forensic image in wrong format (must be .E01 or .raw/dd)
5. Section 63 certificate signed by unqualified person
6. No Faraday isolation documented for mobile devices
7. Logical copy instead of bit-stream physical image
8. FSL computer clock miscalibrated
9. MD5-only hashing (must use dual: MD5 + SHA-256)
10. Missing Panch witness signatures on Panchnama

---

## 5. Product Tiers & Monetization

### Tier Structure

| Tier | Name | Target | Price | Key Features |
|------|------|--------|-------|-------------|
| **T0** | Open Core | Individual IOs, small stations | **Free / Open Source** | Single-user, local DB, 3 concurrent cases, AppImage only |
| **T1** | Station License | Police Station (1 Malkhana) | ₹15,000/year | Multi-user (5 seats), unlimited cases, .deb/.rpm, email support |
| **T2** | District License | SP Office / District HQ | ₹75,000/year | 25 seats, Supabase sync, priority support, training webinar |
| **T3** | State/Central | State Cyber Cell / NIA / CBI | Custom (₹3–8L/year) | Unlimited seats, on-prem server, dedicated support engineer, SLA |

### Revenue Model

- **Primary:** Annual license fees (T1–T3)
- **Secondary:** Training & certification workshops for IOs (₹5,000/officer)
- **Tertiary:** Custom integration consulting (FSL API bridges, state-specific forms)
- **Strategic:** Government tender positioning — target BPR&D (Bureau of Police Research) and NCRB procurement cycles

### Open Source Strategy

T0 is free and fully functional for single users. This creates adoption at the grassroots (individual IOs and small rural stations) which drives bottom-up demand for T1–T3 licenses at the district/state procurement level.

---

## 6. Locked Design Decisions

### Visual Design Language (IMMUTABLE)

- **Blueprint Grid:** 20px minor grid + 100px major grid, slate-500 color
- **Color Palette:** `#f4f7f9` background, `#1e293b` primary, `#0ea5e9` accent, `#dc2626` alert
- **Typography:** `font-mono` system-wide, uppercase labels, tracking-widest
- **Corner Marks:** 2px border corners on all cards/panels
- **Shadow System:** `4px 4px 0px` brutalist offset shadows
- **Red Thread:** SVG bezier path connecting custody chain nodes
- **Stamps:** Circular SVG stamps with "FORENSIC CONTROL" text path
- **Animation:** `stamp-drop` keyframe for document sealing, pulse for alerts

### 6 Core Views (IMMUTABLE)

| View | Component | Status |
|------|-----------|--------|
| EVIDENCE_LOG | Blueprint cards with wireframe SVGs | UI ✅ / Backend ❌ |
| ACTIVE_CUSTODY | Node-based investigation board with red thread | UI ✅ / Backend ❌ |
| SEALED_ARCHIVE | 15×10 coordinate matrix grid | UI ✅ / Backend ❌ |
| REPORTS | Section 63 drafting table with live preview | UI ✅ / Backend ❌ |
| SYSTEM_SETTINGS | Industrial toggles + legal compliance lock | UI ✅ / Backend ❌ |
| NEW_INGESTION | 4-stage wizard with zero-trust terminal | UI ✅ / Backend ❌ |

---

## 7. Technical Stack

### Production Stack

```
┌─────────────────────────────────────────┐
│           MALKHANA VAULT v6.0           │
├─────────────────────────────────────────┤
│  Frontend    │ React 19.2 + Tailwind 3  │
│  Icons       │ Lucide React             │
│  Bundler     │ Vite 8.0                 │
│  Desktop     │ Tauri v2.11              │
│  Backend     │ Rust 1.95 (2021 edition) │
│  Database    │ SQLite + SQLCipher       │
│  Hashing     │ sha2, md-5 crates        │
│  Packaging   │ AppImage / .deb / .rpm   │
│  VCS         │ Git + GitHub             │
└─────────────────────────────────────────┘
```

### Tauri Plugins

| Plugin | Crate | Purpose |
|--------|-------|---------|
| `tauri-plugin-fs` | File system access | Read/write evidence vault |
| `tauri-plugin-shell` | Subprocess execution | dc3dd imaging commands |
| `tauri-plugin-dialog` | Native dialogs | File picker, confirmation |
| `tauri-plugin-notification` | OS notifications | Hash complete, alerts |
| `tauri-plugin-process` | Process management | Graceful shutdown |
| `tauri-plugin-store` | Persistent KV store | User preferences |
| `tauri-plugin-log` | Structured logging | Audit trail |

---

## 8. Rust Backend Architecture

```
src-tauri/src/
├── main.rs                         # Entry point
├── lib.rs                          # Tauri builder + plugin registration
├── commands/                       # Tauri invoke handlers
│   ├── mod.rs
│   ├── case_commands.rs            # Case CRUD, CNR lookup
│   ├── evidence_commands.rs        # Evidence ingestion + hashing
│   ├── custody_commands.rs         # Chain of custody transfers
│   ├── certificate_commands.rs     # Section 63 PDF generation
│   ├── archive_commands.rs         # Sealed archive grid operations
│   ├── search_commands.rs          # Global + matrix search
│   └── settings_commands.rs        # Engine config persistence
├── core/                           # Business logic (UI-agnostic)
│   ├── mod.rs
│   ├── hash_engine.rs              # SHA-256, MD5, SHA-512 chunked
│   ├── certificate_engine.rs       # BSA Section 63 template
│   ├── imaging_engine.rs           # dc3dd subprocess via shell
│   ├── merkle_tree.rs              # Merkle audit trail
│   ├── audit_logger.rs             # Append-only event log
│   ├── vault_manager.rs            # File vault CRUD
│   ├── time_authority.rs           # IST-locked timestamps
│   └── device_detector.rs          # USB/disk detection
├── data/                           # Data layer
│   ├── mod.rs
│   ├── database.rs                 # SQLCipher init + migrations
│   ├── models.rs                   # Serde structs
│   ├── schema.rs                   # SQL DDL
│   └── repository.rs              # Query functions
├── security/                       # Encryption module
│   ├── mod.rs
│   ├── encryption.rs               # DB key management
│   ├── key_derivation.rs           # PBKDF2
│   └── integrity_checker.rs        # H1/H2/H3 verification
└── utils/
    ├── mod.rs
    ├── constants.rs                # App-wide constants
    ├── validators.rs               # Input sanitization
    └── formatters.rs               # IST date formatting
```

### Key Invoke Commands

```rust
// React calls these via: invoke('command_name', { args })
#[tauri::command] fn create_case(cnr: String, fir: String, io: String) -> Result<Case>;
#[tauri::command] fn ingest_evidence(case_id: String, asset_type: String) -> Result<Evidence>;
#[tauri::command] fn hash_file(path: String) -> Result<HashResult>;
#[tauri::command] fn transfer_custody(evidence_id: String, to: String) -> Result<CustodyEvent>;
#[tauri::command] fn generate_certificate(evidence_id: String) -> Result<CertificateData>;
#[tauri::command] fn search_archive(query: String) -> Result<Vec<ArchiveEntry>>;
#[tauri::command] fn get_settings() -> Result<AppSettings>;
#[tauri::command] fn update_setting(key: String, value: String) -> Result<()>;
#[tauri::command] fn get_evidence_log() -> Result<Vec<Evidence>>;
#[tauri::command] fn get_custody_chain(evidence_id: String) -> Result<Vec<CustodyNode>>;
#[tauri::command] fn detect_devices() -> Result<Vec<BlockDevice>>;
```

---

## 9. Frontend Architecture

The React frontend (App.jsx) requires these modifications to connect to Rust:

### Import Pattern
```javascript
import { invoke } from '@tauri-apps/api/core';

// Example: fetch evidence log from Rust DB
const evidence = await invoke('get_evidence_log');

// Example: hash a file
const result = await invoke('hash_file', { path: '/dev/sdb' });
```

### State Management Strategy
- **Local React state** for UI-only concerns (hover, modal open/close)
- **invoke() calls** for all data operations (no localStorage for evidence data)
- **tauri-plugin-store** for user preferences (theme, imager choice, thread count)

## 10. Development Standards & Coding Conventions

### Rust Backend Standards

- **Error Handling:** All functions return `Result<T, AppError>` using `thiserror` — no `.unwrap()` in production code
- **Naming:** `snake_case` for functions/variables, `PascalCase` for structs/enums, `SCREAMING_SNAKE` for constants
- **Module Organization:** One file per command group, one file per core engine
- **Logging:** Use `log` crate macros (`info!`, `warn!`, `error!`) — never `println!` in production
- **Timestamps:** All timestamps via `time_authority.rs` — IST (UTC+05:30) locked, ISO 8601 format
- **Serialization:** All cross-boundary structs derive `serde::Serialize` + `serde::Deserialize`
- **Testing:** Unit tests in same file (`#[cfg(test)]`), integration tests in `tests/` directory
- **No unsafe:** Zero `unsafe` blocks unless cryptographically justified and documented

### React Frontend Standards

- **Component Pattern:** Functional components with hooks only — no class components
- **State Rule:** UI-only state in React, data state via `invoke()` — never `localStorage` for evidence
- **Naming:** `PascalCase` for components, `camelCase` for functions/variables, `UPPER_SNAKE` for constants
- **Styling:** Tailwind utility classes + CSS custom properties for design tokens — no inline style objects
- **Comments:** JSDoc for all exported functions, `// FORENSIC:` prefix for legal compliance code
- **No external requests:** Zero fetch/axios calls — all data flows through Tauri invoke bridge

### Git Conventions

- **Branch:** `feat/`, `fix/`, `refactor/`, `docs/` prefixes
- **Commits:** Conventional Commits format: `feat(hash-engine): implement SHA-256 chunked hashing`
- **PR:** Must pass Snyk security scan before merge
- **No secrets:** `.env` files in `.gitignore`, DB passwords never committed

### File Naming

| Layer | Convention | Example |
|-------|-----------|--------|
| Rust commands | `{domain}_commands.rs` | `evidence_commands.rs` |
| Rust core | `{engine}_engine.rs` | `hash_engine.rs` |
| Rust data | `{concern}.rs` | `models.rs`, `repository.rs` |
| React components | `{Name}.jsx` | `EvidenceLog.jsx` |
| Tests | `{module}_test.rs` | `hash_engine_test.rs` |

---

## 11. Database Schema

```sql
-- Core Tables (SQLCipher encrypted)

CREATE TABLE cases (
    id TEXT PRIMARY KEY,              -- UUID v4
    cnr TEXT UNIQUE,                  -- Computerized Node Record
    fir_number TEXT NOT NULL,
    investigating_officer TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',     -- ACTIVE | SEALED | DISPOSED
    created_at TEXT NOT NULL,         -- ISO 8601, IST
    updated_at TEXT NOT NULL
);

CREATE TABLE evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES cases(id),
    asset_type TEXT NOT NULL,         -- DISK | MOBILE | CCTV | USB | CLOUD | FILES
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT,                        -- JSON array
    hash_sha256 TEXT,
    hash_md5 TEXT,
    hash_sha512 TEXT,
    seal_number TEXT,
    physical_condition TEXT,
    device_metadata TEXT,             -- JSON (IMEI, serial, etc.)
    storage_location TEXT,            -- Matrix coordinate (R5-C8)
    status TEXT DEFAULT 'ACTIVE',     -- ACTIVE | SEALED | ARCHIVED
    seized_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE custody_chain (
    id TEXT PRIMARY KEY,
    evidence_id TEXT NOT NULL REFERENCES evidence(id),
    from_person TEXT,
    to_person TEXT NOT NULL,
    role TEXT NOT NULL,               -- SEIZING_OFFICER | INTAKE_CLERK | EXAMINER | ANALYST
    organization TEXT,
    clearance_level TEXT,
    action TEXT NOT NULL,             -- SEIZED | TRANSFERRED | EXAMINED | SEALED | RETURNED
    hash_at_transfer TEXT,            -- Hash verification at this point
    hash_verified INTEGER DEFAULT 0,  -- Boolean: H(n) == H(n-1)
    notes TEXT,
    timestamp TEXT NOT NULL
);

CREATE TABLE certificates (
    id TEXT PRIMARY KEY,
    evidence_id TEXT NOT NULL REFERENCES evidence(id),
    custodian_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    seal_number TEXT NOT NULL,
    device_type TEXT NOT NULL,
    control_type TEXT DEFAULT 'MAINTAINED',
    examiner_name TEXT NOT NULL,
    lab_id TEXT NOT NULL,
    hash_algorithm TEXT DEFAULT 'SHA-256',
    document_hash TEXT,               -- Hash of the certificate itself
    is_locked INTEGER DEFAULT 0,
    signed_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT,                     -- JSON
    timestamp TEXT NOT NULL
    -- NO DELETE allowed — append-only enforced at app level
);

CREATE TABLE archive_matrix (
    location TEXT PRIMARY KEY,        -- R5-C8 format
    evidence_id TEXT REFERENCES evidence(id),
    vault_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'EMPTY',      -- EMPTY | OCCUPIED | SEALED
    assigned_at TEXT
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    category TEXT NOT NULL,           -- FORENSIC_ENGINE | SYNC | WORKFLOW | LEGAL
    is_locked INTEGER DEFAULT 0,      -- Legal compliance settings are locked
    updated_at TEXT NOT NULL
);
```

---

## 12. Security Architecture

### Encryption
- **Database:** SQLCipher (AES-256-CBC) via `rusqlite` with `bundled-sqlcipher` feature
- **Key Derivation:** PBKDF2 with 256,000 iterations
- **Key Storage:** Master password → derived key (never stored on disk)

### Integrity
- **Dual Hashing:** Every evidence item gets both SHA-256 AND MD5 (BSA 2026 mandate)
- **Merkle Tree:** All audit log entries form a hash chain — tampering any entry invalidates all subsequent entries
- **Append-Only:** No DELETE operations exist in the codebase. Period.

### Isolation
- **Offline-First:** No network calls in core operation
- **CSP Enforced:** Tauri CSP blocks external script/style injection
- **Write-Blocker Verification:** Terminal stage requires explicit write-blocker checkbox before imaging

---

## 13. Feature Specification — UI Gap Analysis

### Critical gaps identified in current App.jsx:

| Gap | View | What's Missing | Priority |
|-----|------|----------------|----------|
| G1 | EVIDENCE_LOG | Cards are hardcoded — need DB-backed dynamic list | P0 |
| G2 | EVIDENCE_LOG | Filter buttons (RECENT, HIGH_PRIORITY) non-functional | P1 |
| G3 | EVIDENCE_LOG | VIEW_LOG button does nothing | P1 |
| G4 | ACTIVE_CUSTODY | Personnel chain is hardcoded — need per-evidence dynamic chain | P0 |
| G5 | ACTIVE_CUSTODY | No ability to add new custody transfer | P0 |
| G6 | SEALED_ARCHIVE | Search only matches hardcoded CASE-IDs | P0 |
| G7 | SEALED_ARCHIVE | Grid drawers randomly generated — need DB-backed matrix | P0 |
| G8 | SEALED_ARCHIVE | EXPORT_CHAIN_OF_CUSTODY button non-functional | P1 |
| G9 | REPORTS | Hold-to-seal generates fake hash — need real hash from Rust | P0 |
| G10 | REPORTS | Certificate not exportable as PDF | P0 |
| G11 | REPORTS | No link to specific evidence — certificate is generic | P1 |
| G12 | SYSTEM_SETTINGS | Toggles are cosmetic — settings not persisted | P0 |
| G13 | SYSTEM_SETTINGS | AUTO_OPTIMIZE doesn't detect actual hardware | P1 |
| G14 | SYSTEM_SETTINGS | Legal compliance lock is visual only — not enforced | P0 |
| G15 | NEW_INGESTION | LINK_EXISTING_CASE → CNR input not validated against DB | P0 |
| G16 | NEW_INGESTION | File drag-and-drop zone non-functional | P0 |
| G17 | NEW_INGESTION | Terminal output is simulated — need real dc3dd/hash output | P0 |
| G18 | NEW_INGESTION | No actual file hashing occurs | P0 |
| G19 | NEW_INGESTION | MOBILE/CCTV/DISK forms don't save to DB | P0 |
| G20 | NEW_INGESTION | After ingestion, no redirect to evidence log | P1 |
| G21 | GLOBAL | Global search bar non-functional | P1 |
| G22 | GLOBAL | Bottom metrics (74.2 TB, 1204 items) are hardcoded | P0 |
| G23 | GLOBAL | No USB device auto-detection | P1 |
| G24 | GLOBAL | No Panch witness signature capture | P2 |
| G25 | GLOBAL | No Faraday isolation status field for mobile seizure | P2 |

---

## 14. Indian Investigation Workflow Alignment

### Verified against 2026 National Cyber Forensic Protocol

```
CRIME SCENE                    POLICE STATION                FSL / CYBER LAB
───────────                    ──────────────                ─────────────
1. IO arrives                  4. Malkhana entry             7. FSL receives sealed device
2. Panch witnesses present     5. Movement Register log      8. Seal integrity check (H2)
3. Seizure + Faraday bag       6. Storage in evidence room   9. Bit-stream imaging
   + H1 hash on-site                                        10. Analysis on forensic copy
   + Panchnama signed                                       11. H3 hash generated
   + Form CC-1 initiated                                    12. Section 63 certificate
                                                            13. Report to court
```

### How Malkhana Vault Maps to This Workflow

| Real-World Step | App Feature | Status |
|----------------|-------------|--------|
| IO arrives at scene | NEW_INGESTION → STAGE_1 (Case Anchor) | UI ✅ |
| Panch witnesses sign | ❌ Missing — need witness name/signature fields | **GAP** |
| Device seized + Faraday | NEW_INGESTION → STAGE_3 (Physical Custody) | UI ✅ |
| H1 hash at scene | NEW_INGESTION → STAGE_4 (Zero-Trust Terminal) | UI ✅ / Backend ❌ |
| Malkhana entry | SEALED_ARCHIVE → Matrix assignment | UI ✅ / Backend ❌ |
| Movement Register | ACTIVE_CUSTODY → Custody trace board | UI ✅ / Backend ❌ |
| Custody transfer log | ACTIVE_CUSTODY → Add transfer node | **GAP** |
| FSL seal check (H2) | ❌ Missing — need H2 verification step | **GAP** |
| Bit-stream imaging | NEW_INGESTION → dc3dd command | UI ✅ / Backend ❌ |
| H3 hash post-imaging | ❌ Missing — need post-analysis hash | **GAP** |
| Section 63 certificate | REPORTS → Drafting Table | UI ✅ / Backend ❌ |
| Export to court | REPORTS → PDF export | **GAP** |
| Device return/disposal | ❌ Missing — need disposition workflow | **GAP** |

### Gaps to Fix (aligned with Indian workflow)

1. **Add Panch Witness Module** — 2 witness name fields + signature pad in STAGE_3
2. **Add H2 Verification Step** — When evidence enters Malkhana, verify H1 matches
3. **Add H3 Post-Analysis Hash** — After imaging, auto-generate H3 and compare
4. **Add Disposition Workflow** — Track device return to owner or destruction
5. **Add Faraday Isolation Status** — Checkbox + duration for mobile seizures
6. **Add Form CC-1 Auto-Generation** — Pre-fill from DB, export as PDF
7. **Add Movement Register View** — Timeline of physical location changes

## 15. Risk Analysis & Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **R1:** SQLCipher compile fails on target Linux distro | Medium | Critical | Use `bundled-sqlcipher` feature (statically links OpenSSL) |
| **R2:** dc3dd not available on target machine | High | High | Bundle as AppImage resource OR fallback to `dd` + manual hash |
| **R3:** WebView rendering inconsistent across distros | Medium | Medium | Test on Ubuntu 22.04, Fedora 39, Debian 12 — pin WebKitGTK version |
| **R4:** Large file hashing (>1TB) causes UI freeze | High | High | Implement async chunked hashing with progress callback via Tauri events |
| **R5:** Rust compile times slow dev iteration | Medium | Low | Use `cargo-watch`, incremental compilation, split into workspace crates |

### Legal/Compliance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **R6:** Section 63 certificate format rejected by court | Low | Critical | Template validated against 3 published High Court formats |
| **R7:** IST timestamp drift on machines with wrong clock | Medium | High | Cross-check with system RTC, warn user if drift > 30 seconds |
| **R8:** Evidence DB corruption on power loss | Medium | Critical | SQLite WAL mode + periodic checkpoint, journaling filesystem required |
| **R9:** Unauthorized access to Malkhana PC | High | Critical | SQLCipher encryption + optional PIN/password on app launch |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **R10:** Officers resist adopting new software | High | High | Hindi UI labels, 1-day training module, gradual rollout with champion officers |
| **R11:** No IT support at rural police stations | High | Medium | AppImage = zero install, USB portable, self-contained |
| **R12:** Budget constraints for procurement | High | Medium | T0 free tier removes procurement barrier entirely |

---

## 16. Key Performance Indicators (KPIs)

### Application Performance

| KPI | Target | Measurement |
|-----|--------|------------|
| **App startup time** | < 3 seconds cold, < 1s warm | Tauri window `ready` event timestamp |
| **File hash speed (SHA-256)** | > 500 MB/s on modern hardware | Benchmark with 10GB test file |
| **Database query latency** | < 50ms for any single query | SQLite EXPLAIN ANALYZE |
| **AppImage size** | < 20 MB | Build artifact size check |
| **Memory usage (idle)** | < 100 MB RSS | System monitor during idle |
| **Certificate PDF generation** | < 2 seconds | Timestamp from invoke to file written |

### Forensic Integrity

| KPI | Target | Measurement |
|-----|--------|------------|
| **Hash consistency** | 100% H1=H2=H3 match rate (no false negatives) | Automated regression test suite |
| **Audit log integrity** | Zero gaps in Merkle chain | Nightly integrity check command |
| **Chain of custody completeness** | 100% of evidence has ≥ 1 custody entry | DB constraint + UI enforcement |
| **Section 63 certificate accuracy** | Zero field mismatches vs DB | Automated template validation |

### Adoption Metrics (Post-Launch)

| KPI | Target (Year 1) | Measurement |
|-----|-----------------|------------|
| **Active installations** | 50 stations (T0 + T1) | Opt-in telemetry ping (metadata only) |
| **Cases processed** | 500+ | Aggregate from willing participants |
| **Court acceptance rate** | > 95% of submitted certificates accepted | Feedback survey from IOs |
| **Training completion** | 200 officers trained | Workshop attendance records |

---

## 17. Competitive Landscape

| Product | Type | Strengths | Weaknesses vs Malkhana Vault |
|---------|------|-----------|-----------------------------|
| **Cellebrite Guardian** | Commercial SaaS | Industry standard, mobile forensics | ₹15L+/year, cloud-dependent, US-hosted, not BSA-specific |
| **Magnet AXIOM** | Commercial | Full-spectrum forensic suite | ₹8L+/year, Windows-only, overkill for Malkhana workflow |
| **Autopsy (Sleuth Kit)** | Open Source | Free, extensible, Linux-native | No Indian legal compliance, no chain of custody, forensic analysis only |
| **NCRB CCTNS** | Government | Nationwide crime tracking | No evidence management, no hash verification, web-based |
| **Manual Register** | Paper-based | Zero cost, familiar | No integrity verification, easily tampered, no search, no audit trail |
| **Custom Excel/Access** | Ad-hoc | Cheap, customizable | No encryption, no hashing, no legal compliance, fragile |

### Malkhana Vault Differentiators

1. **Only tool built specifically for Indian Malkhana workflow** — not adapted from Western forensic tools
2. **BSA Section 63 certificate generation** — no competitor offers this natively
3. **Triple-Hash Protocol (H1→H2→H3)** — validated against 2026 National Cyber Forensic Protocol
4. **Offline-first + USB portable** — works in stations without internet
5. **Free T0 tier** — removes procurement barrier that blocks all competitors
6. **Hindi-ready UI** — no competitor offers vernacular interface for Indian police
7. **Append-only architecture** — court-defensible by design (evidence of non-tampering)

---

## 18. Packaging & Deployment

### Linux Targets (Primary)

| Format | Use Case | Size Target |
|--------|----------|-------------|
| **AppImage** | USB portable, any distro | ~15MB |
| **.deb** | Ubuntu/Debian install | ~12MB |
| **.rpm** | Fedora/RHEL install | ~12MB |

### Build Commands
```bash
# Development
npm run tauri:dev

# Production build (all targets)
npm run tauri:build

# Specific target
npx tauri build --target appimage
```

### USB Portable Mode
AppImage is self-contained — copy to USB, chmod +x, run. Database file stored alongside the AppImage in a `data/` directory.

---

## 19. Phased Execution

### Phase 1: Foundation (Weeks 1–4)
> Goal: "Hash a real file, save to DB, generate a real certificate PDF"

- [ ] Implement Rust hash_engine (SHA-256 + MD5 chunked hashing)
- [ ] Set up SQLCipher database with schema
- [ ] Wire invoke() bridge: React ↔ Rust for case CRUD
- [ ] Wire invoke() bridge: Evidence ingestion → real file hashing
- [ ] Wire invoke() bridge: Settings persistence via tauri-plugin-store
- [ ] Fix all P0 gaps (G1, G4, G6, G7, G9, G10, G12, G14–G19, G22)
- [ ] Certificate PDF via webview print
- [ ] AppImage packaging test

### Phase 2: Evidence Lifecycle (Weeks 5–8)
> Goal: "Full custody chain with Triple-Hash verification"

- [ ] Triple-Hash Protocol (H1→H2→H3) with verification at each transfer
- [ ] Dynamic custody chain board (per-evidence, DB-backed)
- [ ] dc3dd imaging integration via tauri-plugin-shell
- [ ] Sealed Archive matrix ↔ database
- [ ] Merkle audit trail
- [ ] Panch witness module
- [ ] Form CC-1 auto-generation
- [ ] Fix P1 gaps (G2, G3, G8, G11, G13, G20, G21, G23)

### Phase 3: Compliance & Multi-User (Weeks 9–12)
> Goal: "Court-ready evidence packages"

- [ ] RBAC (IO, Malkhana In-Charge, FSL Examiner roles)
- [ ] DSC (Digital Signature Certificate) integration
- [ ] Hindi certificate template
- [ ] Disposition workflow
- [ ] Movement Register timeline view
- [ ] Fix P2 gaps (G24, G25)

### Phase 4: Scale (Month 4+)
- [ ] Windows build (Tauri native)
- [ ] macOS build (Tauri native)
- [ ] Supabase sync (metadata-only, evidence stays local)
- [ ] Training/demo mode with sample data

---

## 20. Agent Skills Reference

### Antigravity Skills (installed at `~/.gemini/antigravity/skills/awesome-skills`)

| Category | Skills to Use | When |
|----------|--------------|------|
| **Rust** | `rust-pro`, `rust-async-patterns` | Implementing core backend modules |
| **Security** | `security-auditor`, `differential-review` | Pre-commit security review |
| **React** | `react-patterns`, `react-component-performance` | Refactoring App.jsx into modules |
| **Architecture** | `senior-architect`, `architect-review` | Module design decisions |
| **Frontend** | `frontend-design`, `design-spells` | UI polish and micro-interactions |
| **DevOps** | `github`, `git-pr-review` | CI/CD and PR workflows |
| **Testing** | `tdd-workflow`, `systematic-debugging` | Test-driven backend development |
| **Database** | `database-design`, `database-architect` | Schema optimization |
| **Performance** | `performance-profiling`, `performance-engineer` | Hash engine optimization |

### MCP Servers Available

| Server | Purpose |
|--------|---------|
| **Snyk** | Security scan Rust + npm code before each commit |
| **Firecrawl** | Research Tauri docs, Rust crates, legal standards |
| **SQLite** | Direct DB inspection during development |
| **Tauri MCP** | Live app debugging and DOM inspection |

---

## 21. Glossary

| Term | Definition |
|------|-----------|
| **BSA** | Bharatiya Sakshya Adhiniyam, 2023 — India's new evidence law replacing the Indian Evidence Act |
| **BNSS** | Bharatiya Nagarik Suraksha Sanhita, 2023 — replaces CrPC |
| **Section 63** | BSA provision governing admissibility of electronic records (replaces IEA Section 65B) |
| **CNR** | Case Number Record — unique identifier assigned to each court case in India |
| **FIR** | First Information Report — initial police complaint document |
| **IO** | Investigating Officer — police officer in charge of the investigation |
| **FSL** | Forensic Science Laboratory — state/central forensic analysis facility |
| **Malkhana** | Police property room where seized items are stored under lock and key |
| **Panchnama** | Formal record of search/seizure signed by independent witnesses (Panch) |
| **Panch** | Independent witness required to be present during search and seizure |
| **Form CC-1** | Chain of Custody form mandated by National Cyber Forensic Protocol |
| **H1/H2/H3** | Triple-Hash Protocol — hash at seizure, receipt, and analysis |
| **dc3dd** | Forensic disk imaging tool (Department of Defense Cyber Crime Center version of `dd`) |
| **Write-Blocker** | Hardware/software device preventing any write operations to seized media |
| **Faraday Bag** | RF-shielding bag preventing remote access/wiping of mobile devices |
| **IST** | Indian Standard Time (UTC+05:30) — all timestamps must use this |
| **SQLCipher** | Open-source SQLite extension providing AES-256 encryption |
| **AppImage** | Portable Linux application format — single executable, no install needed |
| **Merkle Tree** | Hash-based data structure ensuring integrity of sequential records |
| **DSC** | Digital Signature Certificate — legally valid electronic signature in India |
| **BPR&D** | Bureau of Police Research & Development — central police modernization body |
| **NCRB** | National Crime Records Bureau — maintains crime statistics and CCTNS |
| **CCTNS** | Crime and Criminal Tracking Network & Systems — nationwide police database |

---

## Appendix A: File Changes Summary (Pre-Changes Applied)

| File | Change |
|------|--------|
| `vite.config.js` | Added Tauri compatibility (port 5173, clearScreen, envPrefix) |
| `src-tauri/tauri.conf.json` | Fixed frontendDist, devUrl, identifier, window size, CSP, Linux bundling |
| `src-tauri/Cargo.toml` | Renamed package, added all plugins + crypto + DB crates |
| `src-tauri/capabilities/default.json` | Added permissions for all plugins |
| `src-tauri/src/lib.rs` | Initialized all plugins, added greet command |
| `src-tauri/src/main.rs` | Updated crate reference |
| `package.json` | Added @tauri-apps/api, tauri scripts |

---

*END OF PRD v6.0*

