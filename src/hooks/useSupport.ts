// ============================================================
// Star Line — React Query Hooks for Support System
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  createComplaint,
  getUserComplaints,
  getComplaintDetail,
  listComplaints,
  updateComplaintStatus,
  assignComplaint,
  addInternalNote,
} from '@/lib/complaints/complaint.service';
import {
  createSession,
  getOrCreateSession,
  getChatHistory,
  addMessage,
} from '@/lib/support/chat.service';
import {
  searchKnowledge,
  getKnowledgeByCategory,
  getAllKnowledge,
} from '@/lib/support/knowledge.service';
import {
  getSupportResponse,
  classifyComplaint,
} from '@/lib/ai/gemini.service';
import {
  getComplaintAnalytics,
  getQuickStats,
} from '@/lib/analytics/complaint.analytics';
import type {
  CreateComplaintRequest,
  AdminComplaintFilters,
  ComplaintStatus,
  KnowledgeCategory,
} from '@/types/support';
import { createComplaintSchema } from '@/lib/validation/support.schemas';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// COMPLAINT HOOKS
// ═══════════════════════════════════════════════════════════════

/** Fetch current user's complaints */
export function useMyComplaints() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['complaints', 'mine', user?.id],
    queryFn: () => getUserComplaints(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

/** Fetch a single complaint with all relations */
export function useComplaintDetail(complaintId: string | null, includeNotes = false) {
  return useQuery({
    queryKey: ['complaint', complaintId, includeNotes],
    queryFn: () => getComplaintDetail(complaintId!, includeNotes),
    enabled: !!complaintId,
    staleTime: 15_000,
  });
}

/** Create a new complaint */
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateComplaintRequest) => {
      // Validate input
      const validated = createComplaintSchema.parse(input);

      // Classify with AI (best-effort)
      let classification;
      try {
        classification = await classifyComplaint(
          validated.complaint_text,
          `Category: ${validated.category}, Route: ${validated.route}`
        );
      } catch {
        // Continue without AI classification
      }

      return createComplaint(validated as CreateComplaintRequest, classification);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success(`Complaint submitted: ${result.complaint_code}`, {
        description: 'We will review your complaint and get back to you shortly.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit complaint', { description: error.message });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ADMIN COMPLAINT HOOKS
// ═══════════════════════════════════════════════════════════════

/** Admin: list complaints with filters and pagination */
export function useAdminComplaints(filters: AdminComplaintFilters) {
  return useQuery({
    queryKey: ['complaints', 'admin', filters],
    queryFn: () => listComplaints(filters),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}

/** Admin: update complaint status */
export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ complaintId, newStatus, note }: {
      complaintId: string;
      newStatus: ComplaintStatus;
      note?: string;
    }) => updateComplaintStatus(complaintId, newStatus, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
      toast.success('Status updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });
}

/** Admin: assign complaint to staff */
export function useAssignComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ complaintId, assignedTo }: {
      complaintId: string;
      assignedTo: string;
    }) => assignComplaint(complaintId, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
      toast.success('Complaint assigned successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to assign', { description: error.message });
    },
  });
}

/** Admin: add internal note */
export function useAddInternalNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ complaintId, note, isPrivate }: {
      complaintId: string;
      note: string;
      isPrivate?: boolean;
    }) => addInternalNote(complaintId, user!.id, note, isPrivate),
    onSuccess: (_, { complaintId }) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
      toast.success('Note added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add note', { description: error.message });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// CHAT HOOKS
// ═══════════════════════════════════════════════════════════════

/** Get or create a support chat session */
export function useSupportSession() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['support-session', user?.id],
    queryFn: () => getOrCreateSession(user?.id, 'web'),
    staleTime: 5 * 60_000,
  });
}

/** Fetch chat history for a session */
export function useChatHistory(sessionId: string | null) {
  return useQuery({
    queryKey: ['chat-history', sessionId],
    queryFn: () => getChatHistory(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 10_000,
  });
}

/** Send a message and get AI response */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      message,
      conversationHistory,
      userId,
    }: {
      sessionId: string;
      message: string;
      conversationHistory: { role: string; content: string }[];
      userId?: string;
    }) => {
      // Save user message
      const userMsg = await addMessage(sessionId, 'user', message);

      // Get AI response
      const aiResponse = await getSupportResponse(message, conversationHistory, userId);

      // Save AI response
      const aiMsg = await addMessage(sessionId, 'ai', aiResponse.reply, 'normal', {
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggest_complaint: aiResponse.suggest_complaint,
        suggest_human: aiResponse.suggest_human,
      });

      return { userMessage: userMsg, aiMessage: aiMsg, aiResponse };
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', sessionId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to send message', { description: error.message });
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE BASE HOOKS
// ═══════════════════════════════════════════════════════════════

/** Search knowledge base */
export function useKnowledgeSearch(query: string, category?: KnowledgeCategory) {
  return useQuery({
    queryKey: ['knowledge', 'search', query, category],
    queryFn: () => searchKnowledge(query, category),
    enabled: query.length >= 2,
    staleTime: 60_000,
  });
}

/** Get knowledge by category */
export function useKnowledgeByCategory(category: KnowledgeCategory) {
  return useQuery({
    queryKey: ['knowledge', 'category', category],
    queryFn: () => getKnowledgeByCategory(category),
    staleTime: 5 * 60_000,
  });
}

/** Admin: all knowledge entries */
export function useAllKnowledge() {
  return useQuery({
    queryKey: ['knowledge', 'all'],
    queryFn: getAllKnowledge,
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS HOOKS
// ═══════════════════════════════════════════════════════════════

/** Full complaint analytics */
export function useComplaintAnalytics(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['analytics', 'complaints', dateFrom, dateTo],
    queryFn: () => getComplaintAnalytics(dateFrom, dateTo),
    staleTime: 60_000,
  });
}

/** Quick stats for overview cards */
export function useComplaintQuickStats() {
  return useQuery({
    queryKey: ['analytics', 'quick-stats'],
    queryFn: getQuickStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
