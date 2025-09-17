import { BaseAPI, ApiResponse } from './config';

export interface HRMSLog {
  id: string;
  client_id: string;
  subscription_id?: string;
  action: 'client_sync' | 'subscription_sync' | 'access_validation' | string;
  status: 'success' | 'failed';
  request_data: any;
  response_data: any;
  error_message?: string;
  hrms_user_id?: string;
  created_at: string;
  // Joined data
  company_name?: string;
  subscription_status?: string;
}

export interface SyncClientRequest {
  client_id: string;
}

export interface SyncSubscriptionRequest {
  subscription_id: string;
}

export interface ValidateAccessRequest {
  client_id: string;
  user_email: string;
  module?: string;
}

export interface AccessValidationResponse {
  access_granted: boolean;
  subscription_details?: {
    plan_name: string;
    subscription_status: string;
    payment_status: string;
    end_date: string;
    max_users: number;
  };
  module_access?: Record<string, boolean | string>;
  client_details?: {
    company_name: string;
    client_status: string;
  };
  error?: string;
  message?: string;
}

export interface HRMSIntegrationStats {
  overview: {
    total_sync_attempts: number;
    successful_syncs: number;
    failed_syncs: number;
    syncs_last_24h: number;
    client_syncs: number;
    subscription_syncs: number;
    access_validations: number;
  };
  recent_failures: HRMSLog[];
  daily_activity: Array<{
    sync_date: string;
    total_attempts: number;
    successful_attempts: number;
    failed_attempts: number;
  }>;
}

export interface WebhookData {
  client_id: string;
  subscription_id?: string;
  user_data?: any;
  module_usage?: any;
  event_type: 'user_login' | 'module_access' | 'usage_report';
}

export interface ConnectionTestResponse {
  message: string;
  hrms_status: any;
  connection_time: string;
}

class HRMSAPI extends BaseAPI {
  async syncClient(clientId: string): Promise<{
    message: string;
    hrms_response: any;
    sync_status: 'success' | 'failed';
  }> {
    return this.post(`/hrms/sync/client/${clientId}`);
  }

  async syncSubscription(subscriptionId: string): Promise<{
    message: string;
    hrms_response: any;
    sync_status: 'success' | 'failed';
  }> {
    return this.post(`/hrms/sync/subscription/${subscriptionId}`);
  }

  async validateAccess(validationData: ValidateAccessRequest): Promise<AccessValidationResponse> {
    return this.post('/hrms/validate/access', validationData);
  }

  async getHRMSLogs(
    clientId: string,
    filters?: {
      page?: number;
      limit?: number;
      action?: string;
      status?: 'success' | 'failed';
    }
  ): Promise<ApiResponse<{ logs: HRMSLog[] }>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.limit) params.limit = filters.limit.toString();
      if (filters.action) params.action = filters.action;
      if (filters.status) params.status = filters.status;
    }

    return this.get(`/hrms/logs/${clientId}`, params);
  }

  async getIntegrationStats(): Promise<HRMSIntegrationStats> {
    return this.get('/hrms/stats/integration');
  }

  async testConnection(): Promise<ConnectionTestResponse> {
    return this.post('/hrms/test/connection');
  }

  async processWebhook(webhookData: WebhookData): Promise<{
    message: string;
    event_type: string;
    processed: boolean;
  }> {
    return this.post('/hrms/webhook/subscription-update', webhookData);
  }

  // Helper methods for common HRMS operations
  async syncClientWithRetry(clientId: string, maxRetries = 3): Promise<{
    message: string;
    hrms_response: any;
    sync_status: 'success' | 'failed';
    attempts: number;
  }> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.syncClient(clientId);
        return { ...result, attempts: attempt };
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError;
  }

  async syncSubscriptionWithRetry(subscriptionId: string, maxRetries = 3): Promise<{
    message: string;
    hrms_response: any;
    sync_status: 'success' | 'failed';
    attempts: number;
  }> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.syncSubscription(subscriptionId);
        return { ...result, attempts: attempt };
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError;
  }

  async bulkSyncClients(clientIds: string[]): Promise<{
    successful: string[];
    failed: string[];
    results: Array<{
      clientId: string;
      success: boolean;
      message: string;
    }>;
  }> {
    const results: Array<{
      clientId: string;
      success: boolean;
      message: string;
    }> = [];

    const successful: string[] = [];
    const failed: string[] = [];

    // Process in parallel but limit concurrency
    const concurrencyLimit = 3;
    const chunks = [];
    
    for (let i = 0; i < clientIds.length; i += concurrencyLimit) {
      chunks.push(clientIds.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (clientId) => {
        try {
          const result = await this.syncClient(clientId);
          successful.push(clientId);
          return {
            clientId,
            success: true,
            message: result.message
          };
        } catch (error: any) {
          failed.push(clientId);
          return {
            clientId,
            success: false,
            message: error.message || 'Sync failed'
          };
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return { successful, failed, results };
  }

  // Validation helpers
  async validateUserAccess(clientId: string, userEmail: string, module?: string): Promise<{
    hasAccess: boolean;
    reason?: string;
    subscription?: any;
  }> {
    try {
      const result = await this.validateAccess({ client_id: clientId, user_email: userEmail, module });
      
      return {
        hasAccess: result.access_granted,
        reason: result.access_granted ? undefined : result.message,
        subscription: result.subscription_details
      };
    } catch (error: any) {
      return {
        hasAccess: false,
        reason: error.message || 'Validation failed'
      };
    }
  }

  async checkModuleAccess(clientId: string, userEmail: string, modules: string[]): Promise<{
    [module: string]: {
      hasAccess: boolean;
      reason?: string;
    };
  }> {
    const results: { [module: string]: { hasAccess: boolean; reason?: string } } = {};

    // Check each module
    for (const module of modules) {
      try {
        const validation = await this.validateAccess({ 
          client_id: clientId, 
          user_email: userEmail, 
          module 
        });
        
        results[module] = {
          hasAccess: validation.access_granted,
          reason: validation.access_granted ? undefined : validation.message
        };
      } catch (error: any) {
        results[module] = {
          hasAccess: false,
          reason: error.message || 'Validation failed'
        };
      }
    }

    return results;
  }

  // Log analysis helpers
  async getFailedSyncs(clientId?: string, limit = 10): Promise<HRMSLog[]> {
    const filters = { status: 'failed' as const, limit };
    
    if (clientId) {
      const response = await this.getHRMSLogs(clientId, filters);
      return response.logs || [];
    }
    
    // If no specific client, get from stats
    const stats = await this.getIntegrationStats();
    return stats.recent_failures.slice(0, limit);
  }

  async getRecentActivity(clientId: string, limit = 20): Promise<HRMSLog[]> {
    const response = await this.getHRMSLogs(clientId, { limit });
    return response.logs || [];
  }

  // Utility methods
  formatSyncStatus(log: HRMSLog): string {
    const statusMap = {
      success: '✅ Success',
      failed: '❌ Failed'
    };
    
    return statusMap[log.status] || log.status;
  }

  formatAction(action: string): string {
    const actionMap = {
      client_sync: 'Client Sync',
      subscription_sync: 'Subscription Sync',
      access_validation: 'Access Validation',
      webhook_user_login: 'User Login (Webhook)',
      webhook_module_access: 'Module Access (Webhook)',
      webhook_usage_report: 'Usage Report (Webhook)'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export const hrmsAPI = new HRMSAPI();