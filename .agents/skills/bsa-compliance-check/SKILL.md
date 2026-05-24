---
name: bsa-compliance-check
description: Triggered when working with Bharatiya Sakshya Adhiniyam (BSA) compliance, admissibility certificates, evidence integrity, or cryptographic hashing.
---

# Skill: BSA Admissibility & Evidence Integrity

## Goal
Verify and guarantee that all system features (evidence logging, certificate drafting, audit trailing, and cryptographic hashing) conform to Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) for court admissibility.

## Instructions
1. **Cryptographic Hashing Verification:** Ensure that any digital evidence item ingested has a SHA-256 hash generated immediately. Verify this hash matches the source file on disk. Do not modify or overwrite generated hashes once saved to the database.
2. **Audit Trails & Security logs:** Inspect the system health log and database audit table when creating reports. Verify that:
   - Every read/write operation on evidence records is logged with officer identity and timestamps.
   - Irregular system events (e.g., system power loss, crash, startup recovery) during the evidence storage window are flagged.
3. **Downtime & Outage Disclosures:** When drafting or viewing an admissibility certificate under BSA:
   - Scan the `system_health_log` table for any downtime records within the custody time frame.
   - Insert an automated downtime statement/disclaimer directly into the certificate PDF metadata and UI preview.
4. **Zero Alteration Guardrails:** Do not provide features to edit or overwrite raw evidence files or audit log entries. These must remain read-only.
