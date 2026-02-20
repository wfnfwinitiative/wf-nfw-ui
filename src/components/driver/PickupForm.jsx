import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input, Textarea } from '../common';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export function PickupForm({
  formData,
  setFormData,
  images,
  setImages,
  organizationName,
  vehicleInfo,
}) {
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      setImages((prev) => [...prev, ...acceptedFiles].slice(0, 5));
    },
    [setImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Notice */}
      <div className="p-3 lg:p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs lg:text-sm text-amber-800">
          <strong>Important:</strong> Please fill this form BEFORE physically
          picking up the food. Fields marked with * are required.
        </p>
      </div>

      {/* Pickup Confirmation Section */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Pickup Confirmation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          <Input
            label="Food Name *"
            placeholder="e.g., Rice, Dal, Vegetables"
            value={formData.foodName}
            onChange={handleChange('foodName')}
          />
          <Input
            label="Quantity Collected *"
            placeholder="e.g., 50 kg"
            value={formData.quantityCollected}
            onChange={handleChange('quantityCollected')}
          />
          <Input
            label="Pickup Location"
            value={formData.pickupLocation}
            onChange={handleChange('pickupLocation')}
          />
          <Input
            label="Pickup Time"
            type="datetime-local"
            value={formData.pickupTime}
            onChange={handleChange('pickupTime')}
          />
          <div className="md:col-span-2">
            <Input
              label="Organization Name"
              value={organizationName}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Delivery Section */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Delivery Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          <Input
            label="Hunger Spot Name"
            value={formData.hungerSpotName}
            onChange={handleChange('hungerSpotName')}
          />
          <Input
            label="Drop Location"
            value={formData.dropLocation}
            onChange={handleChange('dropLocation')}
          />
          <Input
            label="Estimated Delivery Time"
            type="datetime-local"
            value={formData.estimatedDeliveryTime}
            onChange={handleChange('estimatedDeliveryTime')}
          />
        </div>
      </div>

      {/* Vehicle Section (Read Only) */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Vehicle Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          <Input
            label="Vehicle Number"
            value={vehicleInfo.number}
            disabled
            className="bg-gray-100"
          />
          <Input
            label="Vehicle Type"
            value={vehicleInfo.type}
            disabled
            className="bg-gray-100"
          />
          <Input
            label="Vehicle Pickup Location"
            value={vehicleInfo.pickupLocation || 'N/A'}
            disabled
            className="bg-gray-100"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 lg:mb-4 text-sm lg:text-base">Image Upload</h4>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 lg:p-6 text-center cursor-pointer
            transition-colors
            ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400 mx-auto mb-2" />
          {isDragActive ? (
            <p className="text-primary-600 text-sm">Drop the images here...</p>
          ) : (
            <>
              <p className="text-gray-600 text-sm">
                Tap to upload or drag images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max 5 images, 5MB each
              </p>
            </>
          )}
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-4 md:grid-cols-5 gap-2">
            {images.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-16 lg:h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-red-500 text-white rounded-full flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PickupForm;
