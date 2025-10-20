import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { ValidationError } from '../errors/validation.error';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle Prisma unique constraint violation
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    return res.status(409).json({
      type: 'https://example.com/probs/conflict',
      title: 'Conflict',
      status: 409,
      detail: 'A resource with the same properties already exists.',
      instance: req.path,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      type: err.type,
      title: err.message,
      status: err.status,
      detail: err.detail,
      instance: req.path,
      issues: err.issues,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      type: err.type,
      title: err.message,
      status: err.status,
      detail: err.detail,
      instance: req.path,
    });
  }

  // Log the error internally for debugging
  req.log.error(err, 'An unexpected error occurred');

  // Generic 500 error for unexpected issues
  return res.status(500).json({
    type: 'https://example.com/probs/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred on the server.',
    instance: req.path,
  });
};
