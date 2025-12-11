import axios from "axios";

// const API_URL = "http://localhost:5000/api/campus-grievances";
const API_URL = "https://admin.rymaacademy.cloud/api/campus-grievances";

// ✅ Helper: attach token for protected routes
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// ✅ Get all grievances (Admin or Counsellor)
export const getAllGrievances = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

// ✅ Create new grievance
export const createGrievance = async (grievanceData) => {
  const response = await axios.post(API_URL, grievanceData, getAuthConfig());
  return response.data;
};

// ✅ Update grievance (edit)
export const updateGrievance = async (id, grievanceData) => {
  const response = await axios.put(`${API_URL}/${id}`, grievanceData, getAuthConfig());
  return response.data;
};

// ✅ Approve grievance (Admin only)
export const approveGrievance = async (id, adminResponse) => {
  const response = await axios.put(`${API_URL}/${id}/approve`, adminResponse, getAuthConfig());
  return response.data;
};

// ✅ Reject grievance (Admin only)
export const rejectGrievance = async (id, adminResponse) => {
  const response = await axios.put(`${API_URL}/${id}/reject`, adminResponse, getAuthConfig());
  return response.data;
};

// ✅ Delete grievance (Admin only)
export const deleteGrievance = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  return response.data;
};
