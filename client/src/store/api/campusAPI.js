import axios from "axios";

const API_URL = "http://localhost:5000/api/campus-grievances";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getAllGrievances = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

export const createGrievance = async (grievanceData) => {
  const response = await axios.post(API_URL, grievanceData, getAuthConfig());
  return response.data;
};

// Update grievance
export const updateGrievance = async (id, grievanceData) => {
  const response = await axios.put(`${API_URL}/${id}`, grievanceData, getAuthConfig());
  return response.data;
};

// Approve grievance
export const approveGrievance = async (id, suggestion) => {
  const response = await axios.put(`${API_URL}/${id}/approve`, { suggestion }, getAuthConfig());
  return response.data;
};

// Reject grievance
export const rejectGrievance = async (id, suggestion) => {
  const response = await axios.put(`${API_URL}/${id}/reject`, { suggestion }, getAuthConfig());
  return response.data;
};

// Delete grievance
export const deleteGrievance = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};

