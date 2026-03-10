import { backendApi } from './apiClient';
import config from '../../config';

export const UserApi = {
    async getDrivers(){
        try {
            const response = await backendApi.get('/api/users/get-drivers');
            console.log('Drivers API Response:', response);
            
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
            return data.map(driver => ({
                id: driver.user_id || driver.id,
                name: driver.name,
                phone: driver.mobile_number,
                status: driver.is_active ? 'active' : 'inactive',
                isActive: driver.is_active,
                createdAt: driver.created_at,
                ...driver // Include all original fields
            }));
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    }
}