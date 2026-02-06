import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/config/supabase';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/errors';
import * as storageService from '@/services/storage.service';

export async function uploadImages(req: Request, res: Response, _next: NextFunction) {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new BadRequestError('At least one image is required');
  }

  const tempListingId = uuidv4(); // temporary grouping ID for storage path
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageUrl = await storageService.uploadListingImage(file.buffer, file.mimetype, tempListingId);

    // Insert into listing_images with listing_id = null (will be linked later)
    const { data, error } = await supabaseAdmin
      .from('listing_images')
      .insert({
        listing_id: null,
        image_url: imageUrl,
        order: i,
      })
      .select('id')
      .single();

    if (error) throw error;

    results.push({
      id: data.id,
      url: imageUrl,
      thumbnailUrl: imageUrl, // same as main URL for MVP
    });
  }

  res.json({ images: results });
}

export async function deleteImage(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;
  const userId = req.user!.id;

  // Get the image record
  const { data: image, error } = await supabaseAdmin
    .from('listing_images')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !image) {
    throw new NotFoundError('Image not found');
  }

  // If linked to a listing, verify ownership
  if (image.listing_id) {
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('user_id')
      .eq('id', image.listing_id)
      .single();

    if (listing && listing.user_id !== userId) {
      throw new ForbiddenError('You do not own this image');
    }
  }

  // Delete from storage
  const urlParts = image.image_url.split('/storage/v1/object/public/listings/');
  if (urlParts.length === 2) {
    await storageService.deleteImage('listings', urlParts[1]);
  }

  // Delete from database
  await supabaseAdmin
    .from('listing_images')
    .delete()
    .eq('id', id);

  res.status(204).send();
}
