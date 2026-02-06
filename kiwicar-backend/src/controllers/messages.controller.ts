import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '@/config/supabase';
import { BadRequestError, NotFoundError } from '@/utils/errors';

export async function getConversations(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;

  // Get all messages involving this user
  const { data: messages, error } = await supabaseAdmin
    .from('messages')
    .select('*, sender:profiles!sender_id(id, nickname, avatar_url), receiver:profiles!receiver_id(id, nickname, avatar_url)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group messages by (other_user_id, listing_id) to form conversations
  const conversationMap = new Map<string, any>();

  for (const msg of messages ?? []) {
    const isFromMe = msg.sender_id === userId;
    const otherId = isFromMe ? msg.receiver_id : msg.sender_id;
    const key = `${otherId}:${msg.listing_id}`;

    if (!conversationMap.has(key)) {
      const otherUser = isFromMe ? msg.receiver : msg.sender;
      conversationMap.set(key, {
        id: key,
        otherUser: {
          id: otherId,
          nickname: (otherUser as any)?.nickname ?? null,
          avatarUrl: (otherUser as any)?.avatar_url ?? null,
        },
        listingId: msg.listing_id,
        lastMessage: {
          content: msg.content,
          createdAt: msg.created_at,
          isFromMe,
        },
        unreadCount: 0,
      });
    }

    // Count unread messages sent TO the current user
    if (!isFromMe && !msg.is_read) {
      conversationMap.get(key)!.unreadCount++;
    }
  }

  // Fetch listing info for each conversation
  const conversations = [];
  for (const conv of conversationMap.values()) {
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, make, model, year, listing_images(image_url, "order")')
      .eq('id', conv.listingId)
      .single();

    const images = (listing as any)?.listing_images ?? [];
    const cover = images.find((img: any) => img.order === 0);

    conversations.push({
      ...conv,
      listing: listing ? {
        id: listing.id,
        title: `${(listing as any).year} ${(listing as any).make} ${(listing as any).model}`,
        coverImage: cover?.image_url ?? images[0]?.image_url ?? null,
      } : null,
    });
  }

  res.json({ data: conversations });
}

export async function getConversation(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const listingId = req.params.id;
  const withUserId = req.query.with as string;

  if (!withUserId) {
    throw new BadRequestError('Missing "with" query parameter (other user ID)');
  }

  const { data: messages, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('listing_id', listingId)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const formattedMessages = (messages ?? []).map((msg) => ({
    id: msg.id,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    content: msg.content,
    isFromMe: msg.sender_id === userId,
    isRead: msg.is_read,
    createdAt: msg.created_at,
  }));

  res.json({ data: formattedMessages });
}

export async function sendMessage(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const { receiverId, listingId, content } = req.body;

  if (receiverId === userId) {
    throw new BadRequestError('Cannot message yourself');
  }

  // Verify listing exists
  const { data: listing, error: listingError } = await supabaseAdmin
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    throw new NotFoundError('Listing not found');
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      sender_id: userId,
      receiver_id: receiverId,
      listing_id: listingId,
      content,
    })
    .select('*')
    .single();

  if (error) throw error;

  res.status(201).json({
    id: data.id,
    senderId: data.sender_id,
    receiverId: data.receiver_id,
    listingId: data.listing_id,
    content: data.content,
    createdAt: data.created_at,
  });
}

export async function markAsRead(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;
  const listingId = req.params.id;

  await supabaseAdmin
    .from('messages')
    .update({ is_read: true })
    .eq('listing_id', listingId)
    .eq('receiver_id', userId)
    .eq('is_read', false);

  res.json({ success: true });
}

export async function getUnreadCount(req: Request, res: Response, _next: NextFunction) {
  const userId = req.user!.id;

  const { count, error } = await supabaseAdmin
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) throw error;

  res.json({ count: count ?? 0 });
}
