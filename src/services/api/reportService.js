import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const getReport = async (filters) => {
  const res = await axios.post(`${BASE_URL}/reports/opportunities`, filters);
  return res.data;
};