import { ZodError } from 'zod';
import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ValidationError', details: err.flatten() });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'UniqueConstraintViolation', meta: err.meta });
  }

  return res.status(500).json({ error: 'InternalServerError' });
}


