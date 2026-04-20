import axios from "axios";

const axiosInstance = axios.create({
  timeout: 10000,
});

const axiosConfig = async (method, url, data = {}, headers = {}, params = {}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      headers,
      params,
    });

    return response.data;
  } catch (error) {
    console.error("API ERROR:", error?.response || error.message);

    throw error?.response?.data || {
      message: "Something went wrong",
    };
  }
};

export default axiosConfig;