import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { RATE_LIMITS } from '@/config/constants';
import { RateLimitError } from '@/utils/errors';
import { lookupVehicle } from '@/services/nzta.service';

export async function lookupVehicleHandler(req: Request, res: Response, _next: NextFunction) {
  const plateNumber = req.params.plateNumber as string;
  const userId = req.user?.id;

  // Authenticated user quota check
  if (userId) {
    const { data: quota } = await supabaseAdmin
      .from('lookup_quotas')
      .select('*')
      .eq('user_id', userId)
      .single();

    const now = new Date();
    const maxPerDay = RATE_LIMITS.VEHICLE_LOOKUP_AUTH.perDay;

    if (quota) {
      const resetAt = new Date(quota.reset_at);

      if (now >= resetAt) {
        // Reset the counter
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        await supabaseAdmin
          .from('lookup_quotas')
          .update({ count: 1, reset_at: tomorrow })
          .eq('user_id', userId);
      } else if (quota.count >= maxPerDay) {
        throw new RateLimitError('Daily lookup limit reached. Please try again tomorrow.');
      } else {
        await supabaseAdmin
          .from('lookup_quotas')
          .update({ count: quota.count + 1 })
          .eq('user_id', userId);
      }
    } else {
      // First lookup — create quota record
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('lookup_quotas')
        .insert({ user_id: userId, count: 1, reset_at: tomorrow });
    }
  }
  // Guest rate limiting is handled by express-rate-limit middleware on the route

  const result = await lookupVehicle(plateNumber);
  res.json(result);
}
