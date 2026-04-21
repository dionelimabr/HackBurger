import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendBadRequest } from '../utils/response.util';

type SchemaMap = {
  body?:  Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
};

export function validate(schemas: SchemaMap) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const [key, schema] of Object.entries(schemas) as [keyof SchemaMap, Joi.Schema][]) {
      const { error } = schema.validate((req as unknown as Record<string, unknown>)[key], {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(...error.details.map(d => d.message));
      }
    }

    if (errors.length > 0) {
      sendBadRequest(res, 'Dados inválidos', errors);
      return;
    }

    next();
  };
}
