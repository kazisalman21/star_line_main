## Plan 1.5 Summary: QR Code Generation & PDF Ticket Download

**Status:** ✅ Complete

### Tasks Completed
1. **Dependencies installed** — `qrcode.react`, `jspdf`, `html2canvas` added to project.
2. **Real QR code** — `QRCodeSVG` renders scannable QR containing booking JSON data (id, from, to, date, seats, passenger, fare).
3. **PDF download** — `downloadTicket()` uses `html2canvas` to capture ticket card, `jsPDF` to create A5 PDF with Star Line header and footer. Button shows loading spinner while generating.

### Files Modified
- `package.json`
- `src/pages/TicketConfirmation.tsx`
