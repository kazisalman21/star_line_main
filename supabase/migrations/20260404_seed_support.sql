-- ============================================================
-- Star Line — Support System Seed Data
-- Run AFTER 20260404_support_system.sql migration
-- ============================================================

-- ============================================================
-- 1. KNOWLEDGE BASE — Support FAQs & Policies
-- ============================================================

INSERT INTO knowledge_base (title, category, question, answer, tags, source_type, confidence) VALUES

-- BOOKING
('Online Booking Process', 'booking',
 'How do I book a ticket online?',
 'You can book tickets through our website at starline.com.bd or our mobile app. Select your route, travel date, choose your preferred seats, and pay using bKash, Nagad, Rocket, or card. You''ll receive an instant e-ticket via SMS and email.',
 ARRAY['booking', 'online', 'ticket', 'how to'],
 'faq', 1.0),

('Seat Selection', 'booking',
 'Can I choose my seat when booking?',
 'Yes! Our interactive seat map lets you pick your exact seat during booking. Premium seats (front rows) cost ৳50 extra. Ladies seats are marked and reserved for female or family passengers.',
 ARRAY['seat', 'selection', 'premium', 'ladies'],
 'faq', 1.0),

('Group Booking', 'booking',
 'How can I book for a group?',
 'You can select up to 5 seats per booking online. For groups larger than 5, please call our hotline at 16XXX or visit any Star Line counter. Group discounts may apply for 10+ passengers.',
 ARRAY['group', 'multiple', 'bulk', 'discount'],
 'faq', 0.95),

-- PAYMENT
('Payment Methods', 'payment',
 'What payment methods do you accept?',
 'We accept bKash, Nagad, Rocket, and all major credit/debit cards (Visa, Mastercard). Cash payment is available at our physical counters only.',
 ARRAY['payment', 'bkash', 'nagad', 'rocket', 'card', 'cash'],
 'official', 1.0),

('Payment Failed', 'payment',
 'My payment was deducted but I didn''t get a ticket. What should I do?',
 'If your payment was deducted but you didn''t receive a ticket confirmation: 1) Wait 5 minutes — sometimes there''s a processing delay. 2) Check your email/SMS for confirmation. 3) Contact your payment provider (bKash: 16247, Nagad: 16167). 4) If still unresolved, call our hotline 16XXX or submit a complaint — we treat payment issues as high priority and resolve within 24 hours.',
 ARRAY['payment', 'failed', 'deducted', 'no ticket', 'help'],
 'official', 1.0),

('Payment Receipt', 'payment',
 'Can I get a payment receipt?',
 'Yes, an e-receipt is automatically sent to your registered email address after successful payment. You can also download it from the "My Bookings" section in your account.',
 ARRAY['receipt', 'invoice', 'download'],
 'faq', 0.9),

-- REFUND
('Refund Policy', 'refund',
 'What is the refund policy for cancelled tickets?',
 'Star Line refund policy: • Free cancellation (100% refund) if cancelled 6+ hours before departure. • 50% refund if cancelled between 6-2 hours before departure. • No refund within 2 hours of departure or after departure time. Refund processing: bKash/Nagad — 1-2 business days, Card — 5-7 business days.',
 ARRAY['refund', 'cancellation', 'cancel', 'policy', 'money back'],
 'policy', 1.0),

('Refund Status', 'refund',
 'How do I check my refund status?',
 'You can check refund status in "My Bookings" → select the cancelled booking → "Refund Status". Refunds are typically processed within 1-2 business days for mobile wallets and 5-7 days for cards. If your refund is delayed beyond this, please contact support at 16XXX.',
 ARRAY['refund', 'status', 'check', 'delayed'],
 'faq', 0.95),

-- ROUTE
('Available Routes', 'route',
 'What routes does Star Line operate?',
 'Star Line operates premium intercity bus services on the following routes: • Dhaka ↔ Feni • Dhaka ↔ Chattogram • Dhaka ↔ Cox''s Bazar • Feni ↔ Chattogram • Feni ↔ Cox''s Bazar • Feni ↔ Lakshmipur. All routes are served by AC and Non-AC buses with multiple daily departures.',
 ARRAY['routes', 'cities', 'dhaka', 'feni', 'chittagong', 'coxs bazar'],
 'official', 1.0),

('Travel Time', 'route',
 'How long does the journey from Dhaka to Feni take?',
 'The Dhaka to Feni route typically takes 4-5 hours depending on traffic conditions. The Dhaka-Chattogram route takes approximately 5-6 hours, and Dhaka to Cox''s Bazar takes 8-10 hours.',
 ARRAY['time', 'duration', 'how long', 'journey'],
 'faq', 0.9),

