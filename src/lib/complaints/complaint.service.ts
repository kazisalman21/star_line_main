// ============================================================
// Star Line — Complaint Service Layer
// All complaint CRUD operations against Supabase
// ============================================================

import { supabase } from '@/lib/supabase';
import type {
  Complaint, ComplaintWithRelations, ComplaintStatusHistory,
  ComplaintInternalNote, CreateComplaintRequest, AdminComplaintFilters,
  AdminComplaintListResponse, AIClassificationResult,
} from '@/types/support';
import { VALID_STATUS_TRANSITIONS, AUTO_ESCALATION_RULES } from '@/constants/support';
import type { ComplaintStatus } from '@/types/support';

// ── Generate Complaint Code ──────────────────────────────────

async function generateComplaintCode(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_complaint_code');
  if (error) {
    // Fallback: client-side generation
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `STC-${year}-${rand}`;
  }
  return data as string;
}

// ── Check Escalation Rules ───────────────────────────────────

function checkEscalation(complaint: {
  category: string;
  priority: string;
  complaint_text: string;
}): { should_escalate: boolean; reasons: string[] } {
  const reasons: string[] = [];

  for (const rule of AUTO_ESCALATION_RULES) {
    if (rule.check(complaint as any)) {
      reasons.push(rule.condition);
    }
  }

  return { should_escalate: reasons.length > 0, reasons };
}

// ── Create Complaint ─────────────────────────────────────────

export async function createComplaint(
  input: CreateComplaintRequest,
  aiClassification?: AIClassificationResult
): Promise<{ complaint: Complaint; complaint_code: string }> {
  const complaint_code = await generateComplaintCode();

  // Determine escalation
  const escalation = checkEscalation({
    category: input.category,
    priority: aiClassification?.priority || input.urgency || 'medium',
    complaint_text: input.complaint_text,
  });

  const priority = aiClassification?.priority || input.urgency || 'medium';
  const requires_human = aiClassification?.requires_human_review || escalation.should_escalate;

  const { data, error } = await supabase
    .from('complaints')
    .insert({
      complaint_code,
      user_id: input.user_id || null,
      customer_name: input.customer_name,
      phone: input.phone,
      email: input.email || null,
      route: input.route,
      travel_date: input.travel_date || null,
      boarding_counter: input.boarding_counter || null,
      category: input.category,
      priority,
      status: escalation.should_escalate ? 'escalated' : 'submitted',
      urgency: input.urgency || 'medium',
      complaint_text: input.complaint_text,
      ai_summary: aiClassification?.ai_summary || null,
      sentiment_marker: aiClassification?.sentiment || null,
      requires_human_review: requires_human,
      escalation_flag: escalation.should_escalate,
      source_session_id: input.session_id || null,
      preferred_contact_method: input.preferred_contact_method || 'phone',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create complaint: ${error.message}`);

  // Create initial status history entry
  await supabase.from('complaint_status_history').insert({
    complaint_id: data.id,
    old_status: 'submitted',
    new_status: escalation.should_escalate ? 'escalated' : 'submitted',
    changed_by_type: 'system',
    note: escalation.should_escalate
      ? `Auto-escalated: ${escalation.reasons.join(', ')}`
      : 'Complaint submitted via AI Chat',
  });

  return { complaint: data as Complaint, complaint_code };
}

// ── Get User's Complaints ────────────────────────────────────

export async function getUserComplaints(userId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch complaints: ${error.message}`);
  return (data || []) as Complaint[];
}

// ── Get Complaint Detail with Relations ──────────────────────

export async function getComplaintDetail(
  complaintId: string,
  includeInternalNotes = false
): Promise<ComplaintWithRelations> {
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      status_history:complaint_status_history(
        id, old_status, new_status, changed_by, changed_by_type, note, created_at
      ),
      assigned_profile:profiles!complaints_assigned_to_fkey(full_name, email)
    `)
    .eq('id', complaintId)
    .single();

  if (error) throw new Error(`Complaint not found: ${error.message}`);

  const result = data as unknown as ComplaintWithRelations;

  // Fetch internal notes if admin
  if (includeInternalNotes) {
    const { data: notes } = await supabase
      .from('complaint_internal_notes')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false });

    result.internal_notes = (notes || []) as ComplaintInternalNote[];
  }

  return result;
}

// ── Admin: List Complaints (paginated + filtered) ────────────

export async function listComplaints(
  filters: AdminComplaintFilters
): Promise<AdminComplaintListResponse> {
  const page = filters.page || 1;
  const perPage = filters.per_page || 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('complaints')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.route) query = query.eq('route', filters.route);
  if (filters.counter) query = query.eq('boarding_counter', filters.counter);
  if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to);

  if (filters.date_from) query = query.gte('created_at', filters.date_from);
  if (filters.date_to) query = query.lte('created_at', filters.date_to);

  if (filters.search) {
    query = query.or(
      `complaint_code.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  // Sort
  switch (filters.sort_by) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'priority':
      query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });
      break;
    case 'unresolved':
      query = query.not('status', 'in', '("resolved","closed")').order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Paginate
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(`Failed to list complaints: ${error.message}`);

  const total = count || 0;

  return {
    complaints: (data || []) as Complaint[],
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  };
}

// ── Admin: Update Complaint Status ───────────────────────────

export async function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  note?: string
): Promise<Complaint> {
  // Fetch current complaint to validate transition
  const { data: current, error: fetchError } = await supabase
    .from('complaints')
    .select('status')
    .eq('id', complaintId)
    .single();

  if (fetchError) throw new Error(`Complaint not found: ${fetchError.message}`);

  const currentStatus = current.status as ComplaintStatus;
  const validNext = VALID_STATUS_TRANSITIONS[currentStatus];

  if (!validNext.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${currentStatus} → ${newStatus}. Valid: ${validNext.join(', ')}`
    );
  }

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'resolved') {
    updates.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update status: ${error.message}`);

  return data as Complaint;
}

// ── Admin: Assign Complaint ──────────────────────────────────

export async function assignComplaint(
  complaintId: string,
  assignedTo: string
): Promise<Complaint> {
  const { data, error } = await supabase
    .from('complaints')
    .update({
      assigned_to: assignedTo,
      status: 'assigned',
    })
    .eq('id', complaintId)
    .select()
    .single();

  if (error) throw new Error(`Failed to assign complaint: ${error.message}`);

  return data as Complaint;
}

// ── Admin: Add Internal Note ─────────────────────────────────

export async function addInternalNote(
  complaintId: string,
  authorId: string,
  note: string,
  isPrivate = true
): Promise<ComplaintInternalNote> {
  const { data, error } = await supabase
    .from('complaint_internal_notes')
    .insert({
      complaint_id: complaintId,
      author_id: authorId,
      note,
      is_private: isPrivate,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add note: ${error.message}`);

  return data as ComplaintInternalNote;
}

// ── Get Status History ───────────────────────────────────────

export async function getStatusHistory(
  complaintId: string
): Promise<ComplaintStatusHistory[]> {
  const { data, error } = await supabase
    .from('complaint_status_history')
    .select('*')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch history: ${error.message}`);

  return (data || []) as ComplaintStatusHistory[];
}
