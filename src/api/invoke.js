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



