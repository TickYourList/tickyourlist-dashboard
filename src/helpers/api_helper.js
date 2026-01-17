import axios from "axios";
import accessToken from "./jwt-token-access/accessToken";
import apiKey from "./jwt-token-access/apiKey";

//pass new generated access token here
// const token = accessToken;
const apiKeys = apiKey;
//apply base url for axios
const API_URL = "https://api.univolenitsolutions.com";
// const API_URL = "http://localhost:3005";

// const API_URL = "https://dummy.com";
export const axiosApi = axios.create({
  baseURL: API_URL,
});
axiosApi.defaults.headers.common["x-api-key"] = apiKeys;

function authUserItem() {
  try {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const parsed = JSON.parse(authUser);
      const token = parsed?.data?.tokens?.accessToken || parsed?.tokens?.accessToken || parsed?.accessToken;
      if (token) {
        axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        delete axiosApi.defaults.headers.common["Authorization"];
      }
    } else {
      delete axiosApi.defaults.headers.common["Authorization"];
    }
  } catch (error) {
    // If there's an error parsing, clear the auth header
    delete axiosApi.defaults.headers.common["Authorization"];
  }
}

// function authUserItem() {
//   axiosApi.defaults.headers.common["Authorization"] = accessToken;
// }

axiosApi.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export async function get(url, config = {}) {
  authUserItem();
  // Ensure params are properly passed to axios
  return await axiosApi.get(url, config).then(response => response.data);
}

export async function post(url, data, config = {}) {
  authUserItem();
  return axiosApi
    .post(url, { ...data }, { ...config })
    .then(response => response.data);
}

export async function postFormData(url, data, config = {}) {
  authUserItem();
  return axiosApi
    .post(url, data, { ...config })
    .then(response => response.data);
}

export async function putFormData(url, data, config = {}) {
  authUserItem();
  return axiosApi
    .put(url, data, { ...config })
    .then(response => response.data);
}

export async function put(url, data, config = {}) {
  authUserItem();
  return axiosApi
    .put(url, { ...data }, { ...config })
    .then(response => response.data);
}

export async function del(url, config = {}) {
  authUserItem();
  return await axiosApi
    .delete(url, { ...config })
    .then(response => response.data);
}

// Travel currency

export const getTravelCurrencyListAPI = () => {
  return axios.get("/v1/tyltravelcurrency/get/travelcurrency/submitted/all");
};
