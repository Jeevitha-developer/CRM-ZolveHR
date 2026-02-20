import { Response }           from "express";
import * as subsService       from "../services/subscriptions.service";
import { success, error }     from "../utils/response";
import { getPagination }      from "../utils/pagination";
import { AuthRequest, CreateSubscriptionBody } from "../types";

export const getSubscriptions   = async (req: AuthRequest, res: Response): Promise<void> => { try { const { limit, offset } = getPagination(req.query); const { rows, count } = await subsService.getAll({ limit, offset, client_id: req.query.client_id ? parseInt(req.query.client_id as string) : undefined, status: req.query.status as string }); success(res, { subscriptions: rows, total: count }, "Subscriptions fetched"); } catch (e: any) { error(res, e.message); } };
export const getSubscriptionById = async (req: AuthRequest, res: Response): Promise<void> => { try { const sub = await subsService.getById(parseInt(req.params.id)); success(res, { subscription: sub }, "Subscription fetched"); } catch (e: any) { error(res, e.message, 404); } };
export const createSubscription  = async (req: AuthRequest, res: Response): Promise<void> => { try { const sub = await subsService.create(req.body as CreateSubscriptionBody, req.user!.id); success(res, { subscription: sub }, "Subscription created", 201); } catch (e: any) { error(res, e.message, 400); } };
export const updateSubscription  = async (req: AuthRequest, res: Response): Promise<void> => { try { const sub = await subsService.update(parseInt(req.params.id), req.body); success(res, { subscription: sub }, "Subscription updated"); } catch (e: any) { error(res, e.message, 400); } };
export const cancelSubscription  = async (req: AuthRequest, res: Response): Promise<void> => { try { const sub = await subsService.cancel(parseInt(req.params.id)); success(res, { subscription: sub }, "Subscription cancelled"); } catch (e: any) { error(res, e.message, 400); } };
export const renewSubscription   = async (req: AuthRequest, res: Response): Promise<void> => { try { const sub = await subsService.renew(parseInt(req.params.id)); success(res, { subscription: sub }, "Subscription renewed"); } catch (e: any) { error(res, e.message, 400); } };
export const getStats            = async (_req: AuthRequest, res: Response): Promise<void> => { try { const stats = await subsService.getStats(); success(res, { stats }, "Stats fetched"); } catch (e: any) { error(res, e.message); } };
export const getHistory          = async (_req: AuthRequest, res: Response): Promise<void> => { success(res, { history: [] }, "History fetched"); };
