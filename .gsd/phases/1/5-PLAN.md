---
phase: 1
plan: 5
wave: 3
---

# Plan 1.5: QR Code Generation & PDF Ticket Download

## Objective
Add real QR code generation and downloadable PDF tickets to the booking confirmation page.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md (Phase 1 Decisions)
- src/pages/TicketConfirmation.tsx

## Tasks

<task type="auto">
  <name>Install QR and PDF libraries</name>
  <files>package.json</files>
  <action>
    Install required libraries:
    ```
    npm install qrcode.react html2canvas jspdf
    npm install -D @types/html2canvas
    ```
    
    - `qrcode.react` — React component that generates real QR codes from data
    - `jspdf` — Client-side PDF generation
    - `html2canvas` — Captures HTML as canvas for PDF rendering
  </action>
  <verify>Run `npm ls qrcode.react jspdf html2canvas` — all three installed.</verify>
  <done>QR code and PDF dependencies installed.</done>
</task>

<task type="auto">
  <name>Add real QR code and PDF download to TicketConfirmation</name>
  <files>src/pages/TicketConfirmation.tsx</files>
  <action>
    1. Replace the static QR icon with a real QR code:
       - Import `QRCodeSVG` from `qrcode.react`
       - Generate QR data as a JSON string containing: bookingId, from, to, date, seats, fare, passengerName
       - Replace the `<QrCode>` lucide icon (line 45) with `<QRCodeSVG value={qrData} size={80} />`
       - Style: white background with padding inside the rounded container
    
    2. Make "Download Ticket" button functional:
       - Create a `downloadTicket` async function:
         a. Use `html2canvas` to capture the ticket card as an image
         b. Create a new `jsPDF` document (A5 size)
         c. Add the Star Line Group logo/text header
         d. Add the captured ticket image
         e. Save as `StarLine-{bookingId}.pdf`
       - Attach `downloadTicket` to the button's `onClick`
       - Add loading state while generating PDF (show spinner on button)
    
    3. Give the ticket card a `ref` for html2canvas to target:
       `const ticketRef = useRef<HTMLDivElement>(null);`
       Apply ref to the ticket motion.div wrapper.
  </action>
  <verify>Complete a booking flow → on TicketConfirmation page: real QR code visible (not icon). Click "Download Ticket" → PDF downloads with ticket details.</verify>
  <done>Real QR code shows booking data. PDF downloads with ticket layout. Both work correctly.</done>
</task>

## Success Criteria
- [ ] QR code is real and scannable (contains booking data)
- [ ] "Download Ticket" button generates and downloads a PDF
- [ ] PDF contains all ticket information
