// API exports
export * from './config';
export * from './auth';
export * from './clients';
export * from './plans';
export * from './subscriptions';
export * from './hrms';

// Re-export all APIs for easy access
export { authAPI } from './auth';
export { clientAPI } from './clients';
export { planAPI } from './plans';
export { subscriptionAPI } from './subscriptions';
export { hrmsAPI } from './hrms';

// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Common API utilities
export const apiUtils = {
  // Format Indian currency
  formatINR: (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  },

  // Format date for Indian locale
  formatDate: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format datetime for Indian locale
  formatDateTime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Calculate days between dates
  daysBetween: (date1: string | Date, date2: string | Date): number => {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Get status color for UI
  getStatusColor: (status: string): string => {
    const colorMap: { [key: string]: string } = {
      active: 'green',
      inactive: 'gray',
      suspended: 'red',
      cancelled: 'red',
      expired: 'orange',
      paid: 'green',
      pending: 'yellow',
      overdue: 'red',
      failed: 'red',
      success: 'green',
    };
    return colorMap[status.toLowerCase()] || 'gray';
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (Indian format)
  isValidIndianPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  },

  // Validate GST number
  isValidGST: (gst: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  },

  // Validate PAN number
  isValidPAN: (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  },

  // Generate random ID (for temporary use)
  generateTempId: (): string => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Debounce function for search
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Retry function with exponential backoff
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },
};