import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card/60 border-t border-border/40">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Bus className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-base">Star Line</span>
                <span className="text-[9px] font-medium text-accent tracking-[0.15em] uppercase">Group</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bangladesh's premium intercity coach service. Travel in comfort, arrive with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[['/', 'Home'], ['/search', 'Search Trips'], ['/routes', 'Routes & Fleet'], ['/manage-booking', 'Manage Booking']].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">Support</h4>
            <div className="flex flex-col gap-2.5">
              {[['/support', 'Help Center'], ['/support', 'Cancellation Policy'], ['/support', 'Baggage Info'], ['/support', 'Contact Us']].map(([to, label], i) => (
                <Link key={i} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">Contact</h4>
            <div className="flex flex-col gap-3.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-primary" /> 16XXX (Hotline)</div>
              <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-primary" /> support@starline.com.bd</div>
              <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-primary" /> Dhaka, Bangladesh</div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/30 text-center text-xs text-muted-foreground">
          © 2026 Star Line Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
