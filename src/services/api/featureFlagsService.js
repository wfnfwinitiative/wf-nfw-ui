import ApiClient from './apiClient';
import config from '../../config';

// API client for backend services
const backendApi = new ApiClient(config.backendServiceUrl);

/**
 * Feature Flags Service
 * Handles all feature flag related API calls
 */
export const featureFlagsService = {
  /**
   * Get all feature flags
   */
  async getAllFlags() {
    return backendApi.get('/api/feature-flags');
  },

  /**
   * Get a specific feature flag by name
   */
  async getFlagByName(flagName) {
    return backendApi.get(`/api/feature-flags/${flagName}`);
  },

  /**
   * Update a feature flag (Admin only)
   */
  async updateFlag(flagId, enabled) {
    return backendApi.put(`/api/feature-flags/${flagId}`, { enabled });
  },

  /**
   * Create a new feature flag (Admin only)
   */
  async createFlag(featureFlagName, enabled = true) {
    return backendApi.post('/api/feature-flags', { feature_flag_name: featureFlagName, enabled });
  },

  /**
   * Delete a feature flag (Admin only)
   */
  async deleteFlag(flagId) {
    return backendApi.delete(`/api/feature-flags/${flagId}`);
  },
};

// Feature flag names constants
export const FEATURE_FLAGS = {
  VOICE_SUPPORT: 'voice_support',
};
    
export default featureFlagsService;
