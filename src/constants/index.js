import { Mic2, HardDrive } from 'lucide-react';
import { FEATURE_FLAGS } from '../services/api/featureFlagsService';

// User Roles
export const DRIVER = 'DRIVER';
export const ADMIN = 'ADMIN';
export const COORDINATOR = 'COORDINATOR';
export const SUPPORTADMIN = 'SUPPORTADMIN';

// Feature flag display metadata — icon, description, behaviour hints, setup info
export const FLAG_META = {
  [FEATURE_FLAGS.VOICE_SUPPORT]: {
    Icon: Mic2,
    title: 'Voice Support',
    description:
      'Enables voice-powered food item entry for drivers. Drivers can speak food item names and quantities instead of typing, speeding up the pickup confirmation process.',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
    affectedRoles: 'Drivers',
    whenEnabled: 'A "Voice" tab appears on the pickup confirmation screen.',
    whenDisabled: 'Drivers use manual text entry only for food items.',
    requiresSetup: false,
  },
  [FEATURE_FLAGS.GOOGLE_IMAGE_UPLOAD]: {
    Icon: HardDrive,
    title: 'Google Drive Image Upload',
    description:
      'Allows drivers to photograph pickups and deliveries. Photos are automatically uploaded to Google Drive, organised by opportunity and date, giving coordinators a visual record.',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    affectedRoles: 'Drivers',
    whenEnabled: 'Camera buttons appear on pickup and delivery confirmation screens.',
    whenDisabled: 'Camera buttons are hidden. No images can be uploaded.',
    requiresSetup: true,
  },
};