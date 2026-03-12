import { Response } from "express";

export const success = (
  res: Response,
  data: Record<string, unknown> = {},
  message = "Success",
  statusCode = 200
): Response =>
  res.status(statusCode).json({ success: true, message, ...data });

export const error = (
  res: Response,
  message = "Something went wrong",
  statusCode = 500
): Response =>
  res.status(statusCode).json({ success: false, message });
