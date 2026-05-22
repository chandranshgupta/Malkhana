import { invoke } from '@tauri-apps/api/core';

export const getEvidenceLog = async () => {
  try {
    return await invoke('get_evidence_log');
  } catch (error) {
    console.error('Failed to get evidence log:', error);
    throw error;
  }
};

export const createCase = async (cnr, fir, io, jurisdiction) => {
  try {
    return await invoke('create_case', { cnr, fir, io, jurisdiction });
  } catch (error) {
    console.error('Failed to create case:', error);
    throw error;
  }
};

export const getAllCases = async () => {
  try {
    return await invoke('get_all_cases');
  } catch (error) {
    console.error('Failed to get all cases:', error);
    throw error;
  }
};

export const ingestEvidence = async (input) => {
  try {
    return await invoke('ingest_evidence', { input });
  } catch (error) {
    console.error('Failed to ingest evidence:', error);
    throw error;
  }
};

export const getEvidenceForCertificate = async () => {
  try {
    return await invoke('get_evidence_for_certificate');
  } catch (error) {
    console.error('Failed to get evidence for certificate:', error);
    throw error;
  }
};

export const generateCertificate = async (input) => {
  try {
    return await invoke('generate_certificate', { input });
  } catch (error) {
    console.error('Failed to generate certificate:', error);
    throw error;
  }
};

export const getCertificate = async (evidenceId) => {
  try {
    return await invoke('get_certificate', { evidenceId });
  } catch (error) {
    console.error('Failed to get certificate:', error);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    return await invoke('get_settings');
  } catch (error) {
    console.error('Failed to get settings:', error);
    throw error;
  }
};

