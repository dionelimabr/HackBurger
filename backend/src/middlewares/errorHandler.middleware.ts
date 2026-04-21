import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';
import { awardChallenge } from '../utils/challenge.util';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message    = err.isOperational ? err.message : 'Erro interno do servidor';

  if (env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  // CTF: Error Handling challenge — the user triggered an uncaught
  // (non-operational) error and received a full stack trace in the response.
  if (!err.isOperational && err.stack) {
    awardChallenge(req, 'errorHandlingChallenge');
  }

  sendError(res, message, statusCode, env.NODE_ENV !== 'production' ? err.stack : undefined);
}

export function createError(message: string, statusCode = 500): AppError {
  const err: AppError = new Error(message);
  err.statusCode    = statusCode;
  err.isOperational = true;
  return err;
}
