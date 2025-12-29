// Billing API functions

import apiClient from './client';
import type { 
  CreditsInfo, 
  CreditTransaction, 
  ServicePricing, 
  ServiceAvailability,
  Subscription,
  CreateSubscriptionRequest,
  ConsumeCreditsRequest,
  AddCreditsRequest,
  ServiceType
} from '@/types/billing';

/**
 * Get current user's credits and subscription info
 */
export async function getCredits(): Promise<CreditsInfo> {
  const response = await apiClient.get<CreditsInfo>('/credits/credits');
  return response.data;
}

/**
 * Check if user can use a specific service
 */
export async function checkServiceAvailability(serviceType: ServiceType): Promise<ServiceAvailability> {
  const response = await apiClient.post<ServiceAvailability>('/credits/credits/check', null, {
    params: { service_type: serviceType }
  });
  return response.data;
}

/**
 * Consume credits for a service
 */
export async function consumeCredits(request: ConsumeCreditsRequest): Promise<{ success: boolean; remaining_credits: number }> {
  const response = await apiClient.post('/credits/credits/consume', request);
  return response.data;
}

/**
 * Add credits to user account
 */
export async function addCredits(request: AddCreditsRequest): Promise<{ success: boolean; new_balance: number }> {
  const response = await apiClient.post('/credits/credits/add', request);
  return response.data;
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(limit: number = 50, offset: number = 0): Promise<CreditTransaction[]> {
  const response = await apiClient.get<CreditTransaction[]>('/credits/credits/history', {
    params: { limit, offset }
  });
  return response.data;
}

/**
 * Get pricing for all services
 */
export async function getServicePricing(): Promise<ServicePricing[]> {
  const response = await apiClient.get<ServicePricing[]>('/credits/pricing');
  return response.data;
}

/**
 * Create or update subscription
 */
export async function createSubscription(request: CreateSubscriptionRequest): Promise<{
  success: boolean;
  subscription_id: string;
  plan_type: string;
  expires_at: string | null;
}> {
  const response = await apiClient.post('/credits/subscription', request);
  return response.data;
}
