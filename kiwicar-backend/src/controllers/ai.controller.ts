import { Request, Response, NextFunction } from 'express';
import { generateDescription, getPriceScore } from '@/services/ai.service';

export async function generateDescriptionHandler(req: Request, res: Response, _next: NextFunction) {
  const description = await generateDescription(req.body);
  res.json({ description });
}

export async function getPriceScoreHandler(req: Request, res: Response, _next: NextFunction) {
  const result = await getPriceScore(req.body);
  res.json({ data: result });
}
