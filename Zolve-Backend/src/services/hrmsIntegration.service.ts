// src/services/hrmsIntegration.service.ts
import axios              from "axios";
import env                from "../config/env";
import { Plan, Client }   from "../models";
import { HrmsProvisionResult } from "../types";

const headers = { "x-api-key": env.HRMS_API_KEY, "Content-Type": "application/json" };

export const provisionTenant = async (client: Client, plan: Plan): Promise<HrmsProvisionResult> => {
  const modules = Object.entries(plan.module_access)
    .filter(([, v]) => v).map(([k]) => k);
  const res = await axios.post(`${env.HRMS_URL}/api/provision/create-tenant`, {
    company_name: client.company_name,
    admin_email:  client.email,
    plan:         plan.name,
    max_users:    plan.max_users,
    modules,
  }, { headers });
  return res.data as HrmsProvisionResult;
};

export const deactivateTenant = async (db_name: string): Promise<void> => {
  await axios.post(`${env.HRMS_URL}/api/provision/deactivate`, { db_name }, { headers });
};

export const reactivateTenant = async (db_name: string, plan: Plan): Promise<void> => {
  const modules = Object.entries(plan.module_access)
    .filter(([, v]) => v).map(([k]) => k);
  await axios.post(`${env.HRMS_URL}/api/provision/reactivate`, {
    db_name, max_users: plan.max_users, modules,
  }, { headers });
};
