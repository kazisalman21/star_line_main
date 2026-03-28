import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import starlineLogo from '@/assets/starline-logo.png';

export default function Footer() {
  return (
    <footer className="bg-card/60 border-t border-border/40">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="mb-5">
              <img src={starlineLogo} alt="Star Line Group" className="h-12 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bangladesh's premium intercity coach service. Travel in comfort, arrive with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[['/', 'Home'], ['/search', 'Search Trips'], ['/routes', 'Routes & Fleet'], ['/counters', 'Counters'], ['/manage-booking', 'Manage Booking']].map(([to, label]) => (
                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">Support & Legal</h4>
            <div className="flex flex-col gap-2.5">
              {[['/support', 'Help Center'], ['/terms', 'Terms of Service'], ['/privacy', 'Privacy Policy'], ['/support', 'Contact Us']].map(([to, label], i) => (
                <Link key={i} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 tracking-wide uppercase text-foreground/80">Contact</h4>
            <div className="flex flex-col gap-3.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-primary" /> +8801973-259609</div>
              <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-primary" /> info@starline.com.bd</div>
              <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> Star Line Complex, 314/1, Shaheed Shahidullah Kaisar Road, Feni</div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Star Line Group. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
