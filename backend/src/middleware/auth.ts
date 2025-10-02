import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnv } from '../utils/env';

export type JwtUser = { id: number; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

const env = getEnv();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined);

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    req.user = { id: (payload as any).id, email: (payload as any).email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}


