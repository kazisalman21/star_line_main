// ============================================================
// Support Analytics Tab — Complaint data visualization
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Clock, AlertTriangle,
  Activity, PieChart, Loader2,
} from 'lucide-react';
import { useComplaintAnalytics, useComplaintQuickStats } from '@/hooks/useSupport';

export default function SupportAnalyticsTab() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const dateFrom = dateRange === 'all' ? undefined : (() => {
    const d = new Date();
    d.setDate(d.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));
    return d.toISOString();
  })();

  const { data: analytics, isLoading } = useComplaintAnalytics(dateFrom);
  const { data: quickStats } = useComplaintQuickStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Support Analytics
        </h2>
        <div className="flex gap-1.5 bg-secondary/30 p-1 rounded-lg">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === range ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === 'all' ? 'All Time' : range.replace('d', ' Days')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard label="Total" value={analytics?.total_complaints || 0} icon={<BarChart3 className="w-4 h-4" />} />
        <SummaryCard label="Open" value={analytics?.open_complaints || 0} icon={<Clock className="w-4 h-4" />} color="text-amber-400" />
        <SummaryCard label="Resolved" value={analytics?.resolved_complaints || 0} icon={<BarChart3 className="w-4 h-4" />} color="text-green-400" />
        <SummaryCard label="Avg Resolve (hrs)" value={analytics?.avg_resolution_hours ?? 'N/A'} icon={<TrendingUp className="w-4 h-4" />} color="text-cyan-400" />
        <SummaryCard label="Escalation %" value={`${analytics?.escalation_rate || 0}%`} icon={<AlertTriangle className="w-4 h-4" />} color="text-red-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Category */}
        <BarChartSection
          title="By Category"
          data={(analytics?.by_category || []).map(d => ({
            label: d.category.replace(/_/g, ' '),
            value: d.count,
          }))}
          color="bg-primary"
        />

        {/* By Route */}
        <BarChartSection
          title="By Route"
          data={(analytics?.by_route || []).map(d => ({
            label: d.route,
            value: d.count,
          }))}
          color="bg-accent"
        />

        {/* By Priority */}
        <BarChartSection
          title="By Priority"
          data={(analytics?.by_priority || []).map(d => ({
            label: d.priority,
            value: d.count,
          }))}
          color="bg-amber-500"
          colorMap={{
            low: 'bg-muted-foreground',
            medium: 'bg-blue-500',
            high: 'bg-amber-500',
            critical: 'bg-red-500',
          }}
        />

        {/* By Status */}
        <BarChartSection
          title="By Status"
          data={(analytics?.by_status || []).map(d => ({
            label: d.status.replace(/_/g, ' '),
            value: d.count,
          }))}
          color="bg-green-500"
        />
      </div>

      {/* Daily Trend */}
      {analytics?.trend_daily && analytics.trend_daily.length > 0 && (
        <div className="border border-border/30 rounded-xl p-5 bg-card">
          <h3 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Daily Complaint Trend
          </h3>
          <div className="flex items-end gap-0.5 h-32">
            {analytics.trend_daily.slice(-30).map((d, i) => {
              const max = Math.max(...analytics.trend_daily!.map(t => t.count), 1);
              const height = (d.count / max) * 100;
              return (
                <div
                  key={d.date}
                  className="flex-1 group relative"
                  title={`${d.date}: ${d.count} complaints`}
                >
                  <motion.div
                    className="bg-primary/70 hover:bg-primary rounded-t transition-colors w-full absolute bottom-0"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 2)}%` }}
                    transition={{ delay: i * 0.02, duration: 0.3 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{analytics.trend_daily[0]?.date}</span>
            <span>{analytics.trend_daily[analytics.trend_daily.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* By Counter */}
      {analytics?.by_counter && analytics.by_counter.length > 0 && (
        <BarChartSection
          title="By Counter"
          data={analytics.by_counter.map(d => ({
            label: d.counter,
            value: d.count,
          }))}
          color="bg-purple-500"
        />
      )}
    </div>
  );
}

// ── Summary Card ─────────────────────────────────────────────

function SummaryCard({ label, value, icon, color = 'text-foreground' }: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border/30 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`${color} opacity-70`}>{icon}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold font-display ${color}`}>{value}</p>
    </div>
  );
}

// ── Horizontal Bar Chart Section ─────────────────────────────

function BarChartSection({ title, data, color, colorMap }: {
  title: string;
  data: { label: string; value: number }[];
  color: string;
  colorMap?: Record<string, string>;
}) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="border border-border/30 rounded-xl p-5 bg-card">
      <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
        <PieChart className="w-4 h-4 text-primary" />
        {title}
      </h3>
      <div className="space-y-2">
        {data.slice(0, 8).map(d => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-32 truncate capitalize">{d.label}</span>
            <div className="flex-1 h-4 bg-secondary/30 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${colorMap?.[d.label.toLowerCase()] || color}`}
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-mono font-bold w-8 text-right">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
