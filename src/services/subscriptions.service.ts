import { Subscription, Client, Plan } from "../models";
import { CreateSubscriptionBody, BillingCycle, PaginationParams } from "../types";

// ─── Helper: Billing months map ───────────────────────────────
const BILLING_MONTHS: Record<BillingCycle, number> = {
  monthly:     1,
  quarterly:   3,
  half_yearly: 6,
  yearly:      12,
};

// ─── Helper: Calculate end date ───────────────────────────────
const calcEndDate = (startDate: string, billingCycle: BillingCycle): string => {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + (BILLING_MONTHS[billingCycle] || 3));
  return d.toISOString().split("T")[0];
};

// ─── Helper: Calculate final amount ───────────────────────────
const calcFinalAmount = (
  pricePerUser: number,
  numUsers:     number,
  months:       number,
  discount:     number = 0
): number => {
  // final_amount = price_per_user × num_users × billing_months - discount
  return (pricePerUser * numUsers * months) - discount;
};

// ─── Get All ──────────────────────────────────────────────────
export const getAll = async ({
  limit, offset, client_id, status,
}: PaginationParams & { client_id?: number; status?: string }) => {
  const where: Record<string, unknown> = {};
  if (client_id) where.client_id          = client_id;
  if (status)    where.subscription_status = status;

  return Subscription.findAndCountAll({
    where, limit, offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Client, as: "client", attributes: ["id", "company_name", "email"] },
      { model: Plan,   as: "plan",   attributes: ["id", "name", "price_per_user", "billing_cycle", "billing_months"] },
    ],
  });
};

// ─── Get By ID ────────────────────────────────────────────────
export const getById = async (id: number): Promise<Subscription> => {
  const sub = await Subscription.findByPk(id, {
    include: [
      { model: Client, as: "client" },
      { model: Plan,   as: "plan"   },
    ],
  });
  if (!sub) throw new Error("Subscription not found");
  return sub;
};

// ─── Create ───────────────────────────────────────────────────
export const create = async (
  data:   CreateSubscriptionBody,
  userId: number
): Promise<Subscription> => {

  // 1. Validate client
  const client = await Client.findByPk(data.client_id);
  if (!client) throw new Error("Client not found");

  // 2. Validate plan
  const plan = await Plan.findByPk(data.plan_id);
  if (!plan) throw new Error("Plan not found");
  if (!plan.is_active) throw new Error("Selected plan is not active");

  // 3. Validate num_users
  const num_users = data.num_users;
  if (!num_users) throw new Error("num_users is required");
  if (num_users < plan.min_users)
    throw new Error(`Minimum ${plan.min_users} users required for ${plan.name} plan`);
  if (num_users > plan.max_users)
    throw new Error(`Maximum ${plan.max_users} users allowed for ${plan.name} plan`);

  // 4. Calculate dates
  const start_date = data.start_date || new Date().toISOString().split("T")[0];
  const end_date   = data.end_date   || calcEndDate(start_date, plan.billing_cycle);

  // 5. Auto-calculate amount
  // final_amount = price_per_user × num_users × billing_months - discount
  const discount     = data.discount || 0;
  const amount_paid  = plan.price_per_user * num_users * plan.billing_months;
  const final_amount = calcFinalAmount(plan.price_per_user, num_users, plan.billing_months, discount);

  console.log(`💰 Amount Calculation:
    price_per_user : ₹${plan.price_per_user}
    num_users      : ${num_users}
    billing_months : ${plan.billing_months}
    discount       : ₹${discount}
    amount_paid    : ₹${amount_paid}
    final_amount   : ₹${final_amount}
  `);

  // 6. Create subscription
  return Subscription.create({
    ...data,
    start_date,
    end_date,
    billing_cycle:  plan.billing_cycle,
    billing_months: plan.billing_months,
    num_users,
    amount_paid,
    discount,
    final_amount,
    subscription_status: data.subscription_status || "active",
    payment_status:      data.payment_status      || "pending",
    created_by:          userId,
  } as any);
};

// ─── Update ───────────────────────────────────────────────────
export const update = async (
  id:   number,
  data: Partial<CreateSubscriptionBody>
): Promise<Subscription> => {
  const sub = await Subscription.findByPk(id, {
    include: [{ model: Plan, as: "plan" }],
  });
  if (!sub) throw new Error("Subscription not found");

  // Recalculate if num_users or discount changed
  const plan      = (sub as any).plan;
  const num_users = data.num_users  || sub.num_users;
  const discount  = data.discount   || sub.discount  || 0;

  if (data.num_users || data.discount) {
    if (num_users < plan.min_users)
      throw new Error(`Minimum ${plan.min_users} users required for ${plan.name} plan`);
    if (num_users > plan.max_users)
      throw new Error(`Maximum ${plan.max_users} users allowed for ${plan.name} plan`);

    data.amount_paid  = plan.price_per_user * num_users * plan.billing_months;
    data.final_amount = calcFinalAmount(plan.price_per_user, num_users, plan.billing_months, discount);
  }

  return sub.update(data as any);
};

// ─── Cancel ───────────────────────────────────────────────────
export const cancel = async (id: number): Promise<Subscription> => {
  const sub = await Subscription.findByPk(id);
  if (!sub) throw new Error("Subscription not found");
  if (sub.subscription_status === "cancelled")
    throw new Error("Subscription is already cancelled");
  return sub.update({ subscription_status: "cancelled" });
};

// ─── Renew ────────────────────────────────────────────────────
export const renew = async (id: number): Promise<Subscription> => {
  const sub = await Subscription.findByPk(id, {
    include: [{ model: Plan, as: "plan" }],
  });
  if (!sub) throw new Error("Subscription not found");
  if (sub.subscription_status === "cancelled")
    throw new Error("Cannot renew a cancelled subscription");

  const plan      = (sub as any).plan;
  const num_users = sub.num_users;

  // New end date starts from current end date
  const new_end_date   = calcEndDate(sub.end_date, sub.billing_cycle as BillingCycle);

  // Recalculate amount for renewal
  const amount_paid  = plan.price_per_user * num_users * plan.billing_months;
  const final_amount = calcFinalAmount(plan.price_per_user, num_users, plan.billing_months, 0);

  console.log(`🔄 Renewal Calculation:
    plan           : ${plan.name}
    num_users      : ${num_users}
    new_end_date   : ${new_end_date}
    amount_paid    : ₹${amount_paid}
    final_amount   : ₹${final_amount}
  `);

  return sub.update({
    end_date:            new_end_date,
    subscription_status: "active",
    payment_status:      "pending", // ← pending until payment is recorded
    amount_paid,
    final_amount,
  });
};

// ─── Stats ────────────────────────────────────────────────────
export const getStats = async () => {
  const [total, active, expired, cancelled, trial, paid, pending, failed] = await Promise.all([
    Subscription.count(),
    Subscription.count({ where: { subscription_status: "active"    } }),
    Subscription.count({ where: { subscription_status: "expired"   } }),
    Subscription.count({ where: { subscription_status: "cancelled" } }),
    Subscription.count({ where: { subscription_status: "trial"     } }),
    Subscription.count({ where: { payment_status: "paid"    } }),
    Subscription.count({ where: { payment_status: "pending" } }),
    Subscription.count({ where: { payment_status: "failed"  } }),
  ]);

  return {
    total, active, expired, cancelled, trial,
    payments: { paid, pending, failed },
  };
};