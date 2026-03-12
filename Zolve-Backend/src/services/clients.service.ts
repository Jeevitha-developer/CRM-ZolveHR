// src/services/clients.service.ts
import { Client, Subscription } from "../models";
import { CreateClientBody, ClientStatus, PaginationParams } from "../types";

export const getAll = async ({ limit, offset, status }: PaginationParams & { status?: string }) => {
  const where: Partial<{ status: ClientStatus }> = {};
  if (status) where.status = status as ClientStatus;
  return Client.findAndCountAll({ where, limit, offset, order: [["createdAt", "DESC"]] });
};

export const getById = async (id: number): Promise<Client> => {
  const client = await Client.findByPk(id, { include: [{ model: Subscription, as: "subscriptions" }] });
  if (!client) throw new Error("Client not found");
  return client;
};

export const create = async (data: CreateClientBody, userId: number): Promise<Client> => {
  if (!data.company_name) throw new Error("company_name is required");
  if (data.email) {
    const exists = await Client.findOne({ where: { email: data.email } });
    if (exists) throw new Error("A client with this email already exists");
  }
  return Client.create({ ...data, created_by: userId });
};

export const update = async (id: number, data: Partial<CreateClientBody>): Promise<Client> => {
  const client = await Client.findByPk(id);
  if (!client) throw new Error("Client not found");
  if (data.email && data.email !== client.email) {
    const exists = await Client.findOne({ where: { email: data.email } });
    if (exists) throw new Error("Email already in use by another client");
  }
  return client.update(data);
};

export const remove = async (id: number): Promise<void> => {
  const client = await Client.findByPk(id);
  if (!client) throw new Error("Client not found");
  const active = await Subscription.count({ where: { client_id: id, subscription_status: "active" } });
  if (active > 0) throw new Error(`Cannot delete — ${active} active subscription(s) exist`);
  await client.destroy();
};

export const updateStatus = async (id: number, status: ClientStatus): Promise<Client> => {
  const client = await Client.findByPk(id);
  if (!client) throw new Error("Client not found");
  return client.update({ status });
};

export const getStats = async () => {
  const [total, active, inactive, suspended] = await Promise.all([
    Client.count(),
    Client.count({ where: { status: "active"    } }),
    Client.count({ where: { status: "inactive"  } }),
    Client.count({ where: { status: "suspended" } }),
  ]);
  return { total, active, inactive, suspended };
};
