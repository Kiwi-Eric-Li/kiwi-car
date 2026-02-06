import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { NotFoundError, ForbiddenError } from '@/utils/errors';
import { parsePagination, buildPaginationMeta } from '@/utils/pagination';
import logger from '@/utils/logger';
import type {
  ListingRow,
  ListingImageRow,
  ProfileRow,
  ListingCardResponse,
  ListingResponse,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toListingCard(
  listing: ListingRow,
  coverImage: string | null,
): ListingCardResponse {
  return {
    id: listing.id,
    title: `${listing.year} ${listing.make} ${listing.model}`,
    price: listing.price,
    year: listing.year,
    mileage: listing.mileage,
    region: listing.region,
    fuelType: listing.fuel_type,
    transmission: listing.transmission,
    coverImage,
    createdAt: listing.created_at,
  };
}

function toListingResponse(
  listing: ListingRow,
  images: { id: string; url: string; order: number }[],
  seller: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    memberSince: string;
    listingsCount: number;
  },
): ListingResponse {
  return {
    id: listing.id,
    plateNumber: listing.plate_number,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    price: listing.price,
    description: listing.description,
    aiDescription: listing.ai_description,
    aiPriceMin: listing.ai_price_min,
    aiPriceMax: listing.ai_price_max,
    aiPriceRecommended: listing.ai_price_recommended,
    status: listing.status,
    region: listing.region,
    fuelType: listing.fuel_type,
    transmission: listing.transmission,
    bodyType: listing.body_type,
    color: listing.color,
    vin: listing.vin,
    views: listing.views,
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
    images,
    seller,
  };
}

// ---------------------------------------------------------------------------
// GET /api/listings
// ---------------------------------------------------------------------------

export async function listListings(req: Request, res: Response, _next: NextFunction) {
  const {
    q,
    make,
    model,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    minMileage,
    maxMileage,
    region,
    fuelType,
    transmission,
    bodyType,
    sort,
  } = req.query as Record<string, string | undefined>;

  const { page, limit, offset } = parsePagination(req.query as { page?: string; limit?: string });

  // ---- Count query ----
  let countQuery = supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE');

  // ---- Data query ----
  let dataQuery = supabaseAdmin
    .from('listings')
    .select('*, listing_images!left(id, image_url, "order")')
    .eq('status', 'ACTIVE');

  // Keyword search
  if (q) {
    const pattern = `%${q}%`;
    const orFilter = `make.ilike.${pattern},model.ilike.${pattern},description.ilike.${pattern}`;
    countQuery = countQuery.or(orFilter);
    dataQuery = dataQuery.or(orFilter);
  }

  // Comma-separated make filter
  if (make) {
    const makes = make.split(',').map((m) => m.trim());
    countQuery = countQuery.in('make', makes);
    dataQuery = dataQuery.in('make', makes);
  }

  // Model
  if (model) {
    countQuery = countQuery.ilike('model', `%${model}%`);
    dataQuery = dataQuery.ilike('model', `%${model}%`);
  }

  // Price range
  if (minPrice) {
    countQuery = countQuery.gte('price', Number(minPrice));
    dataQuery = dataQuery.gte('price', Number(minPrice));
  }
  if (maxPrice) {
    countQuery = countQuery.lte('price', Number(maxPrice));
    dataQuery = dataQuery.lte('price', Number(maxPrice));
  }

  // Year range
  if (minYear) {
    countQuery = countQuery.gte('year', Number(minYear));
    dataQuery = dataQuery.gte('year', Number(minYear));
  }
  if (maxYear) {
    countQuery = countQuery.lte('year', Number(maxYear));
    dataQuery = dataQuery.lte('year', Number(maxYear));
  }

  // Mileage range
  if (minMileage) {
    countQuery = countQuery.gte('mileage', Number(minMileage));
    dataQuery = dataQuery.gte('mileage', Number(minMileage));
  }
  if (maxMileage) {
    countQuery = countQuery.lte('mileage', Number(maxMileage));
    dataQuery = dataQuery.lte('mileage', Number(maxMileage));
  }

  // Comma-separated region filter
  if (region) {
    const regions = region.split(',').map((r) => r.trim());
    countQuery = countQuery.in('region', regions);
    dataQuery = dataQuery.in('region', regions);
  }

  // Enum-like filters
  if (fuelType) {
    countQuery = countQuery.eq('fuel_type', fuelType);
    dataQuery = dataQuery.eq('fuel_type', fuelType);
  }
  if (transmission) {
    countQuery = countQuery.eq('transmission', transmission);
    dataQuery = dataQuery.eq('transmission', transmission);
  }
  if (bodyType) {
    countQuery = countQuery.eq('body_type', bodyType);
    dataQuery = dataQuery.eq('body_type', bodyType);
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      dataQuery = dataQuery.order('price', { ascending: true });
      break;
    case 'price_desc':
      dataQuery = dataQuery.order('price', { ascending: false });
      break;
    case 'mileage_asc':
      dataQuery = dataQuery.order('mileage', { ascending: true });
      break;
    case 'newest':
    default:
      dataQuery = dataQuery.order('created_at', { ascending: false });
      break;
  }

  // Execute count query
  const { count, error: countError } = await countQuery;
  if (countError) {
    logger.error('Error counting listings', { error: countError });
    throw countError;
  }

  const total = count ?? 0;

  // Execute data query with pagination
  const { data: listings, error: dataError } = await dataQuery.range(offset, offset + limit - 1);
  if (dataError) {
    logger.error('Error fetching listings', { error: dataError });
    throw dataError;
  }

  // Build card responses — extract cover image (order 0) from joined images
  const cards: ListingCardResponse[] = (listings ?? []).map((listing: any) => {
    const images = listing.listing_images as ListingImageRow[] | null;
    const cover = images?.find((img) => img.order === 0);
    const coverImage = cover?.image_url ?? images?.[0]?.image_url ?? null;
    return toListingCard(listing as ListingRow, coverImage);
  });

  res.json({
    data: cards,
    pagination: buildPaginationMeta(page, limit, total),
  });
}