export const updateSetting = async (key, value) => {
  try {
    return await invoke('update_setting', { key, value });
  } catch (error) {
    console.error('Failed to update setting:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    return await invoke('get_all_users');
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw error;
  }
};

export const getArchiveMatrix = async () => {
  try {
    return await invoke('get_archive_matrix');
  } catch (error) {
    console.error('Failed to get archive matrix:', error);
    throw error;
  }
};

export const searchArchive = async (query) => {
  try {
    return await invoke('search_archive', { query });
  } catch (error) {
    console.error('Failed to search archive:', error);
    throw error;
  }
};

export const getCustodyChain = async (evidenceId) => {
  try {
    return await invoke('get_custody_chain', { evidenceId });
  } catch (error) {
    console.error('Failed to get custody chain:', error);
    throw error;
  }
};

export const transferCustody = async (evidenceId, fromPerson, toPerson, role, organization, hashAtTransfer, hashVerified, notes) => {
  try {
    return await invoke('transfer_custody', { evidenceId, fromPerson, toPerson, role, organization, hashAtTransfer, hashVerified, notes });
  } catch (error) {
    console.error('Failed to transfer custody:', error);
    throw error;
  }
};

export const getEvidenceDetails = async (id) => {
  try {
    return await invoke('get_evidence_details', { id });
  } catch (error) {
    console.error('Failed to get evidence details:', error);
    throw error;
  }
};

export const authenticateUser = async (username, password) => {
  try {
    return await invoke('authenticate_user', { username, password });
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    throw error;
  }
};

export const acquireForensicImage = async (source, destination) => {
  try {
    return await invoke('acquire_forensic_image', { source, destination });
  } catch (error) {
    console.error('Failed to acquire forensic image:', error);
    throw error;
  }
};

export const getAuditLog = async () => {
  try {
    return await invoke('get_audit_log');
  } catch (error) {
    console.error('Failed to get audit log:', error);
    throw error;
  }
};

export const verifyAuditLogTrail = async () => {
  try {
    return await invoke('verify_audit_log_trail');
  } catch (error) {
    console.error('Failed to verify audit log trail:', error);
    throw error;
  }
};

export const detectDevices = async () => {
  try {
    return await invoke('detect_devices');
  } catch (error) {
    console.error('Failed to detect devices:', error);
    throw error;
  }
};

export const verifyForensicIntegrity = async (h1, h2, h3) => {
  try {
    return await invoke('verify_forensic_integrity', { h1, h2, h3 });
  } catch (error) {
    console.error('Failed to verify forensic integrity:', error);
    throw error;
  }
};

export const getHardwareInfo = async () => {
  try {
    return await invoke('get_hardware_info');
  } catch (error) {
    console.error('Failed to get hardware info:', error);
    throw error;
  }
};

export const isVaultInitialized = async () => {
  try {
    return await invoke('is_vault_initialized');
  } catch (error) {
    console.error('Failed to check vault init state:', error);
    throw error;
  }
};

export const isVaultLocked = async () => {
  try {
    return await invoke('is_vault_locked');
  } catch (error) {
    console.error('Failed to check if vault is locked:', error);
    throw error;
  }
};

export const unlockVault = async (password) => {
  try {
    return await invoke('unlock_vault', { password });
  } catch (error) {
    console.error('Failed to unlock vault:', error);
    throw error;
  }
};

export const lockVault = async () => {
  try {
    return await invoke('lock_vault');
  } catch (error) {
    console.error('Failed to lock vault:', error);
    throw error;
  }
};

export const generateUserSigningKey = async (username) => {
  try {
    return await invoke('generate_user_signing_key', { username });
  } catch (error) {
    console.error('Failed to generate signing key:', error);
    throw error;
  }
};

export const signCertificate = async (certificateId, privateKeyHex) => {
  try {
    return await invoke('sign_certificate', { certificateId, privateKeyHex });
  } catch (error) {
    console.error('Failed to sign certificate:', error);
    throw error;
  }
};

export const verifyCertificateSignature = async (certificateId) => {
  try {
    return await invoke('verify_certificate_signature', { certificateId });
  } catch (error) {
    console.error('Failed to verify certificate signature:', error);
    throw error;
  }
};

export const resetDatabase = async () => {
  try {
    return await invoke('reset_database');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
};

export const authenticateSession = async (batchNo, pinOrPassword, deviceFingerprint, cameraSnapshot = null, audioSample = null) => {
  try {
    return await invoke('authenticate_session', { batchNo, pinOrPassword, deviceFingerprint, cameraSnapshot, audioSample });
  } catch (error) {
    console.error('Failed to authenticate session:', error);
    throw error;
  }
};

export const closeSession = async (sessionId) => {
  try {
    return await invoke('close_session', { sessionId });
  } catch (error) {
    console.error('Failed to close session:', error);
    throw error;
  }
};

export const reauthSession = async (sessionId, pin, cameraSnapshot = null, audioSample = null) => {
  try {
    return await invoke('reauth_session', { sessionId, pin, cameraSnapshot, audioSample });
  } catch (error) {
    console.error('Failed to reauth session:', error);
    throw error;
  }
};

export const registerPin = async (batchNo, pin) => {
  try {
    return await invoke('register_pin', { batchNo, pin });
  } catch (error) {
    console.error('Failed to register pin:', error);
    throw error;
  }
};

export const saveEncryptedVaultKey = async (pin, masterPassword) => {
  try {
    return await invoke('save_encrypted_vault_key', { pin, masterPassword });
  } catch (error) {
    console.error('Failed to save encrypted vault key:', error);
    throw error;
  }
};

export const tryPinUnlock = async (pin) => {
  try {
    return await invoke('try_pin_unlock', { pin });
  } catch (error) {
    console.error('Failed to try pin unlock:', error);
    throw error;
  }
};

export const deletePinVault = async () => {
  try {
    return await invoke('delete_pin_vault');
  } catch (error) {
    console.error('Failed to delete pin vault:', error);
    throw error;
  }
};

export const isPinVaultEnabled = async () => {
  try {
    return await invoke('is_pin_vault_enabled');
  } catch (error) {
    console.error('Failed to check if pin vault is enabled:', error);
    throw error;
  }
};

export const cosignSession = async (sessionId, name, rank, batchNo, signature) => {
  try {
    return await invoke('cosign_session', { sessionId, name, rank, batchNo, signature });
  } catch (error) {
    console.error('Failed to cosign session:', error);
    throw error;
  }
};

export const logSystemHealthEvent = async (eventType, details) => {
  try {
    return await invoke('log_system_health_event', { eventType, details });
  } catch (error) {
    console.error('Failed to log system health event:', error);
    throw error;
  }
};

export const getSystemHealthLog = async () => {
  try {
    return await invoke('get_system_health_log');
  } catch (error) {
    console.error('Failed to get system health log:', error);
    throw error;
  }
};

export const disposeEvidence = async (evidenceId, dispositionType, magistrateOrderNo, disposedTo, signature, notes) => {
  try {
    return await invoke('dispose_evidence', { evidenceId, dispositionType, magistrateOrderNo, disposedTo, signature, notes });
  } catch (error) {
    console.error('Failed to dispose evidence:', error);
    throw error;
  }
};

export const updateOfficerLanguage = async (batchNo, lang) => {
  try {
    return await invoke('update_officer_language', { batchNo, lang });
  } catch (error) {
    console.error('Failed to update officer language:', error);
    throw error;
  }
};

export const getAllSessions = async () => {
  try {
    return await invoke('get_all_sessions');
  } catch (error) {
    console.error('Failed to get all sessions:', error);
    throw error;
  }
};

export const getSessionEvents = async (sessionId) => {
  try {
    return await invoke('get_session_events', { sessionId });
  } catch (error) {
    console.error('Failed to get session events:', error);
    throw error;
  }
};

export const getSessionCosigners = async (sessionId) => {
  try {
    return await invoke('get_session_cosigners', { sessionId });
  } catch (error) {
    console.error('Failed to get session cosigners:', error);
    throw error;
  }
};

