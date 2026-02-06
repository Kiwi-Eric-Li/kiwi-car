import { supabaseAdmin } from '@/config/supabase';
import logger from '@/utils/logger';

export async function checkPriceAlerts(): Promise<void> {
  try {
    // Get listings with price changes in the last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    const { data: priceChanges, error: priceError } = await supabaseAdmin
      .from('price_history')
      .select('*, listings(*)')
      .gte('changed_at', oneHourAgo);

    if (priceError) {
      logger.error('Failed to fetch price changes', { error: priceError });
      return;
    }

    if (!priceChanges || priceChanges.length === 0) {
      logger.debug('No price changes in the last hour');
      return;
    }

    // For each price change, find users with matching alerts
    for (const change of priceChanges) {
      const { data: alerts, error: alertError } = await supabaseAdmin
        .from('favorites')
        .select('*, profiles(*)')
        .eq('listing_id', change.listing_id)
        .eq('price_alert', true);

      if (alertError) {
        logger.error('Failed to fetch alerts for listing', {
          listingId: change.listing_id,
          error: alertError,
        });
        continue;
      }

      for (const alert of alerts ?? []) {
        // Check if new price meets the target
        if (alert.target_price && change.price <= alert.target_price) {
          logger.info('Price alert triggered', {
            userId: alert.user_id,
            listingId: change.listing_id,
            newPrice: change.price,
            targetPrice: alert.target_price,
          });
          // Email notification would be sent here in a future iteration
        }
      }
    }

    logger.info(`Processed ${priceChanges.length} price changes`);
  } catch (err) {
    logger.error('Price alert job failed', { error: err });
  }
}
