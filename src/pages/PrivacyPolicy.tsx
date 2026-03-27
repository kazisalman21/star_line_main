import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Share2, Cookie, UserCheck, Bell, Clock, Mail, ServerCrash, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    content: [
      'Personal Information: When you create an account or make a booking, we collect your full name, email address, phone number, date of birth (optional), National ID number (for verification), and billing address.',
      'Payment Information: We collect payment method details including mobile wallet numbers (bKash/Nagad), card details (processed securely via PCI DSS-compliant third-party gateways — we never store full card numbers), and transaction history.',
      'Usage Data: We automatically collect device information (type, OS, browser), IP address, access timestamps, pages visited, search queries, booking patterns, and interaction data to improve our services and user experience.',
      'Location Data: With your consent, we may collect GPS location data to provide real-time coach tracking, nearest boarding point suggestions, and location-based service improvements.',
    ],
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    content: [
      'Service Delivery: To process bookings, issue e-tickets, facilitate payments, provide real-time tracking, send booking confirmations and trip reminders, and manage your passenger account.',
      'Communication: To send you important service notifications (schedule changes, delays, cancellations), respond to customer support inquiries, and deliver promotional offers and loyalty rewards (with your consent).',
      'Platform Improvement: To analyze usage patterns, optimize routes and schedules, improve app performance, personalize your experience, conduct internal analytics, and develop new features.',
      'Safety & Compliance: To verify passenger identity, prevent fraudulent transactions, comply with Bangladeshi regulatory requirements, enforce our Terms of Service, and ensure the safety and security of all passengers.',
    ],
  },
  {
    icon: Share2,
    title: '3. Information Sharing',
    content: [
      'Payment Processors: We share necessary transaction data with our payment gateway partners (bKash, Nagad, and card processors) solely for the purpose of processing your payments securely.',
      'Service Partners: Limited operational data may be shared with our authorized terminal operators, crew management systems, and fleet partners to facilitate your journey and ensure smooth boarding.',
      'Legal Requirements: We may disclose your information when required by law, court order, or government regulation, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.',
      'We do NOT sell, rent, or trade your personal information to third parties for marketing purposes. Any data sharing is strictly limited to what is necessary for service delivery and legal compliance.',
    ],
  },
  {
    icon: Lock,
    title: '4. Data Security',
    content: [
      'We implement industry-standard security measures including 256-bit SSL/TLS encryption for all data in transit, AES-256 encryption for sensitive data at rest, and regular security audits by independent third-party firms.',
      'Access to personal data is restricted to authorized personnel only, governed by strict role-based access controls, multi-factor authentication, and comprehensive audit logging. All staff undergo regular data protection training.',
      'Our payment processing infrastructure is PCI DSS Level 1 compliant. We never store complete credit/debit card numbers, CVV codes, or PINs on our servers. All payment data is tokenized and processed by certified payment gateways.',
      'In the event of a data breach, we will notify affected users within 72 hours in accordance with applicable data protection regulations, and take immediate remedial action to contain and resolve the incident.',
    ],
  },
  {
    icon: Cookie,
    title: '5. Cookies & Tracking',
    content: [
      'Essential Cookies: Required for the Platform to function properly — session management, authentication, security tokens, and language preferences. These cannot be disabled.',
      'Analytics Cookies: Help us understand how visitors interact with our Platform by collecting anonymous usage statistics. We use these insights to improve performance and user experience.',
      'Preference Cookies: Remember your settings such as preferred routes, seat preferences, and display options to provide a personalized booking experience.',
      'You can manage cookie preferences through your browser settings. Disabling non-essential cookies may limit some Platform features but will not affect core booking functionality.',
    ],
  },
  {
    icon: UserCheck,
    title: '6. Your Rights & Controls',
    content: [
      'Access & Portability: You have the right to request a complete copy of all personal data we hold about you, delivered in a structured, commonly used, machine-readable format within 30 days of your request.',
      'Correction & Deletion: You may update your personal information at any time through your account settings. You may also request deletion of your account and associated data, subject to legal retention requirements.',
      'Communication Preferences: You can opt out of promotional communications at any time through your account settings or by clicking "unsubscribe" in any marketing email. Service-critical notifications cannot be disabled for active bookings.',
      'Consent Withdrawal: Where we process data based on your consent (e.g., location tracking, marketing), you may withdraw consent at any time. This will not affect the lawfulness of processing performed before withdrawal.',
    ],
  },
  {
    icon: ServerCrash,
    title: '7. Data Retention',
    content: [
      'Active Account Data: Personal information is retained for the duration of your account\'s active status plus 2 years after the last login or booking activity.',
      'Transaction Records: Booking and payment records are retained for 6 years after the transaction date, as required by Bangladeshi tax and financial regulations.',
      'Communication Logs: Customer support interactions and correspondence are retained for 3 years to ensure service quality and resolve any potential disputes.',
      'After the applicable retention period expires, data is securely deleted or anonymized so that it can no longer be associated with any individual user.',
    ],
  },
  {
    icon: Globe,
    title: '8. Updates & Contact',
    content: [
      'We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or regulatory obligations. Material changes will be communicated via email and/or prominent notice on the Platform.',
      'This Privacy Policy is governed by the laws of the People\'s Republic of Bangladesh, including the Digital Security Act 2018 and any applicable data protection legislation.',
      'For any privacy-related questions, concerns, or data requests, please contact our Data Protection Officer at privacy@starline.com.bd or call our dedicated privacy helpline at 16XXX (ext. 5).',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Privacy Policy — Star Line Group" description="Learn how Star Line Group collects, uses, and protects your personal information." />
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              <Lock className="w-3.5 h-3.5" />
              Privacy & Data Protection
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Your privacy matters to us. Learn how Star Line Group collects, uses, and protects your personal information.
            </p>
            <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Effective: March 27, 2026
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                GDPR-aligned
              </div>
            </div>
          </motion.div>

          {/* Privacy Commitment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card-accent p-6 mb-12 border-l-4 border-l-primary"
          >
            <h3 className="font-display font-semibold text-primary mb-2">Our Privacy Commitment</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-accent flex-shrink-0" /> We never sell your personal data to third parties</li>
              <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-accent flex-shrink-0" /> All data is encrypted with industry-standard 256-bit encryption</li>
              <li className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5 text-accent flex-shrink-0" /> You have full control over your data — access, correct, or delete anytime</li>
              <li className="flex items-center gap-2"><Bell className="w-3.5 h-3.5 text-accent flex-shrink-0" /> Breach notification within 72 hours as per regulatory standards</li>
            </ul>
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
            <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-display font-semibold text-lg mb-2">Privacy Concerns?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              Our Data Protection Officer is available to address any questions about how we handle your personal information.
            </p>
            <a href="mailto:privacy@starline.com.bd" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <Mail className="w-4 h-4" />
              privacy@starline.com.bd
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
