import { serviceApi } from './apiClient';
import config from '../../config';

export const donorApi = {
    async getDonors(){
        try {
            const response = await serviceApi.get('/api/donors/');
            console.log('Donors API Response:', response);
            
            let data = [];
            
            // Handle different response formats
            if (Array.isArray(response)) {
                data = response;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            }
            
            // Transform API response fields to component expected fields
            return data.map(donor => ({
                id: donor.donor_id || donor.id,
                name: donor.donor_name || donor.name,
                city: donor.city,
                contact: donor.contact_person,
                phone: donor.mobile_number,
                address: donor.address,
                pincode: donor.pincode,
                isActive: donor.is_active,
                ...donor // Include all original fields
            }));
        } catch (error) {
            console.error('Error fetching donors:', error);
            throw error;
        }
    }
}