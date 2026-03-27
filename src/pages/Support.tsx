import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Headphones, Mail, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

const faqs = [
  {
    category: 'Booking',
    items: [
      { q: 'How do I book a ticket?', a: 'Use the search form on our homepage to find trips. Select your preferred bus, choose seats, enter passenger details, and complete the payment.' },
      { q: 'Can I book for multiple passengers?', a: 'Yes, select the number of passengers in the search form. You can book up to 6 seats per transaction.' },
      { q: 'What payment methods are accepted?', a: 'We accept bKash, Nagad, credit/debit cards (Visa, Mastercard), and cash payment at counter.' },
    ],
  },
  {
    category: 'Cancellation & Refunds',
    items: [
      { q: 'What is the cancellation policy?', a: 'Free cancellation up to 6 hours before departure. 50% refund between 6-2 hours. No refund within 2 hours of departure.' },
      { q: 'How long do refunds take?', a: 'Refunds to bKash/Nagad take 1-2 business days. Card refunds take 5-7 business days.' },
      { q: 'Can I reschedule my trip?', a: 'Yes, you can reschedule up to 4 hours before departure for free (subject to seat availability on the new trip).' },
    ],
  },
  {
    category: 'Baggage & Boarding',
    items: [
      { q: 'What is the baggage allowance?', a: 'Each passenger is allowed 2 bags (max 20kg each) in the luggage compartment plus 1 carry-on bag.' },
      { q: 'How early should I arrive?', a: 'We recommend arriving at the boarding point at least 15 minutes before the scheduled departure time.' },
      { q: 'What ID do I need?', a: 'Carry a valid National ID card, passport, or any government-issued photo ID.' },
    ],
  },
  {
    category: 'On the Trip',
    items: [
      { q: 'Is WiFi available on board?', a: 'WiFi is available on Platinum and Gold coaches. Silver and Express coaches do not have WiFi.' },
      { q: 'Are there rest stops?', a: 'Trips over 4 hours include a 15-20 minute rest stop at designated locations.' },
      { q: 'Can I track my bus in real-time?', a: 'Yes! Use the Live Tracking feature on our website to track your coach\'s location and ETA in real-time.' },
    ],
  },
];

export default function Support() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    const next = new Set(openItems);
    next.has(key) ? next.delete(key) : next.add(key);
    setOpenItems(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Help & Support" description="Get help with your Star Line Group booking. FAQ, contact support, and live chat." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground mb-10">Find answers to common questions or get in touch with our support team</p>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Phone, label: 'Call Us', value: '+8801973-259609', desc: '24/7 Hotline' },
              { icon: Mail, label: 'Email', value: 'info@starline.com.bd', desc: 'Reply within 2 hours' },
              { icon: MessageCircle, label: 'Live Chat', value: 'Start Chat', desc: 'Available 8AM-12AM' },
            ].map((c, i) => (
              <div key={i} className="glass-card p-5 text-center card-hover">
                <c.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">{c.label}</div>
                <div className="text-xs text-accent mt-1">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="space-y-8">
            {faqs.map((section, si) => (
              <div key={si}>
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  {section.category}
                </h2>
                <div className="space-y-2">
                  {section.items.map((item, qi) => {
                    const key = `${si}-${qi}`;
                    const isOpen = openItems.has(key);
                    return (
                      <div key={qi} className="glass-card overflow-hidden">
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                        >
                          <span className="text-sm font-medium pr-4">{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="px-4 pb-4"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
