import { motion } from 'framer-motion';
import { Shield, FileText, Scale, AlertTriangle, Clock, Globe, CreditCard, Ban, RefreshCw, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using the Star Line Group digital platform ("Platform"), including our website, mobile applications, and related services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms").',
      'These Terms constitute a legally binding agreement between you ("User," "Passenger," or "you") and Star Line Group Ltd. ("Star Line," "we," "us," or "our"), a registered intercity transport operator in Bangladesh.',
      'If you do not agree to these Terms, you must discontinue use of the Platform immediately. Continued use of the Platform after any modifications to these Terms constitutes acceptance of such changes.',
    ],
  },
  {
    icon: Globe,
    title: '2. Service Description',
    content: [
      'Star Line Group provides premium intercity coach transportation services across Bangladesh, along with a digital booking platform that enables passengers to search routes, reserve seats, make payments, track coaches in real-time, and manage their bookings.',
      'Our services include but are not limited to: online ticket booking and seat selection, multiple payment gateway integrations (bKash, Nagad, credit/debit cards), real-time GPS-based coach tracking, digital e-ticket generation, and passenger account management.',
      'We reserve the right to modify, suspend, or discontinue any part of our services at any time, with or without notice, subject to applicable laws and regulations of Bangladesh.',
    ],
  },
  {
    icon: CreditCard,
    title: '3. Booking & Payment',
    content: [
      'All ticket purchases made through the Platform are subject to seat availability at the time of booking confirmation. A booking is only confirmed upon successful payment processing and receipt of a digital confirmation (e-ticket) with a unique booking reference number.',
      'Ticket prices are displayed in Bangladeshi Taka (BDT/৳) and include applicable taxes unless otherwise stated. Service fees, convenience charges, or payment gateway surcharges may apply and will be clearly disclosed before payment confirmation.',
      'We accept payments via bKash, Nagad, Visa, Mastercard, and other approved payment methods. Star Line is not responsible for any additional charges imposed by your bank or mobile financial service provider. All transactions are processed through PCI DSS-compliant payment gateways.',
    ],
  },
  {
    icon: RefreshCw,
    title: '4. Cancellation & Refund Policy',
    content: [
      'Free cancellation: Bookings cancelled more than 6 hours before the scheduled departure time are eligible for a full refund to the original payment method.',
      'Partial refund: Cancellations made between 6 hours and 2 hours before departure will receive a 50% refund of the ticket fare. Service fees and convenience charges are non-refundable.',
      'No refund: Cancellations made within 2 hours of departure, or failure to board ("no-show"), are not eligible for any refund. Refunds to mobile wallets (bKash/Nagad) are typically processed within 1-2 business days; card refunds may take 5-7 business days.',
    ],
  },
  {
    icon: Scale,
    title: '5. Passenger Responsibilities',
    content: [
      'Passengers must arrive at the designated boarding point at least 15 minutes before the scheduled departure time. Star Line reserves the right to release reserved seats if the passenger has not boarded within 5 minutes of departure.',
      'Each passenger is permitted a maximum baggage allowance of two bags (not exceeding 20 kg each) in the luggage compartment, plus one carry-on bag. Excess baggage may be subject to additional charges or refused at the discretion of the crew.',
      'Passengers must carry valid government-issued identification (National ID, passport, or equivalent) for verification purposes. Passengers are expected to conduct themselves respectfully and comply with all safety instructions issued by the coach crew.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '6. Limitation of Liability',
    content: [
      'Star Line Group shall not be liable for delays, cancellations, or service disruptions caused by force majeure events including but not limited to natural disasters, extreme weather conditions, road blockages, political unrest, strikes, government restrictions, or any other circumstances beyond our reasonable control.',
      'Our total liability for any claim arising from the use of our services shall not exceed the amount paid by the passenger for the specific trip in question. Star Line does not accept liability for any indirect, incidental, consequential, or punitive damages.',
      'While we implement commercially reasonable measures to ensure the safety of passengers and their belongings, Star Line Group shall not be held liable for loss, theft, or damage to personal belongings during transit unless caused by proven negligence on our part.',
    ],
  },
  {
    icon: Ban,
    title: '7. Prohibited Conduct',
    content: [
      'Users shall not use the Platform for any unlawful purpose, attempt to gain unauthorized access to any part of the Platform or its systems, or transmit any malware, viruses, or harmful code.',
      'The following items are strictly prohibited on all Star Line coaches: illegal substances, flammable materials, explosives, weapons, hazardous chemicals, and any items restricted under the laws of Bangladesh. Violation may result in immediate removal and legal action.',
      'Any form of harassment, abuse, or threatening behavior toward Star Line staff, crew members, or fellow passengers will not be tolerated and may result in permanent ban from our services, forfeiture of ticket fare, and referral to law enforcement authorities.',
    ],
  },
  {
    icon: Clock,
    title: '8. Modifications & Governing Law',
    content: [
      'Star Line Group reserves the right to update or modify these Terms at any time. Material changes will be communicated through the Platform or via email to registered users. The "Last Updated" date at the top of this page indicates the most recent revision.',
      'These Terms shall be governed by and construed in accordance with the laws of the People\'s Republic of Bangladesh. Any disputes arising from or relating to these Terms or the use of our services shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.',
      'If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Terms of Service — Star Line Group" description="Review the terms and conditions for using Star Line Group's intercity bus booking platform." />
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              <Shield className="w-3.5 h-3.5" />
              Legal Document
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Please review our terms carefully before using the Star Line Group platform and services.
            </p>
            <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Last updated: March 27, 2026
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                Version 2.1
              </div>
            </div>
          </motion.div>

          {/* Quick Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card-accent p-6 mb-12 border-l-4 border-l-accent"
          >
            <h3 className="font-display font-semibold text-accent mb-2">Quick Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using Star Line's platform, you agree to our booking terms, cancellation policies, and passenger guidelines. 
              We protect your data, provide reliable service, and expect respectful conduct from all passengers. 
              Full cancellation refunds are available up to 6 hours before departure.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                className="glass-card p-8 group hover:border-border/60 transition-colors"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-bold pt-1.5">{section.title}</h2>
                </div>
                <div className="space-y-4 pl-14">
                  {section.content.map((p, j) => (
                    <p key={j} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 mt-12 text-center"
          >
            <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold text-lg mb-2">Questions about our Terms?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              If you have any questions or concerns regarding these Terms of Service, please don't hesitate to reach out to our legal team.
            </p>
            <a href="mailto:legal@starline.com.bd" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <Mail className="w-4 h-4" />
              legal@starline.com.bd
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
