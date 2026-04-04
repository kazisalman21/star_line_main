-- ============================================================
-- Star Line Knowledge Base Expansion
-- Run in Supabase SQL Editor to add more training data
-- ============================================================

INSERT INTO knowledge_base (title, category, question, answer, tags, source_type, confidence) VALUES

-- ── Pricing & Fares ──────────────────────────────────────────

('Dhaka to Chattogram Fare', 'booking', 
'How much is the ticket from Dhaka to Chattogram?',
'Star Line Dhaka to Chattogram fares start from BDT 900 for Economy class and BDT 1,200 for Business class. AC buses are BDT 1,500. Prices may vary by season and departure time. Check the Search Trips page for live pricing.',
ARRAY['fare', 'price', 'dhaka', 'chattogram', 'chittagong', 'cost', 'ticket price'],
'faq', 0.95),

('Dhaka to Feni Fare', 'booking',
'How much is the ticket from Dhaka to Feni?',
'Star Line Dhaka to Feni fares range from BDT 600-900 depending on the bus class. Economy starts at BDT 600, Business at BDT 800, and AC at BDT 900.',
ARRAY['fare', 'price', 'dhaka', 'feni', 'cost'],
'faq', 0.95),

('Dhaka to Cox''s Bazar Fare', 'booking',
'How much is the ticket from Dhaka to Cox''s Bazar?',
'Star Line Dhaka to Cox''s Bazar fares start from BDT 1,200 for Economy and BDT 1,800 for AC Business class. During peak tourist season (November-February), prices may increase by 10-20%. Book early for the best rates.',
ARRAY['fare', 'price', 'dhaka', 'coxs bazar', 'cost', 'tourist'],
'faq', 0.90),

-- ── Schedule & Timing ────────────────────────────────────────

('Dhaka to Chattogram Schedule', 'schedule',
'What time do buses leave for Chattogram from Dhaka?',
'Star Line buses depart from Dhaka (Abdullahpur & Maniknagar terminals) to Chattogram multiple times daily. Common departure times: 7:00 AM, 9:00 AM, 11:00 AM, 1:00 PM, 3:00 PM, 5:00 PM, 9:00 PM, 11:00 PM. Night coaches are the most popular. Journey time: approximately 5-6 hours.',
ARRAY['schedule', 'time', 'departure', 'dhaka', 'chattogram', 'chittagong'],
'faq', 0.90),

('Dhaka to Feni Schedule', 'schedule',
'What time do buses leave from Dhaka to Feni?',
'Star Line buses depart from Dhaka to Feni throughout the day. Popular departure times include: 7:30 AM, 10:00 AM, 12:00 PM, 2:30 PM, 4:00 PM, 7:00 PM, 10:00 PM. Journey time: approximately 3-4 hours.',
ARRAY['schedule', 'time', 'departure', 'dhaka', 'feni'],
'faq', 0.90),

('Night Coach Info', 'schedule',
'Do you have night coaches?',
'Yes! Star Line operates premium night coaches on major routes. Our night departures (9:00 PM - 11:30 PM) are popular for Dhaka-Chattogram and Dhaka-Cox''s Bazar. Night coaches feature reclining seats, blankets, and reduced stops for faster travel. Some routes offer sleeper buses.',
ARRAY['night', 'coach', 'overnight', 'sleeper', 'late'],
'faq', 0.90),

-- ── Bus Types & Amenities ────────────────────────────────────

('Bus Types Available', 'general',
'What types of buses do Star Line have?',
'Star Line operates multiple bus types:\n\n• **Economy (Non-AC)**: Affordable, standard seating, 40-44 seats\n• **Business Class**: Comfortable seats with more legroom, 36-40 seats\n• **AC Business**: Full air conditioning, reclining seats, 36 seats\n• **AC Sleeper**: Premium night coaches with semi-flat beds (select routes)\n\nAll buses feature mobile charging ports, reading lights, and GPS tracking.',
ARRAY['bus', 'type', 'ac', 'non-ac', 'economy', 'business', 'sleeper', 'amenities'],
'faq', 0.95),

('Bus Amenities', 'general',
'What amenities are available on Star Line buses?',
'Star Line buses include:\n• USB charging ports at every seat\n• Reading lights\n• GPS live tracking\n• CCTV security cameras\n• First aid kit\n• Fire extinguisher\n• Clean curtains\n• Luggage compartment below\n\nAC and Business class additionally offer: reclining seats, blankets (night coaches), and bottled water.',
ARRAY['amenities', 'features', 'charging', 'usb', 'wifi', 'facilities'],
'faq', 0.90),

-- ── Booking Process ──────────────────────────────────────────

