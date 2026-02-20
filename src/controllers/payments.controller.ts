// src/controllers/payments.controller.ts
import { Response }           from "express";
import * as paymentsService   from "../services/payments.service";
import { success, error }     from "../utils/response";
import { getPagination }      from "../utils/pagination";
import { AuthRequest, CreatePaymentBody } from "../types";

export const getPayments   = async (req: AuthRequest, res: Response): Promise<void> => { try { const { limit, offset } = getPagination(req.query); const { rows, count } = await paymentsService.getAll({ limit, offset, client_id: req.query.client_id ? parseInt(req.query.client_id as string) : undefined }); success(res, { payments: rows, total: count }, "Payments fetched"); } catch (e: any) { error(res, e.message); } };
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => { try { success(res, { payment: await paymentsService.create(req.body as CreatePaymentBody, req.user!.id) }, "Payment recorded", 201); } catch (e: any) { error(res, e.message, 400); } };
export const updatePayment = async (req: AuthRequest, res: Response): Promise<void> => { try { success(res, { payment: await paymentsService.update(parseInt(req.params.id), req.body) }, "Payment updated"); } catch (e: any) { error(res, e.message, 400); } };