// ---------------------------------------------------------------------------
// GET /api/listings/:id
// ---------------------------------------------------------------------------

export async function getListingById(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;

  // Fetch listing with images
  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .select('*, listing_images(id, image_url, "order")')
    .eq('id', id)
    .single();

  if (error || !listing) {
    throw new NotFoundError('Listing not found');
  }

  // Get seller profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', listing.user_id)
    .single();

  // Get seller's listing count
  const { count: listingsCount } = await supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', listing.user_id)
    .eq('status', 'ACTIVE');

  // Increment views
  await supabaseAdmin
    .from('listings')
    .update({ views: (listing as ListingRow).views + 1 })
    .eq('id', id);

  // Build images array sorted by order
  const rawImages = (listing.listing_images as ListingImageRow[]) ?? [];
  const sortedImages = [...rawImages].sort((a, b) => a.order - b.order);
  const images = sortedImages.map((img) => ({
    id: img.id,
    url: img.image_url,
    order: img.order,
  }));

  const sellerProfile = profile as ProfileRow | null;

  const response = toListingResponse(listing as ListingRow, images, {
    id: listing.user_id,
    nickname: sellerProfile?.nickname ?? null,
    avatarUrl: sellerProfile?.avatar_url ?? null,
    memberSince: sellerProfile?.created_at ?? listing.created_at,
    listingsCount: listingsCount ?? 0,
  });

  res.json(response);
}

// ---------------------------------------------------------------------------
// POST /api/listings
// ---------------------------------------------------------------------------

export async function createListing(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const {
    plateNumber,
    make,
    model,
    year,
    mileage,
    price,
    description,
    region,
    fuelType,
    transmission,
    bodyType,
    color,
    vin,
    images,
  } = req.body;

  // Insert listing
  const { data: listing, error } = await supabaseAdmin
    .from('listings')
    .insert({
      user_id: userId,
      plate_number: plateNumber,
      make,
      model,
      year,
      mileage,
      price,
      description,
      region,
      fuel_type: fuelType,
      transmission,
      body_type: bodyType,
      color,
      vin: vin ?? null,
      status: 'ACTIVE',
      views: 0,
    })
    .select('id')
    .single();

  if (error || !listing) {
    logger.error('Error creating listing', { error });
    throw error;
  }

  // Link images to the listing
  if (images && images.length > 0) {
    for (const imageId of images as string[]) {
      await supabaseAdmin
        .from('listing_images')
        .update({ listing_id: listing.id })
        .eq('id', imageId);
    }
  }

  // Insert initial price history
  await supabaseAdmin.from('price_history').insert({
    listing_id: listing.id,
    price,
    changed_at: new Date().toISOString(),
  });

  res.status(201).json({ id: listing.id, message: 'Listing created successfully' });
}

// ---------------------------------------------------------------------------
// PUT /api/listings/:id
// ---------------------------------------------------------------------------

