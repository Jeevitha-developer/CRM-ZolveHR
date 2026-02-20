// src/controllers/clients.controller.ts
import { Response }           from "express";
import * as clientsService    from "../services/clients.service";
import { success, error }     from "../utils/response";
import { getPagination }      from "../utils/pagination";
import { AuthRequest, ClientStatus, CreateClientBody } from "../types";

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit, offset } = getPagination(req.query);
    const { rows, count }   = await clientsService.getAll({ limit, offset, status: req.query.status as string });
    success(res, { clients: rows, total: count }, "Clients fetched");
  } catch (err: any) { error(res, err.message); }
};

export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await clientsService.getById(parseInt(req.params.id));
    success(res, { client }, "Client fetched");
  } catch (err: any) { error(res, err.message, 404); }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await clientsService.create(req.body as CreateClientBody, req.user!.id);
    success(res, { client }, "Client created", 201);
  } catch (err: any) { error(res, err.message, 400); }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await clientsService.update(parseInt(req.params.id), req.body);
    success(res, { client }, "Client updated");
  } catch (err: any) { error(res, err.message, 400); }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await clientsService.remove(parseInt(req.params.id));
    success(res, {}, "Client deleted");
  } catch (err: any) { error(res, err.message, 400); }
};

export const updateClientStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const client = await clientsService.updateStatus(parseInt(req.params.id), req.body.status as ClientStatus);
    success(res, { client }, "Client status updated");
  } catch (err: any) { error(res, err.message, 400); }
};

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await clientsService.getStats();
    success(res, { stats }, "Stats fetched");
  } catch (err: any) { error(res, err.message); }
};
