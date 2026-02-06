import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.issues,
        },
      });
      return;
    }

    // Replace parsed values back onto request
    const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) Object.defineProperty(req, 'query', { value: parsed.query, configurable: true });
    if (parsed.params) Object.defineProperty(req, 'params', { value: parsed.params, configurable: true });

    next();
  };
}
