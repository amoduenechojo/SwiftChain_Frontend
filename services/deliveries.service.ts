import { apiClient } from './api';
import { Delivery } from '../types/delivery';
import { DeliveryFilterParams } from '../types/filters';

export interface CreateDeliveryPayload {
  pickupAddress: string;
  destination: string;
  packageSize: 'small' | 'medium' | 'large';
  description: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
}

export const deliveriesService = {
  getDeliveries: async (filters?: DeliveryFilterParams): Promise<Delivery[]> => {
    let url = '/deliveries';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const { data } = await apiClient.get<Delivery[]>(url);
    return data;
  },

  getDeliveryById: async (id: string): Promise<Delivery> => {
    const { data } = await apiClient.get<Delivery>(`/deliveries/${id}`);
    return data;
  },

  createDelivery: async (payload: CreateDeliveryPayload): Promise<Delivery> => {
    const { data } = await apiClient.post<Delivery>('/deliveries', payload);
    return data;
  }
};
