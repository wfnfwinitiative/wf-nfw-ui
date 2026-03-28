import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

export const getReport = async (filters) => {
  const res = await axios.post(`${BASE_URL}/reports/opportunities`, filters);
  return res.data;
};

export const getDrivers = async () => {
  const res = await axios.get(`${BASE_URL}/users`);
  return res.data.map(u => ({
    id: u.user_id,
    name: u.name
  }));
};

export const getHungerSpots = async () => {
  const res = await axios.get(`${BASE_URL}/hunger-spots`);
  return res.data;
};

export const getVehicles = async () => {
  const res = await axios.get(`${BASE_URL}/vehicles`);
  return res.data;
};