-- COUNTER
('Counter Locations', 'counter',
 'Where are Star Line counters located?',
 'Main Star Line counters: • Abdullahpur (Dhaka) • Sayedabad (Dhaka) • Maniknagar (Dhaka) • Kanchpur (Narayanganj) • Chauddagram (Comilla) • Mohipal Main (Feni) • Mohipal Flyover (Feni) • Cheora (Feni) • Boropol (Chattogram) • Sea Hill (Cox''s Bazar) • Lakshmipur Terminal. Visit starline.com.bd/counters for full details and phone numbers.',
 ARRAY['counter', 'terminal', 'location', 'where', 'office'],
 'official', 1.0),

('Counter Operating Hours', 'counter',
 'What are the operating hours of Star Line counters?',
 'Most Star Line counters operate from 6:00 AM to 11:00 PM. Abdullahpur and Sayedabad (Dhaka) counters are open from 5:00 AM to 12:00 AM. During Eid seasons, counters may operate 24 hours.',
 ARRAY['hours', 'timing', 'open', 'close', 'when'],
 'faq', 0.9),

-- BAGGAGE
('Baggage Policy', 'baggage',
 'How much luggage can I carry?',
 'Star Line baggage allowance: • Free: 1 large bag (up to 25 kg) + 1 small carry-on. • Extra baggage: ৳50-100 per additional piece depending on size. • Fragile/valuable items should be kept as carry-on. • Live animals and hazardous materials are strictly prohibited.',
 ARRAY['baggage', 'luggage', 'bag', 'weight', 'carry'],
 'policy', 1.0),

('Lost Luggage', 'baggage',
 'I lost my luggage on the bus. What do I do?',
 'If you lose luggage on a Star Line bus: 1) Call our hotline 16XXX immediately with your ticket details and seat number. 2) Visit the nearest counter to file a lost item report. 3) We will search the bus and contact the driver. Most items are recovered within 24-48 hours. Please submit a complaint for tracking.',
 ARRAY['lost', 'missing', 'luggage', 'bag', 'found'],
 'official', 1.0),

-- SCHEDULE
('Schedule Information', 'schedule',
 'What time do buses depart?',
 'Star Line operates multiple departures daily on each route. Popular departure times from Dhaka: 7:00 AM, 9:00 AM, 11:00 AM, 1:00 PM, 3:00 PM, 5:00 PM, 8:00 PM, 10:00 PM. Check real-time availability and exact schedules on our search page.',
 ARRAY['schedule', 'time', 'departure', 'bus time'],
 'faq', 0.85),

-- GENERAL
('Contact Support', 'general',
 'How can I contact Star Line customer support?',
 'You can reach Star Line support through: • 24/7 Hotline: 16XXX • Email: support@starline.com.bd • In-app AI Chat: Available on our website and mobile app • Counter: Visit any Star Line counter during operating hours. For complaints, use our AI chat to file and track your complaint automatically.',
 ARRAY['contact', 'support', 'help', 'phone', 'email', 'hotline'],
 'official', 1.0),

-- SAFETY
('Safety Measures', 'safety',
 'What safety measures does Star Line follow?',
 'Star Line prioritizes passenger safety: • All drivers are professionally trained and licensed • Buses undergo regular maintenance checks • GPS tracking on all buses for real-time monitoring • Fire extinguishers and first aid kits on every bus • Speed limiters set to 80 km/h • Night driving shifts with co-drivers • Emergency helpline available 24/7',
 ARRAY['safety', 'security', 'driver', 'maintenance'],
 'official', 1.0),

-- ESCALATION
('Escalation Process', 'escalation',
 'How do I escalate a complaint?',
 'If your complaint hasn''t been resolved satisfactorily: 1) Reference your complaint ID (STC-XXXX-XXXXXX) when contacting us. 2) Call our dedicated escalation line at 16XXX and ask for a supervisor. 3) Email escalation@starline.com.bd with your complaint ID. 4) Escalated complaints are handled by senior management within 24 hours.',
 ARRAY['escalation', 'escalate', 'supervisor', 'unresolved', 'manager'],
 'official', 1.0);

-- ============================================================
-- 2. SAMPLE COMPLAINTS (for development/demo)
-- ============================================================

INSERT INTO complaints (complaint_code, customer_name, phone, email, route, travel_date, boarding_counter, category, priority, status, urgency, complaint_text, ai_summary, sentiment_marker, requires_human_review, escalation_flag, preferred_contact_method, created_at) VALUES

