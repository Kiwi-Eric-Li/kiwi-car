import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { BadRequestError } from '@/utils/errors';
import type { ListingRow, ListingImageRow } from '@/types';

export async function getFavorites(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('*, listings(*, listing_images(id, image_url, "order"))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const favorites = (data ?? []).map((fav: any) => {
    const listing = fav.listings as ListingRow & { listing_images: ListingImageRow[] };
    const images = listing?.listing_images ?? [];
    const cover = images.find((img) => img.order === 0);
    const coverImage = cover?.image_url ?? images[0]?.image_url ?? null;

    return {
      id: fav.id,
      listingId: fav.listing_id,
      listing: listing ? {
        id: listing.id,
        title: `${listing.year} ${listing.make} ${listing.model}`,
        price: listing.price,
        coverImage,
        status: listing.status,
      } : null,
      priceAlert: fav.price_alert,
      targetPrice: fav.target_price,
      createdAt: fav.created_at,
    };
  });

  res.json({ data: favorites });
}

export async function addFavorite(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const { listingId, priceAlert, targetPrice } = req.body;

  const { error } = await supabaseAdmin
    .from('favorites')
    .insert({
      user_id: userId,
      listing_id: listingId,
      price_alert: priceAlert ?? false,
      target_price: targetPrice ?? null,
    });

  if (error) {
    if (error.code === '23505') {
      throw new BadRequestError('Already in favorites');
    }
    throw error;
  }

  res.status(201).json({ message: 'Added to favorites' });
}

export async function removeFavorite(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const { listingId } = req.params;

  await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId);

  res.status(204).send();
}

export async function updateAlert(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const { listingId } = req.params;
  const { priceAlert, targetPrice } = req.body;

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .update({
      price_alert: priceAlert,
      target_price: targetPrice ?? null,
    })
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .select('*')
    .single();

  if (error || !data) throw error || new BadRequestError('Favorite not found');

  res.json({
    id: data.id,
    listingId: data.listing_id,
    priceAlert: data.price_alert,
    targetPrice: data.target_price,
  });
}

export async function getAlerts(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;

  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('*, listings(id, make, model, year, price, status, listing_images(image_url, "order"))')
    .eq('user_id', userId)
    .eq('price_alert', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const alerts = (data ?? []).map((fav: any) => {
    const listing = fav.listings;
    const images = listing?.listing_images ?? [];
    const cover = images.find((img: any) => img.order === 0);

    return {
      id: fav.id,
      listingId: fav.listing_id,
      listing: listing ? {
        id: listing.id,
        title: `${listing.year} ${listing.make} ${listing.model}`,
        price: listing.price,
        coverImage: cover?.image_url ?? images[0]?.image_url ?? null,
        status: listing.status,
      } : null,
      priceAlert: fav.price_alert,
      targetPrice: fav.target_price,
      createdAt: fav.created_at,
    };
  });

  res.json({ data: alerts });
}