export async function updateListing(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;
  const userId = req.user!.id;

  // Verify existence and ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError('Listing not found');
  }

  if ((existing as ListingRow).user_id !== userId) {
    throw new ForbiddenError('You do not own this listing');
  }

  const {
    make,
    model,
    year,
    mileage,
    price,
    description,
    region,
    fuelType,
    transmission,
    bodyType,
    color,
    vin,
    images,
  } = req.body;

  // Build update object — only include provided fields
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (make !== undefined) updates.make = make;
  if (model !== undefined) updates.model = model;
  if (year !== undefined) updates.year = year;
  if (mileage !== undefined) updates.mileage = mileage;
  if (price !== undefined) updates.price = price;
  if (description !== undefined) updates.description = description;
  if (region !== undefined) updates.region = region;
  if (fuelType !== undefined) updates.fuel_type = fuelType;
  if (transmission !== undefined) updates.transmission = transmission;
  if (bodyType !== undefined) updates.body_type = bodyType;
  if (color !== undefined) updates.color = color;
  if (vin !== undefined) updates.vin = vin;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    logger.error('Error updating listing', { error: updateError });
    throw updateError;
  }

  // If price changed, record in price_history
  if (price !== undefined && price !== (existing as ListingRow).price) {
    await supabaseAdmin.from('price_history').insert({
      listing_id: id,
      price,
      changed_at: new Date().toISOString(),
    });
  }

  // If images array provided, update image links
  if (images && images.length > 0) {
    // Unlink existing images
    await supabaseAdmin
      .from('listing_images')
      .update({ listing_id: null })
      .eq('listing_id', id);

    // Link new images
    for (const imageId of images as string[]) {
      await supabaseAdmin
        .from('listing_images')
        .update({ listing_id: id })
        .eq('id', imageId);
    }
  }

  res.json(updated);
}

// ---------------------------------------------------------------------------
// DELETE /api/listings/:id
// ---------------------------------------------------------------------------

export async function deleteListing(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;
  const userId = req.user!.id;

  // Verify existence and ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('listings')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError('Listing not found');
  }

  if (existing.user_id !== userId) {
    throw new ForbiddenError('You do not own this listing');
  }

  // Delete listing — images cascade via FK
  const { error: deleteError } = await supabaseAdmin
    .from('listings')
    .delete()
    .eq('id', id);

  if (deleteError) {
    logger.error('Error deleting listing', { error: deleteError });
    throw deleteError;
  }

  res.status(204).send();
}

// ---------------------------------------------------------------------------
// PUT /api/listings/:id/status
// ---------------------------------------------------------------------------

export async function updateStatus(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;
  const userId = req.user!.id;
  const { status } = req.body;

  // Verify existence and ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('listings')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError('Listing not found');
  }

  if (existing.user_id !== userId) {
    throw new ForbiddenError('You do not own this listing');
  }

  const { error: updateError } = await supabaseAdmin
    .from('listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    logger.error('Error updating listing status', { error: updateError });
    throw updateError;
  }

  res.json({ id, status });
}

// ---------------------------------------------------------------------------
// GET /api/listings/:id/similar
// ---------------------------------------------------------------------------

export async function getSimilarListings(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;

  // Get the source listing
  const { data: source, error } = await supabaseAdmin
    .from('listings')
    .select('make, price, body_type')
    .eq('id', id)
    .single();

  if (error || !source) {
    throw new NotFoundError('Listing not found');
  }

  const { make, price, body_type } = source as { make: string; price: number; body_type: string };

  const priceMin = Math.round(price * 0.7);
  const priceMax = Math.round(price * 1.3);

  // Query similar listings: match make OR body_type OR within +-30% price
  const { data: similar } = await supabaseAdmin
    .from('listings')
    .select('*, listing_images!left(id, image_url, "order")')
    .eq('status', 'ACTIVE')
    .neq('id', id)
    .or(`make.eq.${make},body_type.eq.${body_type},and(price.gte.${priceMin},price.lte.${priceMax})`)
    .limit(6);

  const cards: ListingCardResponse[] = (similar ?? []).map((listing: any) => {
    const images = listing.listing_images as ListingImageRow[] | null;
    const cover = images?.find((img) => img.order === 0);
    const coverImage = cover?.image_url ?? images?.[0]?.image_url ?? null;
    return toListingCard(listing as ListingRow, coverImage);
  });

  res.json(cards);
}

// ---------------------------------------------------------------------------
// GET /api/listings/my
// ---------------------------------------------------------------------------

export async function getMyListings(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const { page, limit, offset } = parsePagination(req.query as { page?: string; limit?: string });

  // Count
  const { count } = await supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const total = count ?? 0;

  // Data
  const { data: listings } = await supabaseAdmin
    .from('listings')
    .select('*, listing_images!left(id, image_url, "order")')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const cards: ListingCardResponse[] = (listings ?? []).map((listing: any) => {
    const images = listing.listing_images as ListingImageRow[] | null;
    const cover = images?.find((img) => img.order === 0);
    const coverImage = cover?.image_url ?? images?.[0]?.image_url ?? null;
    return toListingCard(listing as ListingRow, coverImage);
  });

  res.json({
    data: cards,
    pagination: buildPaginationMeta(page, limit, total),
  });
}