('STC-2026-001001', 'Rahim Uddin', '01712345678', 'rahim@example.com',
 'Dhaka → Feni', '2026-04-01', 'Abdullahpur',
 'bus_delay', 'medium', 'submitted', 'medium',
 'The 9:00 AM bus from Abdullahpur was 45 minutes late. I had an important meeting in Feni and missed it because of this delay. The counter staff couldn''t give a proper explanation.',
 'Passenger missed meeting due to 45-min bus delay from Abdullahpur.',
 'negative', false, false, 'phone',
 '2026-04-02 10:30:00+06'),

('STC-2026-001002', 'Fatema Akter', '01812345678', 'fatema@example.com',
 'Dhaka → Chattogram', '2026-04-02', 'Sayedabad',
 'payment_issue', 'high', 'under_review', 'high',
 'I paid ৳850 via bKash for my ticket but never received a confirmation. My bKash account shows the deduction. Transaction ID: TXN89012345. This is very frustrating.',
 'Payment deducted (৳850 bKash) but no ticket issued. Transaction TXN89012345.',
 'angry', true, true, 'phone',
 '2026-04-02 14:15:00+06'),

('STC-2026-001003', 'Kamal Hossain', '01912345678', NULL,
 'Feni → Dhaka', '2026-04-01', 'Mohipal Main',
 'staff_behavior', 'high', 'assigned', 'high',
 'The conductor on the Feni-Dhaka 3PM bus was extremely rude to elderly passengers. He was shouting at an old man for asking about the stop. This behavior is unacceptable for a premium service.',
 'Conductor was rude and shouted at elderly passenger on Feni-Dhaka bus.',
 'angry', true, false, 'phone',
 '2026-04-01 18:00:00+06'),

('STC-2026-001004', 'Nasreen Begum', '01612345678', 'nasreen@example.com',
 'Dhaka → Cox''s Bazar', '2026-03-30', 'Maniknagar',
 'lost_item', 'medium', 'in_progress', 'medium',
 'I left my laptop bag under my seat (Seat A4) on the Dhaka-Cox''s Bazar night bus on March 30th. The bag is black with a brown strap. Contains my work laptop and documents. Please help.',
 'Passenger lost laptop bag (black, brown strap) under seat A4 on night bus to Cox''s Bazar.',
 'distressed', true, false, 'email',
 '2026-03-31 08:00:00+06'),

('STC-2026-001005', 'Arif Rahman', '01512345678', NULL,
 'Feni → Lakshmipur', '2026-04-03', 'Cheora',
 'seat_or_bus_issue', 'low', 'resolved', 'low',
 'The AC was not working properly on the Feni-Lakshmipur bus yesterday. It was quite uncomfortable during the 2-hour ride.',
 'AC malfunction on Feni-Lakshmipur bus causing passenger discomfort.',
 'negative', false, false, 'chat',
 '2026-04-03 16:00:00+06'),

('STC-2026-001006', 'Sabrina Islam', '01312345678', 'sabrina@example.com',
 'Chattogram → Dhaka', '2026-04-04', 'Boropol (Chittagong)',
 'refund_or_cancellation', 'medium', 'awaiting_customer', 'medium',
 'I cancelled my ticket 8 hours before departure but haven''t received my refund yet. It''s been 3 days. Booking ID: BK-78234. I paid via Nagad.',
 'Refund not received after cancellation 8 hours before departure. Nagad payment.',
 'negative', false, false, 'phone',
 '2026-04-04 09:00:00+06');

-- Add status history for sample complaints
INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by_type, note, created_at) VALUES
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001001'), 'submitted', 'submitted', 'system', 'Complaint submitted via AI Chat', '2026-04-02 10:30:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001002'), 'submitted', 'submitted', 'system', 'Complaint submitted via AI Chat', '2026-04-02 14:15:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001002'), 'submitted', 'under_review', 'admin', 'Payment issue — checking with bKash gateway', '2026-04-02 15:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001003'), 'submitted', 'submitted', 'system', 'Complaint submitted', '2026-04-01 18:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001003'), 'submitted', 'assigned', 'admin', 'Assigned to supervisor for investigation', '2026-04-02 09:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001004'), 'submitted', 'submitted', 'system', 'Complaint submitted', '2026-03-31 08:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001004'), 'submitted', 'in_progress', 'admin', 'Coordinating with driver and Cox''s Bazar counter', '2026-03-31 10:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001005'), 'submitted', 'submitted', 'system', 'Complaint submitted', '2026-04-03 16:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001005'), 'submitted', 'resolved', 'admin', 'Bus sent for AC maintenance. Apology sent to passenger.', '2026-04-04 11:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001006'), 'submitted', 'submitted', 'system', 'Complaint submitted', '2026-04-04 09:00:00+06'),
((SELECT id FROM complaints WHERE complaint_code = 'STC-2026-001006'), 'submitted', 'awaiting_customer', 'admin', 'Asked customer for Nagad transaction ID to verify', '2026-04-04 10:00:00+06');
