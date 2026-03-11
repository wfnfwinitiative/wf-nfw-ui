import { serviceApi } from './apiClient';
import config from '../../config';

export const UserApi = {
    async getUserByRole(role){
        try {
            const response = await serviceApi.get(`/api/users/by-role/${role}`);
            console.log(`Users API Response for role ${role}:`, response);
            
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
            return data.map(user => ({
                id: user.user_id || user.id,
                name: user.name,
                phone: user.mobile_number,
                status: user.is_active ? 'active' : 'inactive',
                isActive: user.is_active,
                createdAt: user.created_at,
                ...user // Include all original fields
            }));
        } catch (error) {
            console.error(`Error fetching users for role ${role}:`, error);
            throw error;
        }
    }
}