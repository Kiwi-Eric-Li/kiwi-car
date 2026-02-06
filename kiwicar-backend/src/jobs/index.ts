import cron from 'node-cron';
import { checkPriceAlerts } from './priceAlerts.job';
import { cleanupOrphanedImages, archiveOldListings } from './cleanup.job';
import logger from '@/utils/logger';

export function registerJobs(): void {
  // Price alert check — every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running price alert check...');
    await checkPriceAlerts();
  });

  // Cleanup orphaned images — daily at 3am
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running cleanup jobs...');
    await cleanupOrphanedImages();
    await archiveOldListings();
  });

  logger.info('Background jobs registered');
}