('How to Book Online', 'booking',
'How do I book a ticket online?',
'Booking with Star Line is easy:\n\n1. Visit our website or open the app\n2. Enter your origin, destination, and travel date\n3. Select your preferred trip and bus type\n4. Choose your seat from the seat map\n5. Fill in passenger details\n6. Pay securely via bKash, Nagad, bank card, or at a counter\n7. Receive your e-ticket via SMS and email\n\nYou can also manage your booking from the My Booking page.',
ARRAY['book', 'online', 'how to', 'website', 'app', 'steps'],
'faq', 0.95),

('Seat Selection', 'booking',
'Can I choose my seat?',
'Yes! Star Line offers a visual seat map during booking. You can:\n• See available seats in real-time (green = available, red = booked)\n• Choose window, aisle, or middle seats\n• Select front, middle, or back of the bus\n\nPopular seats (window seats, front rows) fill up fast, especially for night coaches. Book early for best selection.',
ARRAY['seat', 'select', 'choose', 'window', 'aisle', 'map'],
'faq', 0.90),

('Group Booking', 'booking',
'Can I book for multiple passengers?',
'Yes! You can book up to 10 seats in a single booking. During checkout, you can add passenger details for each seat. For group bookings of 15+ passengers, please contact our counter staff or call our hotline 16XXX for special group rates.',
ARRAY['group', 'multiple', 'bulk', 'family', 'passengers'],
'faq', 0.85),

-- ── Payment ──────────────────────────────────────────────────

('Payment Methods', 'payment',
'What payment methods do you accept?',
'Star Line accepts:\n\n💳 **Online**: bKash, Nagad, Rocket, Visa/Mastercard, bank transfer\n🏪 **Counter**: Cash, bKash, Nagad\n\nOnline payments are processed securely through SSLCommerz. You''ll receive an e-ticket immediately after successful payment.',
ARRAY['payment', 'pay', 'bkash', 'nagad', 'card', 'cash', 'method'],
'faq', 0.95),

('Payment Failed', 'payment',
'My payment failed but money was deducted.',
'If your payment was deducted but booking failed:\n\n1. **Don''t retry immediately** — wait 30 minutes\n2. Check your bKash/Nagad/bank statement\n3. If the amount was charged, it will be auto-refunded within 3-5 business days\n4. Contact our hotline 16XXX with your transaction ID for faster resolution\n5. You can also file a complaint through our AI chat for tracking\n\nWe apologize for the inconvenience.',
ARRAY['payment', 'failed', 'deducted', 'money', 'charged', 'error', 'transaction'],
'faq', 0.95),

-- ── Baggage ──────────────────────────────────────────────────

('Baggage Policy', 'general',
'How much luggage can I carry?',
'Star Line baggage policy:\n\n• **Free allowance**: 1 bag up to 25 kg per passenger\n• **Cabin bag**: 1 small bag/backpack (under seat or overhead)\n• **Extra luggage**: BDT 50-100 per additional bag (at counter)\n\n**Prohibited items**: Flammable materials, weapons, live animals, illegal substances, oversized furniture.\n\nFragile items should be carried as cabin baggage. Star Line is not responsible for items left on the bus.',
ARRAY['baggage', 'luggage', 'bag', 'carry', 'weight', 'limit'],
'faq', 0.95),

-- ── Cancellation & Refund Details ────────────────────────────

('Cancellation Timeline', 'refund',
'What is the cancellation deadline?',
'Star Line cancellation policy:\n\n• **24+ hours before departure**: Full refund minus BDT 50 processing fee\n• **12-24 hours before**: 75% refund\n• **6-12 hours before**: 50% refund\n• **Less than 6 hours**: No refund\n• **No-show**: No refund\n\nRefunds are processed to the original payment method within 3-7 business days. bKash/Nagad refunds are typically faster (1-3 days).',
ARRAY['cancel', 'cancellation', 'refund', 'deadline', 'policy', 'time'],
'faq', 0.95),

('Reschedule Policy', 'booking',
'Can I change my travel date?',
'Yes, you can reschedule your trip:\n\n• **24+ hours before**: Free reschedule (subject to seat availability)\n• **12-24 hours before**: BDT 100 reschedule fee\n• **Less than 12 hours**: Not allowed, must cancel and rebook\n\nTo reschedule, go to My Booking page, find your booking, and click "Reschedule". You can also call 16XXX or visit any counter.',
ARRAY['reschedule', 'change', 'date', 'modify', 'move'],
'faq', 0.90),

-- ── Safety & Policies ────────────────────────────────────────

