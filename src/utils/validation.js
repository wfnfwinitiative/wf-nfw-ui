/**
 * Reusable validation utilities for admin forms.
 * Used across Coordinator, Driver, Vehicle, Pickup Location, and Hunger Spot screens.
 */


/**
 * Validates coordinator/driver password.
 * - Alphanumeric only (no special characters)
 * - Maximum length 20 characters
 * @param {string} value
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePassword(value) {
  if (value == null || String(value).trim() === '') {
    return { valid: false, message: 'Password is required.' };
  }
  const str = String(value).trim();
  if (str.length > 20) {
    return { valid: false, message: 'Password must not exceed 20 characters.' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(str)) {
    return { valid: false, message: 'Password must be alphanumeric only. No special characters allowed.' };
  }
  return { valid: true };
}

/**
 * Validates Indian-style phone number.
 * - Must start with 6, 7, 8, or 9
 * - Exactly 10 digits
 * - Only numeric characters
 * @param {string} value - optional when field is optional
 * @param {boolean} required - whether the field is required
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePhone(value, required = false) {
  const str = value == null ? '' : String(value).trim();
  if (!str) {
    return required ? { valid: false, message: 'Phone number is required.' } : { valid: true };
  }
  if (!/^\d+$/.test(str)) {
    return { valid: false, message: 'Only numeric characters allowed.' };
  }
  if (str.length !== 10) {
    return { valid: false, message: 'Phone number must contain exactly 10 digits.' };
  }
  if (!/^[6-9]/.test(str)) {
    return { valid: false, message: 'Phone number must start with 6, 7, 8, or 9.' };
  }
  return { valid: true };
}

/**
 * Validates vehicle number.
 * - Exactly 8 characters
 * - Letters and numbers only (uppercase and lowercase allowed)
 * - No special characters
 * @param {string} value
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateVehicleNumber(value) {
  if (value == null || String(value).trim() === '') {
    return { valid: false, message: 'Vehicle number is required.' };
  }
  const str = String(value).trim();
  if (str.length !== 8) {
    return { valid: false, message: 'Vehicle number must be exactly 8 characters.' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(str)) {
    return { valid: false, message: 'Only letters and numbers allowed. No special characters.' };
  }
  return { valid: true };
}
