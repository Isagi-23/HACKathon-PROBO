
import axios from "axios";

const fetchApi = () => {
  const defaultOptions = {
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Create instance
  let instance = axios.create(defaultOptions);

  // Set the JWT token for any request
  instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("token");
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  });

  return instance;
};

export default fetchApi();
