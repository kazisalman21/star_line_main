import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Bus className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Starline</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bangladesh's premium intercity bus service. Travel in comfort, arrive with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[['/', 'Home'], ['/search', 'Search Trips'], ['/routes', 'Routes & Fleet'], ['/manage-booking', 'Manage Booking']].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <div className="flex flex-col gap-2">
              {[['/support', 'Help Center'], ['/support', 'Cancellation Policy'], ['/support', 'Baggage Info'], ['/support', 'Contact Us']].map(([to, label], i) => (
                <Link key={i} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> 16XXX (Hotline)</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> support@starline.com.bd</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Dhaka, Bangladesh</div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 Starline. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