('Safety Measures', 'general',
'Is Star Line safe to travel with?',
'Star Line prioritizes passenger safety:\n\n🛡️ **Vehicle Safety**: All buses undergo weekly maintenance checks, annual fitness certificates, and carry fire extinguishers + first aid kits\n📹 **Security**: CCTV cameras on all buses, GPS tracking for live monitoring\n👨‍✈️ **Drivers**: Licensed, trained professionals with minimum 5 years experience. No night driving beyond 11 PM without a relief driver\n📞 **Emergency**: 24/7 hotline 16XXX, in-bus emergency button\n\nYour safety is our top priority.',
ARRAY['safety', 'safe', 'security', 'camera', 'driver', 'emergency'],
'faq', 0.95),

('Women''s Safety', 'general',
'Is it safe for women to travel alone?',
'Absolutely! Star Line is committed to women''s safety:\n\n• **Women-priority seating**: Front rows reserved for solo female travelers\n• **CCTV monitoring**: All buses have operational cameras\n• **Female counter staff**: Available at major terminals\n• **Emergency hotline**: Call 16XXX anytime — 24/7 response\n• **Zero tolerance**: Strict policy against harassment\n\nWe encourage solo female travelers to choose front seats and report any concerns immediately.',
ARRAY['women', 'female', 'safety', 'solo', 'alone', 'girl'],
'faq', 0.95),

-- ── Terminals & Counters ─────────────────────────────────────

('Abdullahpur Terminal', 'counter',
'Where is the Abdullahpur terminal?',
'Star Line Abdullahpur Terminal is located at Abdullahpur Bus Stand, Uttara, Dhaka. This is our primary Dhaka departure point for routes heading north and east.\n\n📍 Near Abdullahpur Bridge, Dhaka-Mymensingh Highway\n🕐 Operating hours: 5:00 AM - 12:00 AM\n📞 Counter: [contact counter staff]\n\nFacilities: Waiting lounge, washroom, ticket counter, small canteen.',
ARRAY['abdullahpur', 'terminal', 'dhaka', 'uttara', 'location', 'address'],
'faq', 0.90),

('Maniknagar Terminal', 'counter',
'Where is the Maniknagar terminal?',
'Star Line Maniknagar Terminal is located near Sayedabad Bus Terminal, Maniknagar, Dhaka. This serves routes heading south and southeast.\n\n📍 Maniknagar, near Sayedabad\n🕐 Operating hours: 5:00 AM - 12:00 AM\n\nFacilities: Waiting area, ticket counter, nearby restaurants.',
ARRAY['maniknagar', 'terminal', 'dhaka', 'sayedabad', 'location'],
'faq', 0.90),

-- ── Common Issues ────────────────────────────────────────────

('Lost Item on Bus', 'general',
'I left something on the bus.',
'If you''ve left an item on a Star Line bus:\n\n1. **Call immediately**: Hotline 16XXX — our team can contact the driver\n2. **Provide details**: Bus number, route, departure time, seat number, and item description\n3. **Visit the terminal**: Check with counter staff at the arrival terminal\n4. **File a complaint**: Use our AI chat to file a formal lost item report for tracking\n\nFound items are kept at the arrival terminal for 30 days. After that, unclaimed items may be disposed of.',
ARRAY['lost', 'forgot', 'left', 'item', 'belonging', 'missing'],
'faq', 0.90),

('Bus Delay Compensation', 'schedule',
'What happens if the bus is delayed?',
'Star Line''s delay policy:\n\n• **30-60 min delay**: Apology + free water/snacks\n• **1-2 hour delay**: Option to reschedule for free or get 25% refund\n• **2+ hour delay**: Full refund or free reschedule + compensation credit\n• **Trip cancelled**: Full refund + priority rebooking\n\nDelays due to natural disasters, road blocks, or government restrictions may not be eligible for compensation. Track your bus live on our website.',
ARRAY['delay', 'late', 'compensation', 'wait', 'time'],
'faq', 0.90),

('Child Ticket Policy', 'booking',
'Do children need a ticket?',
'Star Line child ticket policy:\n\n• **Under 3 years**: Free (must sit on guardian''s lap, no separate seat)\n• **3-11 years**: 50% fare (gets own seat)\n• **12+ years**: Full fare\n\nChildren under 12 must travel with an adult guardian. ID proof may be required for discounted child tickets.',
ARRAY['child', 'children', 'kid', 'baby', 'infant', 'age', 'discount'],
'faq', 0.95),

('Student Discount', 'booking',
'Is there a student discount?',
'Star Line offers a 10% student discount on select routes:\n\n• Valid student ID required at boarding\n• Available on Economy and Business class only\n• Not valid during peak seasons (Eid, Puja, etc.)\n• Book online and select "Student" as passenger type\n\nFor institutional/bulk student bookings, contact our corporate team at corporate@starline.com.bd.',
ARRAY['student', 'discount', 'offer', 'university', 'school'],
'faq', 0.85)

ON CONFLICT DO NOTHING;

-- Verify count
SELECT count(*) as total_entries FROM knowledge_base;
