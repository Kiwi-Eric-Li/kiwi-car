import { supabaseAdmin } from '@/config/supabase';
import logger from '@/utils/logger';

export async function cleanupOrphanedImages(): Promise<void> {
  try {
    // Find images uploaded more than 24 hours ago that aren't linked to a listing
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: orphans, error } = await supabaseAdmin
      .from('listing_images')
      .select('id, image_url')
      .is('listing_id', null)
      .lt('created_at', oneDayAgo);

    if (error) {
      logger.error('Failed to fetch orphaned images', { error });
      return;
    }

    if (!orphans || orphans.length === 0) {
      logger.debug('No orphaned images to clean up');
      return;
    }

    for (const orphan of orphans) {
      // Extract storage path from URL
      const urlParts = orphan.image_url.split('/storage/v1/object/public/listings/');
      if (urlParts.length === 2) {
        await supabaseAdmin.storage.from('listings').remove([urlParts[1]]);
      }

      await supabaseAdmin
        .from('listing_images')
        .delete()
        .eq('id', orphan.id);
    }

    logger.info(`Cleaned up ${orphans.length} orphaned images`);
  } catch (err) {
    logger.error('Cleanup job failed', { error: err });
  }
}

export async function archiveOldListings(): Promise<void> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('listings')
      .select('id')
      .in('status', ['SOLD', 'REMOVED'])
      .lt('updated_at', ninetyDaysAgo);

    if (error) {
      logger.error('Failed to fetch old listings', { error });
      return;
    }

    if (!data || data.length === 0) {
      logger.debug('No old listings to archive');
      return;
    }

    // For MVP, just log — archival strategy TBD
    logger.info(`Found ${data.length} listings older than 90 days that could be archived`);
  } catch (err) {
    logger.error('Archive job failed', { error: err });
  }
}
