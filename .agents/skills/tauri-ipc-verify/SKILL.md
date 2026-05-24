---
name: tauri-ipc-verify
description: Triggered when writing, debugging, or verifying Tauri frontend-backend IPC commands and Rust handlers.
---

# Skill: Tauri IPC & Command Handling Verification

## Goal
Safely write, register, and verify communications between the React Vite frontend and the Rust Tauri backend, ensuring error safety and type-safe serialization.

## Instructions
1. **Locate Commands & Registration:**
   - Command handlers are defined in `src-tauri/src/commands/`.
   - Command handlers MUST be registered in `generate_handler!` inside `main.rs` or `lib.rs`. Verify registration before suggesting test cases.
2. **Type Safety & Serialization:**
   - Any payload passed across the Tauri boundary must derive `serde::Serialize` and `serde::Deserialize`.
   - Keep Rust command signatures aligned with Javascript frontend invocation parameters in `src/api/invoke.js`.
3. **Structured Error Handling:**
   - Commands should return `Result<T, AppError>` where `AppError` is the centralized error enum in `src-tauri/src/utils/errors.rs`.
   - Never return ad-hoc raw string errors (like `Result<T, String>`) for production handlers. Convert errors to `AppError` and serialize them properly.
4. **Validation:**
   - Run `cargo check` or `cargo build` in `src-tauri/` to verify command signature correctness and trait implementations.
