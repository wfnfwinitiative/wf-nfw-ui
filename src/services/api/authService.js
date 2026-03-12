import ApiClient from './apiClient';
import config from '../../config';

// API client for backend auth services
const serviceApi = new ApiClient(config.serviceUrl);

/**
 * Auth Service
 * Handles authentication related API calls
 */
export const authService = {
  /**
   * Login with mobile number and password
   * @param {string} mobileNumber - User's mobile number (unique ID)
   * @param {string} password - User's password
   * @returns {Promise<{access_token: string, token_type: string}>}
   */
  async login(mobileNumber, password) {
    return serviceApi.post('/api/auth/login', {
      mobile_number: mobileNumber,
      password,
    });
  },
};

/**
 * Decode JWT token to extract payload (without verification)
 * @param {string} token - JWT token
 * @returns {object} Decoded payload
 */
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
}

export default authService;
