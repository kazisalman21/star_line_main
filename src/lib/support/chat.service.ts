// ============================================================
// Star Line — Support Chat Service Layer
// Session management + message handling
// ============================================================

import { supabase } from '@/lib/supabase';
import type {
  SupportSession, SupportMessage, SupportSessionWithMessages,
  SessionSource, SenderType, MessageType,
} from '@/types/support';

// ── Create Session ───────────────────────────────────────────

export async function createSession(
  userId?: string,
  source: SessionSource = 'web'
): Promise<SupportSession> {
  const { data, error } = await supabase
    .from('support_sessions')
    .insert({
      user_id: userId || null,
      source,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);

  return data as SupportSession;
}

// ── Get or Create Session ────────────────────────────────────

export async function getOrCreateSession(
  userId?: string,
  source: SessionSource = 'web'
): Promise<SupportSession> {
  if (userId) {
    // Check for existing active session
    const { data: existing } = await supabase
      .from('support_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Check if session is stale (>2 hours)
      const lastMsg = new Date(existing.last_message_at);
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      if (lastMsg > twoHoursAgo) {
        return existing as SupportSession;
      }

      // Expire old session
      await supabase
        .from('support_sessions')
        .update({ status: 'expired' })
        .eq('id', existing.id);
    }
  }

  return createSession(userId, source);
}

// ── Get Session with Messages ────────────────────────────────

export async function getSessionWithMessages(
  sessionId: string
): Promise<SupportSessionWithMessages> {
  const { data, error } = await supabase
    .from('support_sessions')
    .select(`
      *,
      messages:support_messages(
        id, sender_type, message_text, message_type, structured_payload, created_at
      )
    `)
    .eq('id', sessionId)
    .single();

  if (error) throw new Error(`Session not found: ${error.message}`);

  return data as unknown as SupportSessionWithMessages;
}

// ── Add Message ──────────────────────────────────────────────

export async function addMessage(
  sessionId: string,
  senderType: SenderType,
  messageText: string,
  messageType: MessageType = 'normal',
  structuredPayload?: Record<string, unknown>
): Promise<SupportMessage> {
  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      session_id: sessionId,
      sender_type: senderType,
      message_text: messageText,
      message_type: messageType,
      structured_payload: structuredPayload || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add message: ${error.message}`);

  // Update session last_message_at
  await supabase
    .from('support_sessions')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', sessionId);

  return data as SupportMessage;
}

// ── Get Chat History ─────────────────────────────────────────

export async function getChatHistory(
  sessionId: string,
  limit = 50
): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch messages: ${error.message}`);

  return (data || []) as SupportMessage[];
}

// ── Update Session Status ────────────────────────────────────

export async function updateSessionStatus(
  sessionId: string,
  status: 'active' | 'resolved' | 'escalated' | 'expired'
): Promise<void> {
  const { error } = await supabase
    .from('support_sessions')
    .update({ status })
    .eq('id', sessionId);

  if (error) throw new Error(`Failed to update session: ${error.message}`);
}

// ── Get Recent Sessions (Admin) ──────────────────────────────

export async function getRecentSessions(limit = 20): Promise<SupportSession[]> {
  const { data, error } = await supabase
    .from('support_sessions')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);

  return (data || []) as SupportSession[];
}
