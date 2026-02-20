// src/services/modules.service.ts
import { PackageModule } from "../models";

export const getAll    = () => PackageModule.findAll({ where: { is_active: true }, order: [["name","ASC"]] });
export const getById   = async (id: number) => { const m = await PackageModule.findByPk(id); if (!m) throw new Error("Module not found"); return m; };
export const create    = (data: { name: string; description?: string }) => PackageModule.create(data);
export const update    = async (id: number, data: Partial<{ name: string; description: string; is_active: boolean }>) => { const m = await getById(id); return m.update(data); };
export const remove    = async (id: number) => { const m = await getById(id); await m.destroy(); };
