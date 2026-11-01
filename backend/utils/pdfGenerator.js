// utils/pdfGenerator.js - PDF Ticket Generation using PDFKit
const PDFDocument = require('pdfkit');

/**
 * Generate a stylish PDF ticket
 */
const generateTicketPDF = (booking, user, event) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 0 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const W = 420; // A5 width in points
    const H = 595; // A5 height

    // Background
    doc.rect(0, 0, W, H).fill('#0f0f1a');

    // Header gradient band
    doc.rect(0, 0, W, 140).fill('#ff6b35');

    // Brand name
    doc.font('Helvetica-Bold').fontSize(32).fillColor('#ffffff');
    doc.text('🎊 FESTIVA', 30, 30, { align: 'center', width: W - 60 });

    doc.font('Helvetica').fontSize(11).fillColor('rgba(255,255,255,0.85)');
    doc.text('OFFICIAL EVENT TICKET', 30, 72, { align: 'center', width: W - 60, characterSpacing: 3 });

    // Ticket number badge
    doc.rect(W / 2 - 100, 100, 200, 34).fill('rgba(0,0,0,0.3)').stroke();
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#fff');
    doc.text(booking.ticketNumber, W / 2 - 100, 110, { align: 'center', width: 200 });

    // Dashed separator line
    const dashY = 148;
    let x = 0;
    while (x < W) {
      doc.rect(x, dashY, 10, 2).fill('#ff6b35');
      x += 16;
    }

    // Event details section
    const startY = 170;
    const col1 = 30;

    // Event title
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#ff6b35');
    const title = event.title.length > 35 ? event.title.substring(0, 35) + '...' : event.title;
    doc.text(title, col1, startY, { width: W - 60 });

    const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Details grid
    const details = [
      { label: 'DATE', value: eventDate },
      { label: 'TIME', value: event.time },
      { label: 'VENUE', value: `${event.location.venue}` },
      { label: 'CITY', value: event.location.city },
      { label: 'ATTENDEE', value: user.name },
      { label: 'EMAIL', value: user.email },
      { label: 'TICKETS', value: `${booking.quantity} ticket(s)` },
      { label: 'PRICE EACH', value: `₹${event.price}` },
    ];

    let yPos = startY + 50;
    details.forEach((item) => {
      doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.45)').text(item.label, col1, yPos, { characterSpacing: 2 });
      doc.font('Helvetica').fontSize(11).fillColor('#fff').text(item.value, col1 + 110, yPos, { width: W - col1 - 120 });
      yPos += 30;
    });

    // Total amount box
    yPos += 10;
    doc.rect(col1, yPos, W - col1 * 2, 48).fill('#ff6b35');
    doc.font('Helvetica').fontSize(10).fillColor('rgba(255,255,255,0.8)').text('TOTAL AMOUNT PAID', col1 + 16, yPos + 8);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#fff').text(`₹${booking.totalAmount}`, col1 + 16, yPos + 22);

    // Status badge
    yPos += 70;
    doc.rect(col1, yPos, 100, 26).fill('#2ecc71');
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#fff').text('✓ CONFIRMED', col1 + 8, yPos + 8);

    // Payment ID
    if (booking.paymentId) {
      doc.font('Helvetica').fontSize(8).fillColor('rgba(255,255,255,0.35)').text(`Payment ID: ${booking.paymentId}`, col1, yPos + 40);
    }

    // Footer
    doc.rect(0, H - 50, W, 50).fill('rgba(0,0,0,0.4)');
    doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.4)');
    doc.text('Please present this ticket at the venue entrance.', 30, H - 38, { align: 'center', width: W - 60 });
    doc.text('© 2026 FESTIVA Event Management', 30, H - 22, { align: 'center', width: W - 60 });

    doc.end();
  });
};

module.exports = { generateTicketPDF };
