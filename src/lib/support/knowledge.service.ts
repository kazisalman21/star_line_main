// ============================================================
// Star Line — Knowledge Base Service
// Search and manage support knowledge entries
// ============================================================

import { supabase } from '@/lib/supabase';
import type { KnowledgeBaseEntry, KnowledgeCategory } from '@/types/support';

// ── Full-Text Search ─────────────────────────────────────────

export async function searchKnowledge(
  query: string,
  category?: KnowledgeCategory,
  limit = 5
): Promise<KnowledgeBaseEntry[]> {
  // Convert query to tsquery format
  const tsQuery = query
    .split(/\s+/)
    .filter(w => w.length > 1)
    .map(w => `${w}:*`)
    .join(' & ');

  let dbQuery = supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .textSearch('search_vector', tsQuery, { type: 'plain' })
    .limit(limit);

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  const { data, error } = await dbQuery;

  if (error || !data || data.length === 0) {
    // Fallback: simple ILIKE search
    return fallbackSearch(query, category, limit);
  }

  return data as KnowledgeBaseEntry[];
}

// ── Fallback: keyword-based search ───────────────────────────

async function fallbackSearch(
  query: string,
  category?: KnowledgeCategory,
  limit = 5
): Promise<KnowledgeBaseEntry[]> {
  let dbQuery = supabase
    .from('knowledge_base')
    .select('*')
    .eq('is_active', true)
    .or(`question.ilike.%${query}%,answer.ilike.%${query}%,title.ilike.%${query}%`)
    .limit(limit);

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  const { data } = await dbQuery;
  return (data || []) as KnowledgeBaseEntry[];
}

// ── Get by Category ──────────────────────────────────────────

export async function getKnowledgeByCategory(
  category: KnowledgeCategory
): Promise<KnowledgeBaseEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch knowledge: ${error.message}`);

  return (data || []) as KnowledgeBaseEntry[];
}

// ── Get All (Admin) ──────────────────────────────────────────

export async function getAllKnowledge(): Promise<KnowledgeBaseEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch knowledge: ${error.message}`);

  return (data || []) as KnowledgeBaseEntry[];
}

// ── CRUD (Admin) ─────────────────────────────────────────────

export async function createKnowledgeEntry(
  entry: Omit<KnowledgeBaseEntry, 'id' | 'created_at' | 'updated_at' | 'search_vector'>
): Promise<KnowledgeBaseEntry> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .insert(entry)
    .select()
    .single();

  if (error) throw new Error(`Failed to create entry: ${error.message}`);
  return data as KnowledgeBaseEntry;
}

export async function updateKnowledgeEntry(
  id: string,
  updates: Partial<KnowledgeBaseEntry>
): Promise<KnowledgeBaseEntry> {
  const { data, error } = await supabase
    .from('knowledge_base')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update entry: ${error.message}`);
  return data as KnowledgeBaseEntry;
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete entry: ${error.message}`);
}

// ── Build Context for AI ─────────────────────────────────────
// Constructs a knowledge context string for AI prompts

export async function buildAIKnowledgeContext(
  userMessage: string
): Promise<string> {
  const entries = await searchKnowledge(userMessage, undefined, 5);

  if (entries.length === 0) {
    return 'No relevant knowledge base entries found. Use general Star Line support guidance.';
  }

  return entries.map(e =>
    `[${e.category.toUpperCase()}] Q: ${e.question}\nA: ${e.answer}\n(Source: ${e.source_type}, Confidence: ${e.confidence})`
  ).join('\n\n');
}
