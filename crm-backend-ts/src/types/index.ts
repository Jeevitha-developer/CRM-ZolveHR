// src/types/index.ts
import { Request } from "express";

// ─── Auth ─────────────────────────────────────────────────────
export interface JwtPayload {
  id:    number;
  email: string;
  role:  UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Enums ────────────────────────────────────────────────────
export type UserRole           = "admin" | "manager" | "user";
export type ClientStatus       = "active" | "inactive" | "suspended";
export type HrmsStatus         = "pending" | "active" | "inactive" | "suspended";
export type BillingCycle       = "monthly" | "quarterly" | "half_yearly" | "yearly";
export type BillingType        = "prepaid" | "postpaid";
export type OveragePolicy      = "hard_stop" | "charge_overage" | "notify_only";
export type PaymentStatus      = "paid" | "pending" | "failed" | "refunded";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "trial";
export type PaymentMethod      = "upi" | "bank_transfer" | "card" | "cash" | "razorpay";
export type CompanySize        = "1-10" | "11-50" | "51-200" | "201-500" | "500+";

// ─── Request Bodies ───────────────────────────────────────────
export interface RegisterBody {
  first_name: string;
  last_name:  string;
  email:      string;
  mobile:     string;
  password:   string;
  role?:      UserRole;
}

export interface LoginBody {
  email:    string;
  password: string;
}

export interface OtpBody {
  email: string;
  otp:   string;
}

export interface CreateClientBody {
  company_name:    string;
  contact_person?: string;
  email?:          string;
  phone?:          string;
  address?:        string;
  city?:           string;
  state?:          string;
  country?:        string;
  pincode?:        string;
  gst_number?:     string;
  pan_number?:     string;
  industry?:       string;
  company_size?:   CompanySize;
  status?:         ClientStatus;
  notes?:          string;
}

// ─── Fix 1: CreatePlanBody — updated for per-user pricing ─────
export interface CreatePlanBody {
  name:            string;
  description?:    string;
  price_per_user:  number;        // ← was price_inr ✅
  billing_cycle:   BillingCycle;
  billing_months:  number;        // ← required now ✅
  billing_type?:   BillingType;
  min_users?:      number;        // ← was base_user_limit ✅
  max_users:       number;
  overage_policy?: OveragePolicy;
  features?:       string[];
  module_access?:  Record<string, boolean>;
  is_active?:      boolean;
}

// ─── Fix 2: CreateSubscriptionBody — added missing fields ──────
export interface CreateSubscriptionBody {
  client_id:            number;
  plan_id:              number;
  num_users:            number;        // ← required ✅
  start_date?:          string;
  end_date?:            string;
  trial_ends_at?:       string;        // ← added ✅
  billing_cycle?:       BillingCycle;  // ← added ✅
  billing_months?:      number;        // ← added ✅
  amount_paid?:         number;        // ← added (auto-calculated) ✅
  discount?:            number;
  final_amount?:        number;        // ← added (auto-calculated) ✅
  payment_status?:      PaymentStatus;
  subscription_status?: SubscriptionStatus;
  auto_renew?:          boolean;
  remarks?:             string;
}

// ─── Fix 3: CreatePaymentBody — added missing fields ──────────
export interface CreatePaymentBody {
  subscription_id: number;
  client_id:       number;        // ← added ✅
  amount:          number;
  currency?:       string;        // ← added ✅
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  transaction_id?: string;
  receipt_number?: string;        // ← added ✅
  failure_reason?: string;        // ← added ✅
  payment_date?:   string;
  notes?:          string;
}

// ─── Pagination ───────────────────────────────────────────────
export interface PaginationParams {
  limit:  number;
  offset: number;
}

export interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  limit:      number;
  offset:     number;
  page:       number;
  totalPages: number;
}

// ─── HRMS Integration ─────────────────────────────────────────
export interface HrmsProvisionResult {
  db_name:        string;
  tenant_id:      string;
  admin_email:    string;
  temp_password:  string;
  hrms_login_url: string;
}

// ─── API Response ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
}