// ============================================================
// My Complaints — Passenger complaint tracker page
// Adapted from starline-wayfinder, integrated with Supabase
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Clock, CheckCircle2, AlertTriangle,
  ChevronRight, MessageCircle, Phone, ExternalLink,
  FileText, Loader2, Inbox,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { useMyComplaints, useComplaintDetail } from '@/hooks/useSupport';
import { COMPLAINT_STATUS_CONFIG, PRIORITY_CONFIG, COMPLAINT_CATEGORY_LABELS } from '@/constants/support';
import type { Complaint, ComplaintStatus } from '@/types/support';

const statusFilterOptions: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'escalated', label: 'Escalated' },
];

export default function MyComplaints() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: complaints, isLoading } = useMyComplaints();
  const { data: detail } = useComplaintDetail(selectedId);

  // Filter complaints
  const filtered = (complaints || []).filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.complaint_code.toLowerCase().includes(q) ||
        c.route.toLowerCase().includes(q) ||
        c.complaint_text.toLowerCase().includes(q) ||
        (COMPLAINT_CATEGORY_LABELS[c.category] || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="My Complaints" description="Track and manage your Star Line complaints" />
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Hero */}
          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">My Complaints</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track the status of your filed complaints
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, route, or keyword..."
                className="w-full pl-9 pr-4 py-2.5 bg-secondary/40 border border-border/30 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {statusFilterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Inbox className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display font-semibold text-lg mb-1">No complaints found</h3>
              <p className="text-muted-foreground text-sm">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'You haven\'t filed any complaints yet. Use the chat widget to submit one.'}
              </p>
            </div>
          )}

          {/* Complaint List */}
          <div className="space-y-3">
            {filtered.map((complaint, i) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                index={i}
                onClick={() => setSelectedId(complaint.id === selectedId ? null : complaint.id)}
                isSelected={complaint.id === selectedId}
              />
            ))}
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedId && detail && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border border-border/30 rounded-xl overflow-hidden"
              >
                <div className="bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">{detail.complaint_code}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${COMPLAINT_STATUS_CONFIG[detail.status].bgClass}`}>
                      {COMPLAINT_STATUS_CONFIG[detail.status].label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground text-xs">Route</span>
                      <p className="font-medium">{detail.route}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Category</span>
                      <p className="font-medium">{COMPLAINT_CATEGORY_LABELS[detail.category]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Priority</span>
                      <p className={`font-medium ${PRIORITY_CONFIG[detail.priority].color}`}>
                        {PRIORITY_CONFIG[detail.priority].label}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Filed</span>
                      <p className="font-medium">{new Date(detail.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-muted-foreground text-xs">Details</span>
                    <p className="text-sm mt-1 bg-secondary/30 p-3 rounded-lg">{detail.complaint_text}</p>
                  </div>

                  {detail.ai_summary && (
                    <div className="mb-4">
                      <span className="text-muted-foreground text-xs">AI Summary</span>
                      <p className="text-sm mt-1 italic text-muted-foreground">{detail.ai_summary}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {detail.status_history && detail.status_history.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-2">Timeline</span>
                      <div className="space-y-2">
                        {detail.status_history.map(entry => (
                          <div key={entry.id} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">
                                {COMPLAINT_STATUS_CONFIG[entry.new_status as ComplaintStatus]?.label || entry.new_status}
                              </p>
                              {entry.note && <p className="text-muted-foreground text-xs">{entry.note}</p>}
                              <p className="text-muted-foreground/60 text-xs mt-0.5">
                                {new Date(entry.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Complaint Card Component ─────────────────────────────────

function ComplaintCard({
  complaint,
  index,
  onClick,
  isSelected,
}: {
  complaint: Complaint;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  const statusConfig = COMPLAINT_STATUS_CONFIG[complaint.status];
  const priorityConfig = PRIORITY_CONFIG[complaint.priority];

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? 'border-primary/50 bg-primary/5'
          : 'border-border/30 bg-card hover:border-border/50 hover:bg-card/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-primary font-bold">{complaint.complaint_code}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusConfig.bgClass}`}>
              {statusConfig.label}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${priorityConfig.bgClass}`}>
              {priorityConfig.label}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{complaint.route}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {COMPLAINT_CATEGORY_LABELS[complaint.category]} • {new Date(complaint.created_at).toLocaleDateString()}
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
      </div>
    </motion.button>
  );
}
