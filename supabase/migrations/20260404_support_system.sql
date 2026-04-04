-- ============================================================
-- Star Line AI Customer Care + Complaint Management
-- Migration: Support System Tables
-- Run in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- ENUMS (using CHECK constraints for Supabase compatibility)
-- ============================================================

-- ============================================================
-- 1. SUPPORT_SESSIONS — chat session tracking
-- ============================================================
CREATE TABLE support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'expired')),
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_sessions_user ON support_sessions(user_id);
CREATE INDEX idx_support_sessions_token ON support_sessions(session_token);
CREATE INDEX idx_support_sessions_status ON support_sessions(status);

-- ============================================================
-- 2. SUPPORT_MESSAGES — conversation log
-- ============================================================
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES support_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'admin', 'system')),
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'normal' CHECK (
    message_type IN ('normal', 'complaint_collection', 'system', 'summary', 'chips', 'confirmation')
  ),
  structured_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_messages_session ON support_messages(session_id);
CREATE INDEX idx_support_messages_created ON support_messages(created_at);

-- ============================================================
-- 3. COMPLAINTS — full complaint records
-- ============================================================
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  route TEXT NOT NULL,
  travel_date DATE,
  boarding_counter TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'bus_delay', 'payment_issue', 'booking_issue', 'staff_behavior',
    'counter_service', 'seat_or_bus_issue', 'refund_or_cancellation',
    'lost_item', 'technical_issue', 'other'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'assigned', 'in_progress',
    'awaiting_customer', 'resolved', 'closed', 'escalated'
  )),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  complaint_text TEXT NOT NULL,
  ai_summary TEXT,
  sentiment_marker TEXT CHECK (sentiment_marker IN ('positive', 'neutral', 'negative', 'angry', 'distressed')),
  requires_human_review BOOLEAN NOT NULL DEFAULT false,
  escalation_flag BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source_session_id UUID REFERENCES support_sessions(id) ON DELETE SET NULL,
  preferred_contact_method TEXT DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'chat')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_complaints_code ON complaints(complaint_code);
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_route ON complaints(route);
CREATE INDEX idx_complaints_assigned ON complaints(assigned_to);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaints_escalation ON complaints(escalation_flag) WHERE escalation_flag = true;

-- Auto-update updated_at
CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. COMPLAINT_STATUS_HISTORY — audit trail
-- ============================================================
CREATE TABLE complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_by_type TEXT NOT NULL DEFAULT 'system' CHECK (changed_by_type IN ('system', 'admin', 'customer', 'ai')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaint_history_complaint ON complaint_status_history(complaint_id);
CREATE INDEX idx_complaint_history_created ON complaint_status_history(created_at);

-- ============================================================
-- 5. COMPLAINT_INTERNAL_NOTES — staff-only notes
-- ============================================================
CREATE TABLE complaint_internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_internal_notes_complaint ON complaint_internal_notes(complaint_id);

-- ============================================================
-- 6. KNOWLEDGE_BASE — controlled support answers
-- ============================================================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'booking', 'payment', 'refund', 'route', 'counter',
    'baggage', 'schedule', 'general', 'policy', 'safety', 'escalation'
  )),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'official' CHECK (source_type IN ('official', 'faq', 'policy', 'guide')),
  confidence REAL NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX idx_knowledge_base_search ON knowledge_base USING GIN(search_vector);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING GIN(tags);

-- Auto-generate search vector for full-text search
CREATE OR REPLACE FUNCTION knowledge_base_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.question, '') || ' ' ||
    COALESCE(NEW.answer, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_base_search_update
  BEFORE INSERT OR UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION knowledge_base_search_trigger();

CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 7. COMPLAINT_CODE SEQUENCE — auto-increment complaint codes
-- ============================================================
CREATE SEQUENCE complaint_code_seq START 1000;

CREATE OR REPLACE FUNCTION generate_complaint_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  code := 'STC-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('complaint_code_seq')::TEXT, 6, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- SUPPORT_SESSIONS
ALTER TABLE support_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
  ON support_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create sessions"
  ON support_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users update own sessions"
  ON support_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all sessions"
  ON support_sessions FOR ALL
  USING (is_admin());

-- SUPPORT_MESSAGES
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view messages in own sessions"
  ON support_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM support_sessions
    WHERE support_sessions.id = session_id
    AND (support_sessions.user_id = auth.uid() OR is_admin())
  ));

CREATE POLICY "Anyone can create messages"
  ON support_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins manage all messages"
  ON support_messages FOR ALL
  USING (is_admin());

-- COMPLAINTS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own complaints"
  ON complaints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins manage all complaints"
  ON complaints FOR ALL
  USING (is_admin());

-- COMPLAINT_STATUS_HISTORY
ALTER TABLE complaint_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own complaint history"
  ON complaint_status_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_id
    AND complaints.user_id = auth.uid()
  ));

CREATE POLICY "Admins manage complaint history"
  ON complaint_status_history FOR ALL
  USING (is_admin());

-- COMPLAINT_INTERNAL_NOTES (admin-only)
ALTER TABLE complaint_internal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage internal notes"
  ON complaint_internal_notes FOR ALL
  USING (is_admin());

-- KNOWLEDGE_BASE (public read, admin write)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active knowledge base"
  ON knowledge_base FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage knowledge base"
  ON knowledge_base FOR ALL
  USING (is_admin());

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- ============================================================
-- HELPER: Safe status transition validation
-- ============================================================
CREATE OR REPLACE FUNCTION validate_complaint_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "submitted": ["under_review", "assigned", "escalated", "closed"],
    "under_review": ["assigned", "in_progress", "escalated", "closed"],
    "assigned": ["in_progress", "under_review", "escalated", "closed"],
    "in_progress": ["awaiting_customer", "resolved", "escalated"],
    "awaiting_customer": ["in_progress", "resolved", "closed"],
    "resolved": ["closed", "in_progress"],
    "escalated": ["assigned", "in_progress", "resolved", "closed"],
    "closed": []
  }'::JSONB;
  allowed JSONB;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  allowed := valid_transitions -> OLD.status;

  IF allowed IS NULL OR NOT (allowed ? NEW.status) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  -- Auto-set resolved_at
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaint_status_transition
  BEFORE UPDATE OF status ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION validate_complaint_status_transition();

-- Auto-create status history on status change
CREATE OR REPLACE FUNCTION log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, note)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), 'Status changed to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER complaint_status_history_trigger
  AFTER UPDATE OF status ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION log_complaint_status_change();
