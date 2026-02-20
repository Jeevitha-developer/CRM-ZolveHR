// src/controllers/modules.controller.ts
import { Response }         from "express";
import * as modulesService  from "../services/modules.service";
import { success, error }   from "../utils/response";
import { AuthRequest }      from "../types";

export const getModules    = async (_r: AuthRequest, res: Response): Promise<void> => { try { success(res, { modules: await modulesService.getAll() }, "Modules fetched"); } catch (e: any) { error(res, e.message); } };
export const getModuleById = async (req: AuthRequest, res: Response): Promise<void> => { try { success(res, { module: await modulesService.getById(parseInt(req.params.id)) }, "Module fetched"); } catch (e: any) { error(res, e.message, 404); } };
export const createModule  = async (req: AuthRequest, res: Response): Promise<void> => { try { success(res, { module: await modulesService.create(req.body) }, "Module created", 201); } catch (e: any) { error(res, e.message, 400); } };
export const updateModule  = async (req: AuthRequest, res: Response): Promise<void> => { try { success(res, { module: await modulesService.update(parseInt(req.params.id), req.body) }, "Module updated"); } catch (e: any) { error(res, e.message, 400); } };
export const deleteModule  = async (req: AuthRequest, res: Response): Promise<void> => { try { await modulesService.remove(parseInt(req.params.id)); success(res, {}, "Module deleted"); } catch (e: any) { error(res, e.message, 400); } };
