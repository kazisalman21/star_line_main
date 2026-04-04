// ============================================================
// Star Line Support — Constants & Configuration
// ============================================================

import type {
  ComplaintCategory, ComplaintStatus, ComplaintPriority,
  KnowledgeCategory, SentimentMarker,
} from '@/types/support';

// ── Complaint Category Labels ────────────────────────────────

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  bus_delay: 'Bus Delay',
  payment_issue: 'Payment Issue',
  booking_issue: 'Booking Issue',
  staff_behavior: 'Staff Behavior',
  counter_service: 'Counter Service',
  seat_or_bus_issue: 'Seat / Bus Issue',
  refund_or_cancellation: 'Refund / Cancellation',
  lost_item: 'Lost Item',
  technical_issue: 'Technical / App Issue',
  other: 'Other',
};

export const COMPLAINT_CATEGORIES = Object.keys(COMPLAINT_CATEGORY_LABELS) as ComplaintCategory[];

// ── Status Config ────────────────────────────────────────────

export const COMPLAINT_STATUS_CONFIG: Record<ComplaintStatus, {
  label: string;
  color: string;
  bgClass: string;
}> = {
  submitted: { label: 'Submitted', color: 'text-blue-400', bgClass: 'bg-blue-500/15 text-blue-400' },
  under_review: { label: 'Under Review', color: 'text-amber-400', bgClass: 'bg-amber-500/15 text-amber-400' },
  assigned: { label: 'Assigned', color: 'text-purple-400', bgClass: 'bg-purple-500/15 text-purple-400' },
  in_progress: { label: 'In Progress', color: 'text-accent', bgClass: 'bg-accent/15 text-accent' },
  awaiting_customer: { label: 'Awaiting Customer', color: 'text-cyan-400', bgClass: 'bg-cyan-500/15 text-cyan-400' },
  resolved: { label: 'Resolved', color: 'text-green-400', bgClass: 'bg-green-500/15 text-green-400' },
  closed: { label: 'Closed', color: 'text-muted-foreground', bgClass: 'bg-muted-foreground/15 text-muted-foreground' },
  escalated: { label: 'Escalated', color: 'text-red-400', bgClass: 'bg-red-500/15 text-red-400' },
};

export const COMPLAINT_STATUSES = Object.keys(COMPLAINT_STATUS_CONFIG) as ComplaintStatus[];

// ── Priority Config ──────────────────────────────────────────

export const PRIORITY_CONFIG: Record<ComplaintPriority, {
  label: string;
  color: string;
  bgClass: string;
  weight: number;
}> = {
  low: { label: 'Low', color: 'text-muted-foreground', bgClass: 'bg-muted-foreground/15 text-muted-foreground', weight: 1 },
  medium: { label: 'Medium', color: 'text-blue-400', bgClass: 'bg-blue-500/15 text-blue-400', weight: 2 },
  high: { label: 'High', color: 'text-amber-400', bgClass: 'bg-amber-500/15 text-amber-400', weight: 3 },
  critical: { label: 'Critical', color: 'text-red-400', bgClass: 'bg-red-500/15 text-red-400', weight: 4 },
};

// ── Valid Status Transitions ─────────────────────────────────

export const VALID_STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  submitted: ['under_review', 'assigned', 'escalated', 'closed'],
  under_review: ['assigned', 'in_progress', 'escalated', 'closed'],
  assigned: ['in_progress', 'under_review', 'escalated', 'closed'],
  in_progress: ['awaiting_customer', 'resolved', 'escalated'],
  awaiting_customer: ['in_progress', 'resolved', 'closed'],
  resolved: ['closed', 'in_progress'],
  escalated: ['assigned', 'in_progress', 'resolved', 'closed'],
  closed: [],
};

// ── Escalation Rules (deterministic) ─────────────────────────

export const AUTO_ESCALATION_RULES: {
  condition: string;
  check: (complaint: { category: ComplaintCategory; priority: ComplaintPriority; complaint_text: string }) => boolean;
}[] = [
  {
    condition: 'Payment deducted but no ticket',
    check: (c) => c.category === 'payment_issue' && c.complaint_text.toLowerCase().includes('deducted'),
  },
  {
    condition: 'Safety concern',
    check: (c) => ['staff_behavior'].includes(c.category) &&
      /harass|assault|threat|danger|unsafe|safety/i.test(c.complaint_text),
  },
  {
    condition: 'Critical priority',
    check: (c) => c.priority === 'critical',
  },
  {
    condition: 'Stranded passenger',
    check: (c) => /strand|stuck|abandon|left behind/i.test(c.complaint_text),
  },
  {
    condition: 'Repeated disruption',
    check: (c) => /again|every time|always|third time|repeatedly/i.test(c.complaint_text),
  },
];

