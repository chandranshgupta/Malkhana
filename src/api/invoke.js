import { invoke } from '@tauri-apps/api/core';

export const getEvidenceLog = async () => {
  try {
    return await invoke('get_evidence_log');
  } catch (error) {
    console.error('Failed to get evidence log:', error);
    throw error;
  }
};

export const createCase = async (cnr, fir, io) => {
  try {
    return await invoke('create_case', { cnr, fir, io });
  } catch (error) {
    console.error('Failed to create case:', error);
    throw error;
  }
};

export const ingestEvidence = async (caseId, assetType) => {
  try {
    return await invoke('ingest_evidence', { caseId, assetType });
  } catch (error) {
    console.error('Failed to ingest evidence:', error);
    throw error;
  }
};
