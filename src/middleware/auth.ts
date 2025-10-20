import { Request, Response, NextFunction } from 'express';

export const userAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    return res.status(401).json({
      type: 'https://example.com/probs/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'A user ID must be provided via the X-User-Id header.',
    });
  }

  req.userId = userId;
  next();
};
