// ============================================================
// Admin Complaints Tab — Manage all complaints
// Adapted from starline-wayfinder, integrated with Supabase
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, UserPlus, Clock, CheckCircle2,
  AlertTriangle, ChevronDown, MessageSquare, Loader2,
  BarChart3, TrendingUp, Inbox, X,
} from 'lucide-react';
import { useAdminComplaints, useUpdateComplaintStatus, useAssignComplaint, useAddInternalNote, useComplaintDetail } from '@/hooks/useSupport';
import { COMPLAINT_STATUS_CONFIG, COMPLAINT_CATEGORY_LABELS, PRIORITY_CONFIG, COMPLAINT_STATUSES, COMPLAINT_CATEGORIES, VALID_STATUS_TRANSITIONS, STARLINE_ROUTES } from '@/constants/support';
import type { AdminComplaintFilters, ComplaintStatus, ComplaintCategory, Complaint } from '@/types/support';

export default function AdminComplaintsTab() {
  const [filters, setFilters] = useState<AdminComplaintFilters>({
    sort_by: 'newest',
    page: 1,
    per_page: 15,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const { data, isLoading } = useAdminComplaints(filters);
  const { data: detail } = useComplaintDetail(selectedId, true);
  const updateStatus = useUpdateComplaintStatus();
  const assignComplaint = useAssignComplaint();
  const addNote = useAddInternalNote();

  const complaints = data?.complaints || [];
  const totalPages = data?.total_pages || 1;

  // Stats cards
  const openCount = complaints.filter(c => !['resolved', 'closed'].includes(c.status)).length;
  const criticalCount = complaints.filter(c => c.priority === 'critical' || c.escalation_flag).length;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={data?.total || 0} icon={<BarChart3 className="w-4 h-4" />} color="text-foreground" />
        <StatCard label="Open" value={openCount} icon={<Clock className="w-4 h-4" />} color="text-amber-400" />
        <StatCard label="Critical" value={criticalCount} icon={<AlertTriangle className="w-4 h-4" />} color="text-red-400" />
        <StatCard label="Resolved" value={complaints.filter(c => c.status === 'resolved').length} icon={<CheckCircle2 className="w-4 h-4" />} color="text-green-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            placeholder="Search complaints..."
            className="w-full pl-9 pr-4 py-2 bg-secondary/40 border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <select
          value={filters.status || ''}
          onChange={e => setFilters(f => ({ ...f, status: (e.target.value || undefined) as ComplaintStatus | undefined, page: 1 }))}
          className="px-3 py-2 bg-secondary/40 border border-border/30 rounded-lg text-sm"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          {COMPLAINT_STATUSES.map(s => (
            <option key={s} value={s}>{COMPLAINT_STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <select
          value={filters.category || ''}
          onChange={e => setFilters(f => ({ ...f, category: (e.target.value || undefined) as ComplaintCategory | undefined, page: 1 }))}
          className="px-3 py-2 bg-secondary/40 border border-border/30 rounded-lg text-sm"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {COMPLAINT_CATEGORIES.map(c => (
            <option key={c} value={c}>{COMPLAINT_CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <select
          value={filters.priority || ''}
          onChange={e => setFilters(f => ({ ...f, priority: (e.target.value || undefined) as any, page: 1 }))}
          className="px-3 py-2 bg-secondary/40 border border-border/30 rounded-lg text-sm"
          aria-label="Filter by priority"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={filters.sort_by || 'newest'}
          onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value as any }))}
          className="px-3 py-2 bg-secondary/40 border border-border/30 rounded-lg text-sm"
          aria-label="Sort order"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Priority</option>
          <option value="unresolved">Unresolved</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && complaints.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No complaints match your filters</p>
        </div>
      )}

      {/* Complaint Table */}
      {!isLoading && complaints.length > 0 && (
        <div className="border border-border/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/20">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Route</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                    className={`border-b border-border/10 cursor-pointer transition-colors ${
                      c.id === selectedId ? 'bg-primary/5' : 'hover:bg-secondary/30'
                    } ${c.escalation_flag ? 'border-l-2 border-l-red-500' : ''}`}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-primary font-bold">{c.complaint_code}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{c.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">{c.route}</td>
                    <td className="py-3 px-4 text-xs">{COMPLAINT_CATEGORY_LABELS[c.category]}</td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${PRIORITY_CONFIG[c.priority].bgClass}`}>
                        {PRIORITY_CONFIG[c.priority].label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${COMPLAINT_STATUS_CONFIG[c.status].bgClass}`}>
                        {COMPLAINT_STATUS_CONFIG[c.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
            disabled={(filters.page || 1) <= 1}
            className="px-3 py-1.5 text-xs rounded-lg bg-secondary/40 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1} of {totalPages}
          </span>
          <button
            onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages, (f.page || 1) + 1) }))}
            disabled={(filters.page || 1) >= totalPages}
            className="px-3 py-1.5 text-xs rounded-lg bg-secondary/40 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedId && detail && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border border-border/30 rounded-xl bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg">{detail.complaint_code}</h3>
                <p className="text-sm text-muted-foreground">{detail.customer_name} • {detail.phone}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-secondary rounded" aria-label="Close detail panel">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Details */}
              <div className="space-y-4">
                <div className="bg-secondary/30 p-3 rounded-lg text-sm">{detail.complaint_text}</div>

                {detail.ai_summary && (
                  <div className="text-xs text-muted-foreground italic">
                    <strong>AI Summary:</strong> {detail.ai_summary}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs block">Route</span>{detail.route}</div>
                  <div><span className="text-muted-foreground text-xs block">Category</span>{COMPLAINT_CATEGORY_LABELS[detail.category]}</div>
                  <div><span className="text-muted-foreground text-xs block">Travel Date</span>{detail.travel_date || 'N/A'}</div>
                  <div><span className="text-muted-foreground text-xs block">Counter</span>{detail.boarding_counter || 'N/A'}</div>
                </div>

                {/* Status Change */}
                <div>
                  <span className="text-muted-foreground text-xs block mb-1">Change Status</span>
                  <div className="flex flex-wrap gap-1.5">
                    {VALID_STATUS_TRANSITIONS[detail.status]?.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus.mutate({ complaintId: detail.id, newStatus: s })}
                        disabled={updateStatus.isPending}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${COMPLAINT_STATUS_CONFIG[s].bgClass} hover:opacity-80`}
                      >
                        → {COMPLAINT_STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Timeline & Notes */}
              <div className="space-y-4">
                {/* Timeline */}
                <div>
                  <span className="text-muted-foreground text-xs block mb-2">Timeline</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(detail.status_history || []).map(entry => (
                      <div key={entry.id} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium">{COMPLAINT_STATUS_CONFIG[entry.new_status as ComplaintStatus]?.label || entry.new_status}</span>
                          {entry.note && <span className="text-muted-foreground ml-1">— {entry.note}</span>}
                          <span className="text-muted-foreground/60 block">{new Date(entry.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <span className="text-muted-foreground text-xs block mb-2">Internal Notes</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                    {(detail.internal_notes || []).map(note => (
                      <div key={note.id} className="bg-amber-500/5 border border-amber-500/10 p-2 rounded text-xs">
                        <p>{note.note}</p>
                        <p className="text-muted-foreground/60 mt-1">{new Date(note.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                    {(!detail.internal_notes || detail.internal_notes.length === 0) && (
                      <p className="text-xs text-muted-foreground/50 italic">No notes yet</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add internal note..."
                      className="flex-1 px-2.5 py-1.5 bg-secondary/40 border border-border/30 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => {
                        if (noteText.trim()) {
                          addNote.mutate({ complaintId: detail.id, note: noteText.trim() });
                          setNoteText('');
                        }
                      }}
                      disabled={!noteText.trim() || addNote.isPending}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
    </div>
  );
}
