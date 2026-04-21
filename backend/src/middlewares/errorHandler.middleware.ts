import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message    = err.isOperational ? err.message : 'Erro interno do servidor';

  if (env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  sendError(res, message, statusCode, env.NODE_ENV !== 'production' ? err.stack : undefined);
}

export function createError(message: string, statusCode = 500): AppError {
  const err: AppError = new Error(message);
  err.statusCode    = statusCode;
  err.isOperational = true;
  return err;
}
