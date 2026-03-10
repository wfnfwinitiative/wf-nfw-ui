import axios from 'axios';
import config from '../../config';

/**
 * Centralized API Client for all REST API calls
 */
class ApiClient {
  constructor(baseURL, options = {}) {
    this.instance = axios.create({
      baseURL,
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Centralized error handling
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            // Handle unauthorized - could redirect to login
            console.error('Unauthorized access');
          } else if (status === 500) {
            console.error('Server error:', data?.message || 'Internal server error');
          }
        } else if (error.request) {
          console.error('Network error - no response received');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods
  async get(url, config = {}) {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post(url, data, config = {}) {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put(url, data, config = {}) {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch(url, data, config = {}) {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  // For file uploads with FormData
  async postFormData(url, formData, config = {}) {
    console.log('[ApiClient] postFormData called for:', url);
    console.log('[ApiClient] FormData entries:', Array.from(formData.entries()));
    
    // Critical: For FormData, we must override the default 'Content-Type': 'application/json'
    // Set Content-Type to undefined so axios will auto-detect FormData and set proper boundary
    const response = await this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': undefined, // Override default JSON header
        ...config.headers,
      },
    });
    
    console.log('[ApiClient] FormData response received:', response.status, response.data);
    return response.data;
  }
}

export const serviceApi = new ApiClient(config.serviceUrl, {
  timeout: 60000, // 60 seconds for file uploads
});

// Pre-configured API clients for different services -- Need to rename
export const llmApi = new ApiClient(config.llmServiceUrl, {
  timeout: 60000, // 60 seconds for audio processing
});

// Add more API clients as needed
// export const backendApi = new ApiClient(config.backendServiceUrl);
// export const authApi = new ApiClient(config.authServiceUrl);

export default ApiClient;
