import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/config/supabase';

// ---------------------------------------------------------------------------
// MIME type to file extension mapping
// ---------------------------------------------------------------------------

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function getExtension(mimeType: string): string {
  const ext = MIME_TO_EXT[mimeType];
  if (!ext) {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
  return ext;
}

// ---------------------------------------------------------------------------
// Upload listing image
// ---------------------------------------------------------------------------

export async function uploadListingImage(
  fileBuffer: Buffer,
  mimeType: string,
  listingId: string,
): Promise<string> {
  const ext = getExtension(mimeType);
  const filename = `${listingId}/${uuidv4()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('listings')
    .upload(filename, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload listing image: ${error.message}`);
  }

  return getPublicUrl('listings', filename);
}

// ---------------------------------------------------------------------------
// Upload avatar
// ---------------------------------------------------------------------------

export async function uploadAvatar(
  fileBuffer: Buffer,
  mimeType: string,
  userId: string,
): Promise<string> {
  const ext = getExtension(mimeType);
  const filename = `${userId}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('avatars')
    .upload(filename, fileBuffer, {
      contentType: mimeType,
      upsert: true, // Overwrite existing avatar
    });

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  return getPublicUrl('avatars', filename);
}

// ---------------------------------------------------------------------------
// Delete image
// ---------------------------------------------------------------------------

export async function deleteImage(bucket: string, path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete image from ${bucket}/${path}: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Get public URL
// ---------------------------------------------------------------------------

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