// ── Star Line Routes ─────────────────────────────────────────

export const STARLINE_ROUTES = [
  'Dhaka → Feni', 'Feni → Dhaka',
  'Dhaka → Chattogram', 'Chattogram → Dhaka',
  'Dhaka → Cox\'s Bazar', 'Cox\'s Bazar → Dhaka',
  'Feni → Chattogram', 'Chattogram → Feni',
  'Feni → Cox\'s Bazar', 'Cox\'s Bazar → Feni',
  'Feni → Lakshmipur', 'Lakshmipur → Feni',
] as const;

// ── Star Line Counters ───────────────────────────────────────

export const STARLINE_COUNTERS = [
  'Abdullahpur', 'Mohipal Main', 'Mohipal Flyover', 'Sayedabad',
  'Maniknagar', 'Kanchpur', 'Chauddagram', 'Cheora',
  'Feni Terminal', 'Boropol (Chittagong)', 'Sea Hill (Cox\'s Bazar)',
  'Lakshmipur Terminal',
] as const;

// ── Staff Members ────────────────────────────────────────────

export const SUPPORT_STAFF = [
  'Tariq Uddin', 'Md. Nasir', 'Rezaul Karim', 'Sabbir Hasan', 'Arif Rahman',
] as const;

// ── Sentiment Config ─────────────────────────────────────────

export const SENTIMENT_CONFIG: Record<SentimentMarker, { emoji: string; label: string; color: string }> = {
  positive: { emoji: '😊', label: 'Positive', color: 'text-green-400' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-muted-foreground' },
  negative: { emoji: '😞', label: 'Negative', color: 'text-amber-400' },
  angry: { emoji: '😡', label: 'Angry', color: 'text-red-400' },
  distressed: { emoji: '😰', label: 'Distressed', color: 'text-red-500' },
};

// ── Knowledge Category Config ────────────────────────────────

export const KNOWLEDGE_CATEGORY_CONFIG: Record<KnowledgeCategory, { icon: string; label: string }> = {
  booking: { icon: '🎫', label: 'Booking' },
  payment: { icon: '💳', label: 'Payment' },
  refund: { icon: '💰', label: 'Refund' },
  route: { icon: '🛣️', label: 'Routes' },
  counter: { icon: '📍', label: 'Counters' },
  baggage: { icon: '🧳', label: 'Baggage' },
  schedule: { icon: '🕐', label: 'Schedule' },
  general: { icon: '📋', label: 'General' },
  policy: { icon: '📜', label: 'Policy' },
  safety: { icon: '🛡️', label: 'Safety' },
  escalation: { icon: '🚨', label: 'Escalation' },
};

// ── Chat Suggestion Chips ────────────────────────────────────

export const CHAT_SUGGESTION_CHIPS = [
  'Track my issue', 'Booking help', 'Refund / cancel', 'Payment problem',
  'Bus delayed', 'Counter information', 'Talk to support', 'Submit complaint',
] as const;

// ── Complaint Intake Steps ───────────────────────────────────

export const COMPLAINT_INTAKE_STEPS = [
  { key: 'name', label: 'Your Full Name', type: 'text' as const, placeholder: 'e.g. Rahim Uddin', required: true },
  { key: 'phone', label: 'Phone Number', type: 'text' as const, placeholder: 'e.g. 01712345678', required: true },
  { key: 'route', label: 'Route', type: 'select' as const, options: [...STARLINE_ROUTES], required: true },
  { key: 'travelDate', label: 'Travel Date', type: 'date' as const, required: false },
  { key: 'counter', label: 'Boarding Counter', type: 'select' as const, options: [...STARLINE_COUNTERS], required: false },
  { key: 'category', label: 'Issue Category', type: 'chips' as const, options: Object.values(COMPLAINT_CATEGORY_LABELS), required: true },
  { key: 'details', label: 'Complaint Details', type: 'textarea' as const, placeholder: 'Describe your issue in detail...', required: true },
  { key: 'urgency', label: 'Urgency Level', type: 'chips' as const, options: ['Low', 'Medium', 'High', 'Critical'], required: true },
  { key: 'confirm', label: 'Confirm Submission', type: 'confirm' as const, required: true },
] as const;
