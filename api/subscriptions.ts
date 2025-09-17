import { BaseAPI, ApiResponse } from './config';

export interface Subscription {
  id: string;
  client_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  payment_status: 'paid' | 'pending' | 'overdue' | 'failed';
  start_date: string;
  end_date: string;
  amount_inr: number;
  currency: 'INR';
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  auto_renewal: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  client_name?: string;
  client_email?: string;
  plan_name?: string;
  plan_features?: string[];
  plan_module_access?: Record<string, boolean | string>;
}

export interface CreateSubscriptionRequest {
  client_id: string;
  plan_id: string;
  start_date?: string;
  end_date?: string;
  amount_inr?: number;
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly';
  auto_renewal?: boolean;
  payment_status?: 'paid' | 'pending' | 'overdue' | 'failed';
}

export interface UpdateSubscriptionRequest {
  client_id?: string;
  plan_id?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';
  payment_status?: 'paid' | 'pending' | 'overdue' | 'failed';
  start_date?: string;
  end_date?: string;
  amount_inr?: number;
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly';
  auto_renewal?: boolean;
}

export interface SubscriptionFilters {
  page?: number;
  limit?: number;
  client_id?: string;
  plan_id?: string;
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';
  payment_status?: 'paid' | 'pending' | 'overdue' | 'failed';
  billing_cycle?: 'monthly' | 'quarterly' | 'yearly';
  search?: string;
}

export interface SubscriptionStats {
  overview: {
    total_subscriptions: number;
    active_subscriptions: number;
    inactive_subscriptions: number;
    cancelled_subscriptions: number;
    expired_subscriptions: number;
    total_revenue: number;
    monthly_recurring_revenue: number;
    average_subscription_value: number;
    churn_rate: number;
    new_subscriptions_this_month: number;
  };
  revenue_by_plan: Array<{
    plan_id: string;
    plan_name: string;
    active_subscriptions: number;
    monthly_revenue: number;
    total_revenue: number;
  }>;
  payment_status_distribution: Array<{
    payment_status: string;
    count: number;
    percentage: number;
  }>;
  billing_cycle_distribution: Array<{
    billing_cycle: string;
    count: number;
    revenue: number;
  }>;
  recent_subscriptions: Subscription[];
}

class SubscriptionAPI extends BaseAPI {
  async getSubscriptions(filters?: SubscriptionFilters): Promise<ApiResponse<{ subscriptions: Subscription[] }>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.client_id) params.client_id = filters.client_id;
      if (filters.plan_id) params.plan_id = filters.plan_id;
      if (filters.status) params.status = filters.status;
      if (filters.payment_status) params.payment_status = filters.payment_status;
      if (filters.billing_cycle) params.billing_cycle = filters.billing_cycle;
      if (filters.search) params.search = filters.search;
    }

    return this.get('/subscriptions', params);
  }

  async getSubscription(id: string): Promise<{ subscription: Subscription }> {
    return this.get(`/subscriptions/${id}`);
  }

  async createSubscription(subscriptionData: CreateSubscriptionRequest): Promise<{ message: string; subscription: Subscription }> {
    return this.post('/subscriptions', subscriptionData);
  }

  async updateSubscription(id: string, subscriptionData: UpdateSubscriptionRequest): Promise<{ message: string; subscription: Subscription }> {
    return this.put(`/subscriptions/${id}`, subscriptionData);
  }

  async cancelSubscription(id: string): Promise<{ message: string; subscription: Subscription }> {
    return this.put(`/subscriptions/${id}`, { status: 'cancelled' });
  }

  async renewSubscription(id: string): Promise<{ message: string; subscription: Subscription }> {
    return this.post(`/subscriptions/${id}/renew`);
  }

  async deleteSubscription(id: string): Promise<{ message: string }> {
    return this.delete(`/subscriptions/${id}`);
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    return this.get('/subscriptions/stats/overview');
  }

  async getClientSubscriptions(clientId: string): Promise<{ subscriptions: Subscription[] }> {
    const response = await this.getSubscriptions({ client_id: clientId });
    return { subscriptions: response.subscriptions || [] };
  }

  async getPlanSubscriptions(planId: string): Promise<{ subscriptions: Subscription[] }> {
    const response = await this.getSubscriptions({ plan_id: planId });
    return { subscriptions: response.subscriptions || [] };
  }

  // Helper methods for common operations
  async getActiveSubscriptions(page = 1, limit = 10): Promise<ApiResponse<{ subscriptions: Subscription[] }>> {
    return this.getSubscriptions({ status: 'active', page, limit });
  }

  async getOverdueSubscriptions(): Promise<{ subscriptions: Subscription[] }> {
    const response = await this.getSubscriptions({ 
      status: 'active', 
      payment_status: 'overdue',
      limit: 100 
    });
    return { subscriptions: response.subscriptions || [] };
  }

  async getExpiringSubscriptions(days = 30): Promise<{ subscriptions: Subscription[] }> {
    // This would need a specific endpoint on the backend for date-based filtering
    // For now, we'll get active subscriptions and filter client-side
    const response = await this.getActiveSubscriptions(1, 100);
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + days);
    
    const expiringSubscriptions = (response.subscriptions || []).filter(sub => {
      const endDate = new Date(sub.end_date);
      return endDate <= expiringDate && endDate > new Date();
    });

    return { subscriptions: expiringSubscriptions };
  }

  async searchSubscriptions(query: string): Promise<{ subscriptions: Subscription[] }> {
    const response = await this.getSubscriptions({ search: query });
    return { subscriptions: response.subscriptions || [] };
  }

  // Revenue calculations
  calculateMonthlyRevenue(subscriptions: Subscription[]): number {
    return subscriptions
      .filter(sub => sub.status === 'active' && sub.payment_status === 'paid')
      .reduce((total, sub) => {
        // Convert to monthly equivalent
        let monthlyAmount = sub.amount_inr;
        if (sub.billing_cycle === 'yearly') {
          monthlyAmount = sub.amount_inr / 12;
        } else if (sub.billing_cycle === 'quarterly') {
          monthlyAmount = sub.amount_inr / 3;
        }
        return total + monthlyAmount;
      }, 0);
  }

  // Format currency for display
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  // Subscription status helpers
  isActive(subscription: Subscription): boolean {
    return subscription.status === 'active' && 
           new Date(subscription.end_date) > new Date();
  }

  isExpiring(subscription: Subscription, days = 30): boolean {
    if (!this.isActive(subscription)) return false;
    
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + days);
    
    return new Date(subscription.end_date) <= expiringDate;
  }

  isOverdue(subscription: Subscription): boolean {
    return subscription.payment_status === 'overdue';
  }
}

export const subscriptionAPI = new SubscriptionAPI();