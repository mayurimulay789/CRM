import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL + '/student-grievances';

const studentGrievanceAPI = {
  // Create a new grievance
  createGrievance: (grievanceData) => {
    return axios.post(API_BASE_URL, grievanceData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get grievances for counsellor
  getCounsellorGrievances: () => {
    return axios.get(`${API_BASE_URL}/counsellor`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get all grievances for admin
  getAllGrievances: () => {
    return axios.get(`${API_BASE_URL}/admin`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Update grievance (for counsellor)
  updateGrievance: (id, grievanceData) => {
    return axios.put(`${API_BASE_URL}/${id}`, grievanceData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Update grievance status
  updateGrievanceStatus: (id, status, adminResponse) => {
    const endpoint = status === 'approved' ? 'approve' : 'reject';
    return axios.put(`${API_BASE_URL}/${id}/${endpoint}`, { adminResponse }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Get single grievance
  getGrievance: (id) => {
    return axios.get(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Delete grievance
  deleteGrievance: (id) => {
    return axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
};

export default studentGrievanceAPI;
