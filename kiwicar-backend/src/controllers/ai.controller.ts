import { Request, Response, NextFunction } from 'express';
import { generateDescription, getPriceEstimate } from '@/services/ai.service';

export async function generateDescriptionHandler(req: Request, res: Response, _next: NextFunction) {
  const description = await generateDescription(req.body);
  res.json({ description });
}

export async function getPriceEstimateHandler(req: Request, res: Response, _next: NextFunction) {
  const estimate = await getPriceEstimate(req.query as any);
  res.json(estimate);
}