// ---------------------------------------------------------------------------
// POST /api/listings/drafts
// ---------------------------------------------------------------------------

export async function createDraft(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const {
    plateNumber,
    make,
    model,
    year,
    mileage,
    price,
    description,
    region,
    fuelType,
    transmission,
    bodyType,
    color,
    vin,
    images,
  } = req.body;

  const insertData: Record<string, unknown> = {
    user_id: userId,
    status: 'DRAFT',
    views: 0,
  };

  if (plateNumber !== undefined) insertData.plate_number = plateNumber;
  if (make !== undefined) insertData.make = make;
  if (model !== undefined) insertData.model = model;
  if (year !== undefined) insertData.year = year;
  if (mileage !== undefined) insertData.mileage = mileage;
  if (price !== undefined) insertData.price = price;
  if (description !== undefined) insertData.description = description;
  if (region !== undefined) insertData.region = region;
  if (fuelType !== undefined) insertData.fuel_type = fuelType;
  if (transmission !== undefined) insertData.transmission = transmission;
  if (bodyType !== undefined) insertData.body_type = bodyType;
  if (color !== undefined) insertData.color = color;
  if (vin !== undefined) insertData.vin = vin;

  const { data: draft, error } = await supabaseAdmin
    .from('listings')
    .insert(insertData)
    .select('id')
    .single();

  if (error || !draft) {
    logger.error('Error creating draft', { error });
    throw error;
  }

  // Link images if provided
  if (images && images.length > 0) {
    for (const imageId of images as string[]) {
      await supabaseAdmin
        .from('listing_images')
        .update({ listing_id: draft.id })
        .eq('id', imageId);
    }
  }

  res.status(201).json({ id: draft.id, message: 'Draft saved' });
}

// ---------------------------------------------------------------------------
// GET /api/listings/drafts
// ---------------------------------------------------------------------------

export async function getMyDrafts(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;

  const { data: drafts } = await supabaseAdmin
    .from('listings')
    .select('*, listing_images!left(id, image_url, "order")')
    .eq('user_id', userId)
    .eq('status', 'DRAFT')
    .order('created_at', { ascending: false });

  const cards: ListingCardResponse[] = (drafts ?? []).map((listing: any) => {
    const images = listing.listing_images as ListingImageRow[] | null;
    const cover = images?.find((img) => img.order === 0);
    const coverImage = cover?.image_url ?? images?.[0]?.image_url ?? null;
    return toListingCard(listing as ListingRow, coverImage);
  });

  res.json(cards);
}

// ---------------------------------------------------------------------------
// PUT /api/listings/drafts/:id
// ---------------------------------------------------------------------------

export async function updateDraft(req: Request, res: Response, _next: NextFunction) {
  const { id } = req.params;
  const userId = req.user!.id;

  // Verify existence, ownership, and DRAFT status
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    throw new NotFoundError('Draft not found');
  }

  if ((existing as ListingRow).user_id !== userId) {
    throw new ForbiddenError('You do not own this draft');
  }

  if ((existing as ListingRow).status !== 'DRAFT') {
    throw new ForbiddenError('This listing is not a draft');
  }

  const {
    make,
    model,
    year,
    mileage,
    price,
    description,
    region,
    fuelType,
    transmission,
    bodyType,
    color,
    vin,
    images,
  } = req.body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (make !== undefined) updates.make = make;
  if (model !== undefined) updates.model = model;
  if (year !== undefined) updates.year = year;
  if (mileage !== undefined) updates.mileage = mileage;
  if (price !== undefined) updates.price = price;
  if (description !== undefined) updates.description = description;
  if (region !== undefined) updates.region = region;
  if (fuelType !== undefined) updates.fuel_type = fuelType;
  if (transmission !== undefined) updates.transmission = transmission;
  if (bodyType !== undefined) updates.body_type = bodyType;
  if (color !== undefined) updates.color = color;
  if (vin !== undefined) updates.vin = vin;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError) {
    logger.error('Error updating draft', { error: updateError });
    throw updateError;
  }

  // If images array provided, update image links
  if (images && images.length > 0) {
    await supabaseAdmin
      .from('listing_images')
      .update({ listing_id: null })
      .eq('listing_id', id);

    for (const imageId of images as string[]) {
      await supabaseAdmin
        .from('listing_images')
        .update({ listing_id: id })
        .eq('id', imageId);
    }
  }

  res.json(updated);
}
