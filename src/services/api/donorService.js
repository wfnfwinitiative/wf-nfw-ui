import { serviceApi } from './apiClient';
import config from '../../config';

export const DonorApi = {
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
    },

    async createDonor(data) {
        try {
            const response = await serviceApi.post('/api/donors/', data);
            console.log('Donor created:', response);
            return response;
        } catch (error) {
            console.error('Error creating Donor:', error);
            throw error;
        }
    },

    async updateDonor(donorid, data) {
        try {
            const response = await serviceApi.patch(`/api/donors/${donorid}`, data);
            console.log(`Donor ${donorid} updated:`, response);
            return response;
        } catch (error) {
            console.error(`Error updating Donor ${donorid}:`, error);
            throw error;
        }
    },

    async deleteDonor(donorid) {
        try {
            const response = await serviceApi.delete(`/api/donors/${donorid}`);
            console.log(`Donor ${donorid} deleted:`, response);
            return response;
        } catch (error) {
            console.error(`Error deleting donor ${donorid}:`, error);
            throw error;
        }
    },

    async activateDonor(donorid) {
        try {
            const response = await serviceApi.post(`/api/donors/activate/${donorid}`);
            console.log(`Donor ${donorid} activated:`, response);
            return response;
        } catch (error) {
            console.error(`Error activating donor ${donorid}:`, error);
            throw error;
        }
    },
}