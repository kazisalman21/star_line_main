// ============================================================
// Star Line — Complaint Analytics Service
// Query-efficient analytics for dashboard charts
// ============================================================

import { supabase } from '@/lib/supabase';
import type { ComplaintAnalytics } from '@/types/support';

// ── Helper: count by field ───────────────────────────────────

async function countByField(
  field: 'category' | 'route' | 'boarding_counter' | 'priority' | 'status',
  dateFrom?: string,
  dateTo?: string
): Promise<{ name: string; count: number }[]> {
  let query = supabase.from('complaints').select('*');

  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error } = await query;
  if (error || !data) return [];

  const counts: Record<string, number> = {};
  for (const row of data) {
    const val = (row[field] as string) || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Full Analytics Dashboard ─────────────────────────────────

export async function getComplaintAnalytics(
  dateFrom?: string,
  dateTo?: string
): Promise<ComplaintAnalytics> {
  const [
    totals,
    byCategory,
    byRoute,
    byCounter,
    byPriority,
    byStatus,
    trendDaily,
    resolutionTime,
  ] = await Promise.all([
    getTotals(dateFrom, dateTo),
    countByField('category', dateFrom, dateTo),
    countByField('route', dateFrom, dateTo),
    countByField('boarding_counter', dateFrom, dateTo),
    countByField('priority', dateFrom, dateTo),
    countByField('status', dateFrom, dateTo),
    getDailyTrend(dateFrom, dateTo),
    getAvgResolutionTime(dateFrom, dateTo),
  ]);

  const escalated = totals.escalated || 0;
  const escalationRate = totals.total > 0 ? (escalated / totals.total) * 100 : 0;

  return {
    total_complaints: totals.total,
    open_complaints: totals.open,
    resolved_complaints: totals.resolved,
    avg_resolution_hours: resolutionTime,
    by_category: byCategory.map(r => ({ category: r.name, count: r.count })),
    by_route: byRoute.map(r => ({ route: r.name, count: r.count })),
    by_counter: byCounter.filter(r => r.name !== 'Unknown').map(r => ({ counter: r.name, count: r.count })),
    by_priority: byPriority.map(r => ({ priority: r.name, count: r.count })),
    by_status: byStatus.map(r => ({ status: r.name, count: r.count })),
    trend_daily: trendDaily,
    escalation_rate: Math.round(escalationRate * 10) / 10,
    top_issues: [],
  };
}

// ── Get Totals ───────────────────────────────────────────────

async function getTotals(dateFrom?: string, dateTo?: string) {
  let query = supabase.from('complaints').select('id, status, escalation_flag');

  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error } = await query;
  if (error) throw new Error(`Analytics totals failed: ${error.message}`);

  const complaints = data || [];
  const openStatuses = ['submitted', 'under_review', 'assigned', 'in_progress', 'awaiting_customer', 'escalated'];

  return {
    total: complaints.length,
    open: complaints.filter(c => openStatuses.includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    escalated: complaints.filter(c => c.escalation_flag).length,
  };
}

// ── Daily Trend ──────────────────────────────────────────────

async function getDailyTrend(
  dateFrom?: string,
  dateTo?: string
): Promise<{ date: string; count: number }[]> {
  const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = dateTo || new Date().toISOString();

  const { data, error } = await supabase
    .from('complaints')
    .select('created_at')
    .gte('created_at', from)
    .lte('created_at', to)
    .order('created_at', { ascending: true });

  if (error) return [];

  const dailyCounts: Record<string, number> = {};
  for (const row of data || []) {
    const date = row.created_at.split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  }

  const result: { date: string; count: number }[] = [];
  const startDate = new Date(from.split('T')[0]);
  const endDate = new Date(to.split('T')[0]);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    result.push({ date: dateStr, count: dailyCounts[dateStr] || 0 });
  }

  return result;
}

// ── Average Resolution Time ──────────────────────────────────

async function getAvgResolutionTime(
  dateFrom?: string,
  dateTo?: string
): Promise<number | null> {
  let query = supabase
    .from('complaints')
    .select('created_at, resolved_at')
    .not('resolved_at', 'is', null);

  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error } = await query;
  if (error || !data || data.length === 0) return null;

  let totalHours = 0;
  let count = 0;

  for (const row of data) {
    if (row.resolved_at) {
      const created = new Date(row.created_at).getTime();
      const resolved = new Date(row.resolved_at).getTime();
      totalHours += (resolved - created) / (1000 * 60 * 60);
      count++;
    }
  }

  return count > 0 ? Math.round((totalHours / count) * 10) / 10 : null;
}

// ── Quick Stats (for overview cards) ─────────────────────────

export async function getQuickStats(): Promise<{
  total: number;
  open: number;
  critical: number;
  todayNew: number;
}> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('complaints')
    .select('id, status, priority, created_at');

  if (error) return { total: 0, open: 0, critical: 0, todayNew: 0 };

  const complaints = data || [];
  const openStatuses = ['submitted', 'under_review', 'assigned', 'in_progress', 'awaiting_customer', 'escalated'];

  return {
    total: complaints.length,
    open: complaints.filter(c => openStatuses.includes(c.status)).length,
    critical: complaints.filter(c => c.priority === 'critical' && openStatuses.includes(c.status)).length,
    todayNew: complaints.filter(c => c.created_at.startsWith(today)).length,
  };
}
