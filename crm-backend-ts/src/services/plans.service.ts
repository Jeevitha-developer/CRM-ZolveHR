// src/services/plans.service.ts
import { Plan, Subscription } from "../models";
import { CreatePlanBody, PaginationParams } from "../types";

export const getAll = async ({ limit, offset, is_active }: PaginationParams & { is_active?: string }) => {
  const where: Partial<{ is_active: boolean }> = {};
  if (is_active !== undefined) where.is_active = is_active === "true";
  return Plan.findAndCountAll({ where, limit, offset, order: [["createdAt", "ASC"]] });
};

export const getById = async (id: number): Promise<Plan> => {
  const plan = await Plan.findByPk(id);
  if (!plan) throw new Error("Plan not found");
  return plan;
};

export const create = async (data: CreatePlanBody): Promise<Plan> => {
  if (!data.name || !data.price_inr) throw new Error("name and price_inr are required");
  return Plan.create(data as any);
};

export const update = async (id: number, data: Partial<CreatePlanBody>): Promise<Plan> => {
  const plan = await Plan.findByPk(id);
  if (!plan) throw new Error("Plan not found");
  return plan.update(data as any);
};

export const remove = async (id: number): Promise<void> => {
  const plan = await Plan.findByPk(id);
  if (!plan) throw new Error("Plan not found");
  const active = await Subscription.count({ where: { plan_id: id, subscription_status: "active" } });
  if (active > 0) throw new Error(`Cannot delete — ${active} active subscription(s) using this plan`);
  await plan.destroy();
};
