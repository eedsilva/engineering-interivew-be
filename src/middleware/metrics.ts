import { Request, Response, NextFunction } from 'express';
import { httpRequestCounter } from '../utils/metrics';

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // By listening to the 'finish' event, we ensure this code runs after the response has been sent,
  // so we have access to the final status code.
  res.on('finish', () => {
    // Use the Express route pattern (e.g., '/tasks/:id') instead of the raw path (e.g., '/tasks/123')
    // to avoid creating a unique metric label for every possible ID, which would lead to high cardinality.
    const route = req.route ? req.route.path : req.path;

    // Increment the counter for each request, labeling it with the method, route, and status code.
    // This provides rich, queryable data for monitoring and alerting.
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode,
    });
  });
  next();
};
