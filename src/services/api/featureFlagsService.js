import { serviceApi } from './apiClient';

/**
 * Feature Flags Service
 * Handles all feature flag related API calls
 */
export const featureFlagsService = {
  /**
   * Get all feature flags
   */
  async getAllFlags() {
    return serviceApi.get('/api/feature-flags');
  },

  /**
   * Get a specific feature flag by name
   */
  async getFlagByName(flagName) {
    return serviceApi.get(`/api/feature-flags/${flagName}`);
  },

  /**
   * Update a feature flag (Admin only)
   */
  async updateFlag(feature_flag_name, enabled) {
    // The previous implementation using query parameters resulted in a 404.
    // This updates the endpoint to use a path parameter, which is consistent
    // with the getFlagByName and deleteFlag methods in this service.
    return serviceApi.patch(`/api/feature-flags/${feature_flag_name}`, { enabled });
  },

  /**
   * Create a new feature flag (Admin only)
   */
  async createFlag(feature_flag_name, enabled = true) {
    return serviceApi.post('/api/feature-flags', { feature_flag_name, enabled });
  },

  /**
   * Delete a feature flag (Admin only)
   */
  async deleteFlag(feature_flag_name) {
    return serviceApi.delete(`/api/feature-flags/${feature_flag_name}`);
  },
};

// Feature flag names constants
export const FEATURE_FLAGS = {
  VOICE_SUPPORT: 'voice_support',
  GOOGLE_IMAGE_UPLOAD: 'google_image_upload'

};
    
export default featureFlagsService;
