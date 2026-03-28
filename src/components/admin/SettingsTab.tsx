import { motion } from 'framer-motion';
import { Building2, DollarSign, Mail, Shield, Calendar, Wrench, ChevronRight } from 'lucide-react';

const settingsCards = [
  { title: 'Company Profile', desc: 'Update Star Line Group brand details, logo, and contact info', icon: Building2 },
  { title: 'Fare Configuration', desc: 'Set base fares, peak pricing, and discount rules per route', icon: DollarSign },
  { title: 'Notification Settings', desc: 'SMS/email templates for booking, cancellation, and delay alerts', icon: Mail },
  { title: 'Access Control', desc: 'Manage admin roles, permissions, and staff accounts', icon: Shield },
  { title: 'Scheduling', desc: 'Configure departure schedules, seasonal timetables, and holidays', icon: Calendar },
  { title: 'Maintenance Alerts', desc: 'Set service intervals, mileage thresholds, and inspection reminders', icon: Wrench },
];

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold">System Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {settingsCards.map((setting, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-5 card-hover cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <setting.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{setting.title}</div>
                <div className="text-xs text-muted-foreground">{setting.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
