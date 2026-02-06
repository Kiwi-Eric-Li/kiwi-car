import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { NotFoundError } from '@/utils/errors';
import { RATE_LIMITS } from '@/config/constants';
import * as storageService from '@/services/storage.service';
import type { ProfileRow, ProfileResponse } from '@/types';

function toProfileResponse(row: ProfileRow): ProfileResponse {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    region: row.region,
    showPhone: row.show_phone,
    createdAt: row.created_at,
  };
}

export async function getMe(req: Request, res: Response, _next: NextFunction) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user!.id)
    .single();

  if (error || !data) {
    throw new NotFoundError('Profile not found');
  }

  res.json(toProfileResponse(data as ProfileRow));
}

export async function updateMe(req: Request, res: Response, _next: NextFunction) {
  const { nickname, region, showPhone, phone } = req.body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (nickname !== undefined) updates.nickname = nickname;
  if (region !== undefined) updates.region = region;
  if (showPhone !== undefined) updates.show_phone = showPhone;
  if (phone !== undefined) updates.phone = phone;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', req.user!.id)
    .select('*')
    .single();

  if (error || !data) {
    throw new NotFoundError('Profile not found');
  }

  res.json(toProfileResponse(data as ProfileRow));
}

export async function uploadAvatar(req: Request, res: Response, _next: NextFunction) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'No file provided' } });
    return;
  }

  const avatarUrl = await storageService.uploadAvatar(file.buffer, file.mimetype, req.user!.id);

  await supabaseAdmin
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', req.user!.id);

  res.json({ avatarUrl });
}

export async function deleteMe(req: Request, res: Response, _next: NextFunction) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user!.id);
  if (error) {
    throw error;
  }
  res.status(204).send();
}

export async function getLookupQuota(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const total = RATE_LIMITS.VEHICLE_LOOKUP_AUTH.perDay;

  const { data } = await supabaseAdmin
    .from('lookup_quotas')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) {
    res.json({ remaining: total, total, resetsAt: null });
    return;
  }

  const now = new Date();
  const resetAt = new Date(data.reset_at);

  if (now >= resetAt) {
    res.json({ remaining: total, total, resetsAt: null });
    return;
  }

  const remaining = Math.max(0, total - data.count);
  res.json({ remaining, total, resetsAt: data.reset_at });
}
