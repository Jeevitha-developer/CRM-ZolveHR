import { BaseAPI, ApiResponse } from './config';

export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  industry: string;
  company_size: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name?: string;
  created_by_lastname?: string;
  active_subscriptions?: number;
  subscriptions?: any[];
}

export interface CreateClientRequest {
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gst_number?: string;
  pan_number?: string;
  industry: string;
  company_size?: string;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface UpdateClientRequest extends CreateClientRequest {
  id: string;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  industry?: string;
  company_size?: string;
}

export interface ClientStats {
  overview: {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    suspended_clients: number;
    new_clients_this_month: number;
    clients_with_subscriptions: number;
    active_subscriptions: number;
    total_monthly_revenue: number;
  };
  industry_distribution: Array<{
    industry: string;
    count: number;
  }>;
}

class ClientAPI extends BaseAPI {
  async getClients(filters?: ClientFilters): Promise<ApiResponse<{ clients: Client[] }>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.industry) params.industry = filters.industry;
      if (filters.company_size) params.company_size = filters.company_size;
    }

    return this.get('/clients', params);
  }

  async getClient(id: string): Promise<{ client: Client }> {
    return this.get(`/clients/${id}`);
  }

  async createClient(clientData: CreateClientRequest): Promise<{ message: string; client: Client }> {
    return this.post('/clients', clientData);
  }

  async updateClient(id: string, clientData: UpdateClientRequest): Promise<{ message: string; client: Client }> {
    return this.put(`/clients/${id}`, clientData);
  }

  async deleteClient(id: string): Promise<{ message: string }> {
    return this.delete(`/clients/${id}`);
  }

  async getClientStats(): Promise<ClientStats> {
    return this.get('/clients/stats/overview');
  }

  // Helper methods for common operations
  async searchClients(query: string, page = 1, limit = 10): Promise<ApiResponse<{ clients: Client[] }>> {
    return this.getClients({ search: query, page, limit });
  }

  async getActiveClients(page = 1, limit = 10): Promise<ApiResponse<{ clients: Client[] }>> {
    return this.getClients({ status: 'active', page, limit });
  }

  async getClientsByIndustry(industry: string, page = 1, limit = 10): Promise<ApiResponse<{ clients: Client[] }>> {
    return this.getClients({ industry, page, limit });
  }

  async getClientsByCompanySize(size: string, page = 1, limit = 10): Promise<ApiResponse<{ clients: Client[] }>> {
    return this.getClients({ company_size: size, page, limit });
  }
}

export const clientAPI = new ClientAPI();