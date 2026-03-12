import { Request, Response, NextFunction } from "express";
import { Sequelize, QueryTypes } from "sequelize";
import { getTenantDB } from "../config/tenantconnection.js";

interface TenantDB {
  sequelize: Sequelize;
  query: (sql: string, paramsOrOptions?: any) => Promise<any>;
  transaction: () => Promise<any>;
}

export interface TenantRequest extends Request {
  tenant?: string;
  db?: TenantDB;
}

const QUERY_TYPE_MAP: Record<string, QueryTypes> = {
  SELECT: QueryTypes.SELECT,
  INSERT: QueryTypes.INSERT,
  UPDATE: QueryTypes.UPDATE,
  DELETE: QueryTypes.DELETE,
};

function detectQueryType(sql: string): QueryTypes {
  const first = sql.trim().split(/\s+/)[0].toUpperCase();
  return QUERY_TYPE_MAP[first] || QueryTypes.SELECT;
}

function buildNamedSql(
  sql: string,
  params: any[] = []
): { namedSql: string; replacements: Record<string, any> } {
  const replacements: Record<string, any> = {};
  let i = 0;

  const namedSql = sql.replace(/\?/g, () => {
    const key = `p${i}`;
    replacements[key] = params[i];
    i++;
    return `:${key}`;
  });

  return { namedSql, replacements };
}

export function tenantMiddleware(
  req: TenantRequest,
  res: Response,
  next: NextFunction
): void {

  const { tenant } = req.params;

  if (!tenant) {
    res.status(400).json({ error: "Tenant is required in URL" });
    return;
  }

  try {

    const sequelize = getTenantDB(tenant);

    req.tenant = tenant;

    req.db = {
      sequelize,

      query: async (sql: string, paramsOrOptions: any = []) => {

        if (
          typeof paramsOrOptions === "object" &&
          !Array.isArray(paramsOrOptions) &&
          paramsOrOptions.replacements
        ) {
          return sequelize.query(sql, paramsOrOptions);
        }

        const params = Array.isArray(paramsOrOptions) ? paramsOrOptions : [];

        const { namedSql, replacements } = buildNamedSql(sql, params);

        const type = detectQueryType(sql);

        const result = await sequelize.query(namedSql, {
          replacements,
          type,
        });

        if (type === QueryTypes.SELECT) {
          return [result, []];
        }

        return [result[0] ?? result, result[1] ?? []];
      },

      transaction: async () => {

        const t = await sequelize.transaction();

        return {
          query: async (sql: string, params: any[] = []) => {

            const { namedSql, replacements } = buildNamedSql(sql, params);

            const type = detectQueryType(sql);

            const result = await sequelize.query(namedSql, {
              replacements,
              type,
              transaction: t,
            });

            if (type === QueryTypes.SELECT) {
              return [result, []];
            }

            return [result[0] ?? result, result[1] ?? []];
          },

          commit: async () => t.commit(),
          rollback: async () => t.rollback(),
        };
      },
    };

    next();

  } catch (err) {
    console.error("Tenant middleware error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
}