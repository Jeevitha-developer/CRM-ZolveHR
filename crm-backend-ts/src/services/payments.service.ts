// src/services/payments.service.ts
import { Payment, Subscription, Client } from "../models";
import { CreatePaymentBody, PaginationParams } from "../types";

export const getAll = async ({ limit, offset, client_id }: PaginationParams & { client_id?: number }) => {
  const where: Record<string, unknown> = {};
  if (client_id) where.client_id = client_id;
  return Payment.findAndCountAll({
    where, limit, offset, order: [["createdAt","DESC"]],
    include: [{ model: Client, as: "client", attributes: ["id","company_name"] }],
  });
};

export const create = async (data: CreatePaymentBody, userId: number): Promise<Payment> => {
  const sub = await Subscription.findByPk(data.subscription_id);
  if (!sub) throw new Error("Subscription not found");
  const payment = await Payment.create({ ...data, client_id: sub.client_id, created_by: userId } as any);
  if (data.payment_status === "paid") await sub.update({ payment_status: "paid", subscription_status: "active" });
  return payment;
};

export const update = async (id: number, data: Partial<CreatePaymentBody>): Promise<Payment> => {
  const payment = await Payment.findByPk(id);
  if (!payment) throw new Error("Payment not found");
  return payment.update(data as any);
};
