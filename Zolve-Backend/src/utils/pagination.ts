// src/utils/pagination.ts
import { ParsedQs } from "qs";
import { PaginationParams, PaginatedResult } from "../types";

export const getPagination = (query: ParsedQs): PaginationParams => ({
  limit:  Math.min(parseInt(query.limit  as string) || 20, 100),
  offset: parseInt(query.offset as string) || 0,
});

export const paginate = <T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResult<T> => ({
  data,
  total,
  limit,
  offset,
  page:       Math.floor(offset / limit) + 1,
  totalPages: Math.ceil(total / limit),
});
