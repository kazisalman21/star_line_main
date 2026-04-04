// ============================================================
// Star Line Support — Zod Validation Schemas
// ============================================================

import { z } from 'zod';

// ── Enum schemas ─────────────────────────────────────────────

export const complaintCategorySchema = z.enum([
  'bus_delay', 'payment_issue', 'booking_issue', 'staff_behavior',
  'counter_service', 'seat_or_bus_issue', 'refund_or_cancellation',
  'lost_item', 'technical_issue', 'other',
]);

export const complaintStatusSchema = z.enum([
  'submitted', 'under_review', 'assigned', 'in_progress',
  'awaiting_customer', 'resolved', 'closed', 'escalated',
]);

export const complaintPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const sentimentSchema = z.enum(['positive', 'neutral', 'negative', 'angry', 'distressed']);

export const contactMethodSchema = z.enum(['phone', 'email', 'chat']);

export const sessionSourceSchema = z.enum(['web', 'mobile', 'admin']);

export const senderTypeSchema = z.enum(['user', 'ai', 'admin', 'system']);

export const messageTypeSchema = z.enum([
  'normal', 'complaint_collection', 'system', 'summary', 'chips', 'confirmation',
]);

export const knowledgeCategorySchema = z.enum([
  'booking', 'payment', 'refund', 'route', 'counter',
  'baggage', 'schedule', 'general', 'policy', 'safety', 'escalation',
]);

// ── Sanitization helpers ─────────────────────────────────────

const sanitizeText = (val: string) =>
  val.trim().replace(/<[^>]*>/g, '').replace(/[<>]/g, '');

const phoneSchema = z.string()
  .min(10, 'Phone must be at least 10 digits')
  .max(15)
  .regex(/^[\d+\-() ]+$/, 'Invalid phone format')
  .transform(sanitizeText);

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100)
  .transform(sanitizeText);

const emailSchema = z.string().email('Invalid email').max(255).optional().or(z.literal(''));

// ── Request Schemas ──────────────────────────────────────────

export const createSessionSchema = z.object({
  user_id: z.string().uuid().optional(),
  source: sessionSourceSchema.default('web'),
});

export const sendMessageSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long')
    .transform(sanitizeText),
  user_id: z.string().uuid().optional(),
});

export const createComplaintSchema = z.object({
  customer_name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  route: z.string().min(3).max(100).transform(sanitizeText),
  travel_date: z.string().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    'Invalid date format'
  ).optional(),
  boarding_counter: z.string().max(100).transform(sanitizeText).optional(),
  category: complaintCategorySchema,
  complaint_text: z.string()
    .min(10, 'Please provide more details about your complaint')
    .max(5000, 'Complaint text too long')
    .transform(sanitizeText),
  urgency: complaintPrioritySchema.default('medium'),
  preferred_contact_method: contactMethodSchema.default('phone'),
  user_id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
});

export const adminComplaintFiltersSchema = z.object({
  status: complaintStatusSchema.optional(),
  category: complaintCategorySchema.optional(),
  priority: complaintPrioritySchema.optional(),
  route: z.string().max(100).optional(),
  counter: z.string().max(100).optional(),
  assigned_to: z.string().uuid().optional(),
  search: z.string().max(100).transform(sanitizeText).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_by: z.enum(['newest', 'oldest', 'priority', 'unresolved']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(5).max(100).default(20),
});

export const updateComplaintStatusSchema = z.object({
  complaint_id: z.string().uuid(),
  new_status: complaintStatusSchema,
  note: z.string().max(500).transform(sanitizeText).optional(),
});

export const assignComplaintSchema = z.object({
  complaint_id: z.string().uuid(),
  assigned_to: z.string().uuid(),
});

export const addInternalNoteSchema = z.object({
  complaint_id: z.string().uuid(),
  note: z.string()
    .min(1, 'Note cannot be empty')
    .max(2000)
    .transform(sanitizeText),
  is_private: z.boolean().default(true),
});

export const knowledgeBaseSearchSchema = z.object({
  query: z.string().min(2).max(200).transform(sanitizeText),
  category: knowledgeCategorySchema.optional(),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

// ── AI Response Schemas ──────────────────────────────────────

export const aiClassificationSchema = z.object({
  category: complaintCategorySchema,
  priority: complaintPrioritySchema,
  sentiment: sentimentSchema,
  requires_escalation: z.boolean(),
  requires_human_review: z.boolean(),
  ai_summary: z.string().max(500),
  confidence: z.number().min(0).max(1),
});

export const aiComplaintExtractionSchema = z.object({
  customer_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  route: z.string().optional(),
  travel_date: z.string().optional(),
  boarding_counter: z.string().optional(),
  category: complaintCategorySchema.optional(),
  complaint_text: z.string().optional(),
  urgency: complaintPrioritySchema.optional(),
  is_complete: z.boolean(),
  missing_fields: z.array(z.string()),
});

// ── Type exports from schemas ────────────────────────────────

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type AdminComplaintFiltersInput = z.infer<typeof adminComplaintFiltersSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type AddInternalNoteInput = z.infer<typeof addInternalNoteSchema>;
export type KnowledgeBaseSearchInput = z.infer<typeof knowledgeBaseSearchSchema>;
