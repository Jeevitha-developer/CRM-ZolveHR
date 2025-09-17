import { BaseAPI, ApiResponse } from './config';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  currency: 'INR';
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  module_access: Record<string, boolean | string>;
  max_users: number;
  max_clients: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  active_subscriptions?: number;
  total_subscriptions?: number;
  total_revenue?: number;
  recent_subscriptions?: any[];
}

export interface CreatePlanRequest {
  name: string;
  description: string;
  price_inr: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  features?: string[];
  module_access?: Record<string, boolean | string>;
  max_users?: number;
  max_clients?: number;
  is_active?: boolean;
}

export interface UpdatePlanRequest extends CreatePlanRequest {
  id: string;
}

export interface PlanFilters {
  page?: number;
  limit?: number;
  is_active?: boolean;
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly';
  search?: string;
}

export interface PlanStats {
  overview: {
    total_plans: number;
    active_plans: number;
    inactive_plans: number;
    average_plan_price: number;
    min_plan_price: number;
    max_plan_price: number;
  };
  plan_subscriptions: Array<{
    id: string;
    name: string;
    price_inr: number;
    billing_cycle: string;
    total_subscriptions: number;
    active_subscriptions: number;
    monthly_revenue: number;
  }>;
  billing_distribution: Array<{
    billing_cycle: string;
    plan_count: number;
    average_price: number;
  }>;
  feature_usage: Array<{
    name: string;
    features: string;
    module_access: string;
    subscription_count: number;
  }>;
}

class PlanAPI extends BaseAPI {
  async getPlans(filters?: PlanFilters): Promise<ApiResponse<{ plans: Plan[] }>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.is_active !== undefined) params.is_active = filters.is_active.toString();
      if (filters.billing_cycle) params.billing_cycle = filters.billing_cycle;
      if (filters.search) params.search = filters.search;
    }

    return this.get('/plans', params);
  }

  async getActivePlans(): Promise<{ plans: Plan[] }> {
    return this.get('/plans/active');
  }

  async getPlan(id: string): Promise<{ plan: Plan }> {
    return this.get(`/plans/${id}`);
  }

  async createPlan(planData: CreatePlanRequest): Promise<{ message: string; plan: Plan }> {
    return this.post('/plans', planData);
  }

  async updatePlan(id: string, planData: UpdatePlanRequest): Promise<{ message: string; plan: Plan }> {
    return this.put(`/plans/${id}`, planData);
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    return this.delete(`/plans/${id}`);
  }

  async activatePlan(id: string): Promise<{ message: string; plan: Plan }> {
    return this.post(`/plans/${id}/activate`);
  }

  async duplicatePlan(id: string): Promise<{ message: string; plan: Plan }> {
    return this.post(`/plans/${id}/duplicate`);
  }

  async getPlanStats(): Promise<PlanStats> {
    return this.get('/plans/stats/overview');
  }

  // Helper methods for common operations
  async getMonthlyPlans(): Promise<{ plans: Plan[] }> {
    const response = await this.getPlans({ billing_cycle: 'monthly', is_active: true });
    return { plans: response.plans || [] };
  }

  async getYearlyPlans(): Promise<{ plans: Plan[] }> {
    const response = await this.getPlans({ billing_cycle: 'yearly', is_active: true });
    return { plans: response.plans || [] };
  }

  async searchPlans(query: string): Promise<{ plans: Plan[] }> {
    const response = await this.getPlans({ search: query, is_active: true });
    return { plans: response.plans || [] };
  }

  // Plan comparison helper
  async getPlanComparison(): Promise<{ plans: Plan[] }> {
    const response = await this.getActivePlans();
    return {
      plans: response.plans.sort((a, b) => a.price_inr - b.price_inr)
    };
  }

  // Format price for display
  formatPrice(plan: Plan): string {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
    
    const cycleMap = {
      monthly: '/month',
      quarterly: '/quarter',
      yearly: '/year'
    };
    
    return `${formatter.format(plan.price_inr)}${cycleMap[plan.billing_cycle]}`;
  }
}

export const planAPI = new PlanAPI();