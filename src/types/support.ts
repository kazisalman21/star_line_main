// ============================================================
// Star Line AI Customer Care — TypeScript Types
// ============================================================

// ── Enums ────────────────────────────────────────────────────

export type ComplaintCategory =
  | 'bus_delay'
  | 'payment_issue'
  | 'booking_issue'
  | 'staff_behavior'
  | 'counter_service'
  | 'seat_or_bus_issue'
  | 'refund_or_cancellation'
  | 'lost_item'
  | 'technical_issue'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_customer'
  | 'resolved'
  | 'closed'
  | 'escalated';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type SentimentMarker = 'positive' | 'neutral' | 'negative' | 'angry' | 'distressed';

export type ContactMethod = 'phone' | 'email' | 'chat';

export type SessionSource = 'web' | 'mobile' | 'admin';
export type SessionStatus = 'active' | 'resolved' | 'escalated' | 'expired';

export type SenderType = 'user' | 'ai' | 'admin' | 'system';
export type MessageType = 'normal' | 'complaint_collection' | 'system' | 'summary' | 'chips' | 'confirmation';

export type KnowledgeCategory =
  | 'booking' | 'payment' | 'refund' | 'route' | 'counter'
  | 'baggage' | 'schedule' | 'general' | 'policy' | 'safety' | 'escalation';

export type SourceType = 'official' | 'faq' | 'policy' | 'guide';
export type StatusChangeActor = 'system' | 'admin' | 'customer' | 'ai';

export type UserRole = 'passenger' | 'admin' | 'support_agent' | 'super_admin';

// ── Database Row Types ───────────────────────────────────────

export interface SupportSession {
  id: string;
  user_id: string | null;
  session_token: string;
  source: SessionSource;
  status: SessionStatus;
  metadata: Record<string, unknown>;
  started_at: string;
  last_message_at: string;
}

export interface SupportMessage {
  id: string;
  session_id: string;
  sender_type: SenderType;
  message_text: string;
  message_type: MessageType;
  structured_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  route: string;
  travel_date: string | null;
  boarding_counter: string | null;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  urgency: ComplaintPriority;
  complaint_text: string;
  ai_summary: string | null;
  sentiment_marker: SentimentMarker | null;
  requires_human_review: boolean;
  escalation_flag: boolean;
  assigned_to: string | null;
  source_session_id: string | null;
  preferred_contact_method: ContactMethod;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus;
  new_status: ComplaintStatus;
  changed_by: string | null;
  changed_by_type: StatusChangeActor;
  note: string | null;
  created_at: string;
}

export interface ComplaintInternalNote {
  id: string;
  complaint_id: string;
  author_id: string;
  note: string;
  is_private: boolean;
  created_at: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  question: string;
  answer: string;
  tags: string[];
  source_type: SourceType;
  confidence: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Composite Types (with relations) ─────────────────────────

export interface ComplaintWithRelations extends Complaint {
  status_history: ComplaintStatusHistory[];
  internal_notes?: ComplaintInternalNote[];
  assigned_profile?: { full_name: string; email: string } | null;
  session?: SupportSession | null;
}

export interface SupportSessionWithMessages extends SupportSession {
  messages: SupportMessage[];
}

// ── API Request/Response Types ───────────────────────────────

export interface CreateSessionRequest {
  user_id?: string;
  source?: SessionSource;
}

export interface SendMessageRequest {
  session_id: string;
  message: string;
  user_id?: string;
}

export interface SendMessageResponse {
  user_message: SupportMessage;
  ai_response: SupportMessage;
  complaint_created?: Complaint;
  action?: 'complaint_started' | 'complaint_step' | 'complaint_submitted' | 'escalation' | 'normal';
}

export interface CreateComplaintRequest {
  customer_name: string;
  phone: string;
  email?: string;
  route: string;
  travel_date?: string;
  boarding_counter?: string;
  category: ComplaintCategory;
  complaint_text: string;
  urgency?: ComplaintPriority;
  preferred_contact_method?: ContactMethod;
  user_id?: string;
  session_id?: string;
}

export interface AdminComplaintFilters {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  priority?: ComplaintPriority;
  route?: string;
  counter?: string;
  assigned_to?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'newest' | 'oldest' | 'priority' | 'unresolved';
  page?: number;
  per_page?: number;
}

export interface AdminComplaintListResponse {
  complaints: Complaint[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UpdateComplaintStatusRequest {
  complaint_id: string;
  new_status: ComplaintStatus;
  note?: string;
}

export interface AssignComplaintRequest {
  complaint_id: string;
  assigned_to: string;
}

export interface AddInternalNoteRequest {
  complaint_id: string;
  note: string;
  is_private?: boolean;
}

// ── AI Types ─────────────────────────────────────────────────

export interface AIClassificationResult {
  category: ComplaintCategory;
  priority: ComplaintPriority;
  sentiment: SentimentMarker;
  requires_escalation: boolean;
  requires_human_review: boolean;
  ai_summary: string;
  confidence: number;
}

export interface AIComplaintExtraction {
  customer_name?: string;
  phone?: string;
  email?: string;
  route?: string;
  travel_date?: string;
  boarding_counter?: string;
  category?: ComplaintCategory;
  complaint_text?: string;
  urgency?: ComplaintPriority;
  is_complete: boolean;
  missing_fields: string[];
}

export interface AISupportResponse {
  reply: string;
  intent: 'general_support' | 'complaint_intake' | 'escalation' | 'booking_help' | 'refund_help' | 'route_info' | 'unknown';
  knowledge_used: string[];
  confidence: number;
  suggest_complaint?: boolean;
  suggest_human?: boolean;
}

// ── Analytics Types ──────────────────────────────────────────

export interface ComplaintAnalytics {
  total_complaints: number;
  open_complaints: number;
  resolved_complaints: number;
  avg_resolution_hours: number | null;
  by_category: { category: string; count: number }[];
  by_route: { route: string; count: number }[];
  by_counter: { counter: string; count: number }[];
  by_priority: { priority: string; count: number }[];
  by_status: { status: string; count: number }[];
  trend_daily: { date: string; count: number }[];
  escalation_rate: number;
  top_issues: { category: string; route: string; count: number }[];
}
