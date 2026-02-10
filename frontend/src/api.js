import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getMachines = () => axios.get(`${API_BASE_URL}/machines`);

export const getDiagnoses = (resolved = null) => {
    const params = resolved !== null ? { resolved } : {};
    return axios.get(`${API_BASE_URL}/diagnoses`, { params });
};

export const resolveDiagnosis = (diagnosisId, notes = null, resolvedBy = "User") =>
    axios.patch(`${API_BASE_URL}/diagnoses/${diagnosisId}/resolve`, null, {
        params: { resolution_notes: notes, resolved_by: resolvedBy }
    });

export const runSimulation = (capacity) =>
    axios.post(`${API_BASE_URL}/simulate?capacity=${capacity}`);

export const getStats = () => axios.get(`${API_BASE_URL}/stats`);
