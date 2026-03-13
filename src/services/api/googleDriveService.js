// googleDriveService.js
// Client-side integration for Google Drive upload API

import { serviceApi } from './apiClient';

/**
 * Upload a file to Google Drive.
 */
export async function uploadImageToDrive(file, { uploadType = 'pickup', driverName = 'Driver', opportunityId = '' } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_type', uploadType);
  formData.append('driver_name', driverName);
  formData.append('opportunity_id', String(opportunityId));

  return await serviceApi.postFormData('/api/upload-image', formData);
}
