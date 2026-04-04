import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bus, Building2, Route, Ticket, UserCog, Settings, Calendar, Users, ShieldCheck, MessageSquare, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

// Import tab components
import { OverviewTab } from '@/components/admin/OverviewTab';
import { FleetTab } from '@/components/admin/FleetTab';
import CounterManagementSection from '@/components/admin/CounterManagementSection';
import RouteManagementSection from '@/components/admin/RouteManagementSection';
import { BookingsTab } from '@/components/admin/BookingsTab';
import { SchedulesTab } from '@/components/admin/SchedulesTab';
import { DriversTab } from '@/components/admin/DriversTab';
import { StaffTab } from '@/components/admin/StaffTab';
import { SupervisorTab } from '@/components/admin/SupervisorTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import AdminComplaintsTab from '@/components/support/AdminComplaintsTab';
import SupportAnalyticsTab from '@/components/support/SupportAnalyticsTab';

type AdminTab = 'overview' | 'fleet' | 'counters' | 'routes' | 'schedules' | 'bookings' | 'drivers' | 'staff' | 'supervisors' | 'complaints' | 'analytics' | 'settings';

const adminTabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'fleet', label: 'Fleet', icon: Bus },
  { id: 'counters', label: 'Counters', icon: Building2 },
  { id: 'routes', label: 'Routes', icon: Route },
  { id: 'schedules', label: 'Schedules', icon: Calendar },
  { id: 'bookings', label: 'Bookings', icon: Ticket },
  { id: 'drivers', label: 'Drivers', icon: UserCog },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'supervisors', label: 'Supervisors', icon: ShieldCheck },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'fleet': return <FleetTab />;
      case 'counters': return <CounterManagementSection />;
      case 'routes': return <RouteManagementSection />;
      case 'schedules': return <SchedulesTab />;
      case 'bookings': return <BookingsTab />;
      case 'drivers': return <DriversTab />;
      case 'staff': return <StaffTab />;
      case 'supervisors': return <SupervisorTab />;
      case 'complaints': return <AdminComplaintsTab />;
      case 'analytics': return <SupportAnalyticsTab />;
      case 'settings': return <SettingsTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Operations Dashboard" description="Star Line Group operations command center — real-time analytics and management." />
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground text-sm mt-1">Starline command center — manage everything</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Status</div>
              <div className="inline-flex items-center gap-1.5 bg-success/15 text-success px-2.5 py-1 rounded-md text-xs font-bold leading-none uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Live Sync
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1.5 mb-8 overflow-x-auto scrollbar-hide bg-secondary/30 p-1.5 rounded-xl border border-border/30">
            {adminTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="admin-tab-bg"
                    className="absolute inset-0 bg-primary rounded-lg shadow-md"
                    style={{ zIndex: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
