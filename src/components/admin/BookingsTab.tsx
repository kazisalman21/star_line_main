import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Search, Download, Eye, X, Check, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getAdminBookings, updateBookingStatus } from '@/services/adminService';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    confirmed: 'bg-success/15 text-success',
    pending: 'bg-warning/15 text-warning',
    cancelled: 'bg-destructive/15 text-destructive',
    completed: 'bg-info/15 text-info',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

export function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await getAdminBookings({ page, limit, status: statusFilter, search: searchQuery });
    setBookings(result.bookings);
    setTotal(result.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  // Handle search dynamically with a small delay (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    await updateBookingStatus(id, 'cancelled');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Booking Management</h2>
          <p className="text-sm text-muted-foreground">{total} total bookings</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search passenger or PNR..." className="pl-9 bg-secondary/50 border-border/40 sm:w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md bg-secondary/50 border border-input text-sm outline-none focus:ring-2 focus:ring-primary/40">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <Button variant="outline" className="hidden sm:inline-flex shrink-0"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="text-muted-foreground"><Ticket className="w-4 h-4" /></TableHead>
              <TableHead className="text-muted-foreground">Passenger</TableHead>
              <TableHead className="text-muted-foreground hidden md:table-cell">Trip Route & Date</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></TableCell></TableRow>
            ) : bookings.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No bookings found matching criteria.</TableCell></TableRow>
            ) : bookings.map((booking, i) => {
              const schedule = booking.schedules || {};
              const route = schedule.routes || {};
              const pnr = `STR-${booking.id.slice(0, 8).toUpperCase()}`;

              return (
                <motion.tr key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-border/20 hover:bg-secondary/20">
                  <TableCell>
                    <div className="font-mono text-xs text-primary font-bold tracking-wider">{pnr}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(booking.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{booking.passenger_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{booking.passenger_phone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm font-medium">{route.origin || '?'} <span className="text-muted-foreground">→</span> {route.destination || '?'}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{booking.travel_date} at {schedule.departure_time?.slice(0, 5)}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-medium text-sm">৳{booking.total_fare.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${statusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedItem({ ...booking, pnr, route }); setShowViewDialog(true); }}><Eye className="w-4 h-4" /></Button>
                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleCancel(booking.id)} title="Cancel Booking"><X className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between p-4 border-t border-border/20 text-sm">
            <div className="text-muted-foreground">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page * limit >= total}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="glass-card border-border/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Booking Details</DialogTitle>
            <DialogDescription>PNR: {selectedItem?.pnr}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 text-sm mt-2">
              <div className="flex justify-between pb-3 border-b border-border/20">
                <span className="text-muted-foreground">Passenger:</span>
                <span className="font-medium text-right">{selectedItem.passenger_name}<br /><span className="text-xs text-muted-foreground font-normal">{selectedItem.passenger_phone}</span></span>
              </div>
              <div className="flex justify-between pb-3 border-b border-border/20">
                <span className="text-muted-foreground">Route:</span>
                <span className="font-medium text-right">{selectedItem.route.origin || '?'} → {selectedItem.route.destination || '?'}<br /><span className="text-xs text-muted-foreground font-normal">{selectedItem.travel_date} at {selectedItem.schedules?.departure_time?.slice(0, 5)}</span></span>
              </div>
              <div className="flex justify-between pb-3 border-b border-border/20">
                <span className="text-muted-foreground">Bus Details:</span>
                <span className="font-medium text-right">{selectedItem.schedules?.buses?.name || 'Assigned Coach'}<br /><span className="text-xs text-muted-foreground font-normal">{selectedItem.schedules?.buses?.type || 'AC'}</span></span>
              </div>
              <div className="flex justify-between pb-3 border-b border-border/20">
                <span className="text-muted-foreground">Boarding / Dropping:</span>
                <span className="font-medium text-right">{selectedItem.boarding_point || 'Main Terminal'}<br /><span className="text-xs text-muted-foreground font-normal">{selectedItem.dropping_point || 'Main Terminal'}</span></span>
              </div>
              <div className="flex justify-between items-center py-2 bg-secondary/30 px-3 rounded-lg">
                <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Total Amount</span>
                <span className="font-bold text-primary text-xl">৳{selectedItem.total_fare.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
