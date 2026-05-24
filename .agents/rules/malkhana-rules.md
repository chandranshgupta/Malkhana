---
# Activation Mode: Always On (Options: Always On | Model Decision | Glob | Manual)
activation: Always On
---

# Malkhana Project Rules

## Tech Stack & Architecture
- **Frontend Core:** React, Vite, and Vanilla CSS (CSS variables, dynamic glassmorphism aesthetics, responsive layouts).
- **Backend Core:** Rust, Tauri v1/v2, and SQLite (via `rusqlite` crate).
- **Data & Migration Paths:** All database interactions are in `src-tauri/src/data/`. Schema definitions in `src-tauri/src/data/schema.rs`.

## Security & Integrity Standards (BSA Compliance)
- **Bharatiya Sakshya Adhiniyam (BSA):** All digital evidence logs must maintain strict custody logging, SHA-256 integrity hashing, and system downtime tracking.
- **Zero-Trust Secrets:** Never hardcode passwords, encryption keys, or credentials. Always retrieve them via runtime parameters or user authorization prompts.
- **Destructive Operation Guardrails:** Never run raw `DELETE`, `DROP`, or `TRUNCATE` operations on the evidence databases unless explicitly authorized by the user or as part of a confirmed unit testing suite.

## Development & Refactoring Guidelines
- **Rust Backend:** Use structured errors via the `thiserror` crate (`AppError`) and serializable results. Always ensure code builds successfully with `cargo build`.
- **React Frontend:** Use pre-defined design tokens and CSS variables. Ensure all components use modular, clean CSS and support smooth transitions.
- **IPC Safety:** Ensure Tauri command handler signatures match React frontend `invoke` calls exactly. Validate JSON serialization boundaries.
