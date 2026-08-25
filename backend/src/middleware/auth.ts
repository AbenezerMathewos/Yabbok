import { Request, Response, NextFunction } from 'express';
import { getToken } from 'next-auth/jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("FATAL: NEXTAUTH_SECRET environment variable is not set.");
      return res.status(500).json({ error: "Server misconfiguration" });
    }
    const token = await getToken({ req, secret });

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No valid session found' });
    }

    req.user = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal Server Error in authentication' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
