import axios from 'axios';
import { getAuthToken } from '../utils/storage';
import Constants from '../utils/Constant';

class ChatApiService {
  constructor() {
    this.baseURL = Constants.baseUrl;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response) {
          return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, config = {}) {
    try {
      return await this.api.get(url, config);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      return await this.api.post(url, data, config);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      return await this.api.put(url, data, config);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  async delete(url, config = {}) {
    try {
      return await this.api.delete(url, config);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}

export default new ChatApiService();