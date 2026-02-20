// src/controllers/plans.controller.ts
import { Response }         from "express";
import * as plansService    from "../services/plans.service";
import { success, error }   from "../utils/response";
import { getPagination }    from "../utils/pagination";
import { AuthRequest, CreatePlanBody } from "../types";

export const getPlans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit, offset } = getPagination(req.query);
    const { rows, count }   = await plansService.getAll({ limit, offset, is_active: req.query.is_active as string });
    success(res, { plans: rows, total: count }, "Plans fetched");
  } catch (err: any) { error(res, err.message); }
};

export const getPlanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await plansService.getById(parseInt(req.params.id));
    success(res, { plan }, "Plan fetched");
  } catch (err: any) { error(res, err.message, 404); }
};

export const createPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await plansService.create(req.body as CreatePlanBody);
    success(res, { plan }, "Plan created", 201);
  } catch (err: any) { error(res, err.message, 400); }
};

export const updatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await plansService.update(parseInt(req.params.id), req.body);
    success(res, { plan }, "Plan updated");
  } catch (err: any) { error(res, err.message, 400); }
};

export const deletePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await plansService.remove(parseInt(req.params.id));
    success(res, {}, "Plan deleted");
  } catch (err: any) { error(res, err.message, 400); }
};
