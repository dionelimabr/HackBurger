import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  pagination?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Sucesso',
  statusCode = 200,
  pagination?: unknown,
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  } as ApiResponse<T>);
}

export function sendCreated<T>(res: Response, data: T, message = 'Criado com sucesso'): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendError(
  res: Response,
  message = 'Erro interno',
  statusCode = 500,
  errors?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  } as ApiResponse);
}

export function sendNotFound(res: Response, message = 'Recurso não encontrado'): Response {
  return sendError(res, message, 404);
}

export function sendUnauthorized(res: Response, message = 'Não autorizado'): Response {
  return sendError(res, message, 401);
}

export function sendForbidden(res: Response, message = 'Acesso negado'): Response {
  return sendError(res, message, 403);
}

export function sendBadRequest(res: Response, message = 'Requisição inválida', errors?: unknown): Response {
  return sendError(res, message, 400, errors);
}
