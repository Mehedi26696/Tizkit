// Billing and Credits types

export type PlanType = 'FREE' | 'PRO' | 'TEAM';
export type ServiceType = 
  | 'OCR_TEXT_EXTRACTION' 
  | 'LATEX_COMPILATION' 
  | 'AI_TEXT_IMPROVEMENT' 
  | 'AI_LATEX_FIXING' 
  | 'DIAGRAM_GENERATION' 
  | 'TABLE_GENERATION';
export type TransactionType = 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS' | 'DAILY_RESET';

export interface CreditsInfo {
  total_credits: number;
  available_credits: number;
  used_credits: number;
  daily_credits: number;
  purchased_credits: number;
  is_unlimited: boolean;
  plan_type: PlanType;
  last_daily_reset: string | null;
}

export interface CreditTransaction {
  id: string;
  transaction_type: TransactionType;
  service_type: ServiceType | null;
  credits_amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export interface ServicePricing {
  service_type: ServiceType;
  credit_cost: number;
  description: string | null;
}

export interface ServiceAvailability {
  can_use: boolean;
  credits_required: number;
  credits_available: number;
  is_unlimited: boolean;
  message: string;
}

export interface Subscription {
  id: string;
  plan_type: PlanType;
  is_active: boolean;
  started_at: string;
  expires_at: string | null;
}

export interface CreateSubscriptionRequest {
  plan_type: PlanType;
  billing_period: 'monthly' | 'yearly';
  payment_method_id?: string;
}

export interface ConsumeCreditsRequest {
  service_type: ServiceType;
  extra_data?: Record<string, any>;
}

export interface AddCreditsRequest {
  amount: number;
  transaction_type?: TransactionType;
  description?: string;
}
