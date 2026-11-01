// utils/emailService.js - Nodemailer Email Service
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP email for signup verification
 */
const sendVerificationOTP = async (email, name, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🎉 FESTIVA - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#0f0f1a;">
        <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;overflow:hidden;border:1px solid rgba(255,165,0,0.3);">
          <div style="background:linear-gradient(135deg,#ff6b35,#f7c59f);padding:40px;text-align:center;">
            <h1 style="margin:0;font-size:36px;font-weight:900;color:#0f0f1a;letter-spacing:-1px;">🎊 FESTIVA</h1>
            <p style="margin:8px 0 0;color:rgba(15,15,26,0.8);font-size:14px;">Event Management System</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#fff;margin:0 0 16px;font-size:24px;">Welcome, ${name}! 👋</h2>
            <p style="color:rgba(255,255,255,0.7);margin:0 0 32px;line-height:1.6;">
              Thanks for joining FESTIVA! Please verify your email with the OTP below.
              This code expires in <strong style="color:#ff6b35;">10 minutes</strong>.
            </p>
            <div style="background:rgba(255,107,53,0.15);border:2px dashed rgba(255,107,53,0.5);border-radius:12px;padding:24px;text-align:center;margin:0 0 32px;">
              <p style="color:rgba(255,255,255,0.6);margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
              <div style="font-size:48px;font-weight:900;color:#ff6b35;letter-spacing:12px;">${otp}</div>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
          <div style="padding:20px 40px;background:rgba(0,0,0,0.3);text-align:center;">
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">© 2024 FESTIVA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send payment OTP before ticket booking
 */
const sendPaymentOTP = async (email, name, otp, eventTitle) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🔐 FESTIVA - Payment Verification for ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#0f0f1a;">
        <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;overflow:hidden;border:1px solid rgba(255,165,0,0.3);">
          <div style="background:linear-gradient(135deg,#6c63ff,#3ecf8e);padding:40px;text-align:center;">
            <h1 style="margin:0;font-size:36px;font-weight:900;color:#fff;">🔐 Payment OTP</h1>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#fff;margin:0 0 8px;">Hi ${name},</h2>
            <p style="color:rgba(255,255,255,0.7);">You're booking tickets for: <strong style="color:#6c63ff;">${eventTitle}</strong></p>
            <div style="background:rgba(108,99,255,0.15);border:2px dashed rgba(108,99,255,0.5);border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <p style="color:rgba(255,255,255,0.6);margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Payment OTP</p>
              <div style="font-size:48px;font-weight:900;color:#6c63ff;letter-spacing:12px;">${otp}</div>
              <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:8px 0 0;">Valid for 5 minutes</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send ticket confirmation email with PDF attachment
 */
const sendTicketConfirmation = async (email, name, booking, event, pdfBuffer) => {
  const transporter = createTransporter();
  const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `🎟️ Your FESTIVA Ticket - ${event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f5f5f5;">
        <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
          <div style="background:linear-gradient(135deg,#ff6b35,#f7931e);padding:40px;text-align:center;">
            <h1 style="margin:0;font-size:36px;font-weight:900;color:#fff;">🎊 FESTIVA</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);">Booking Confirmed!</p>
          </div>
          
          <div style="padding:40px;">
            <h2 style="color:#1a1a2e;margin:0 0 8px;">Hey ${name}! 🎉</h2>
            <p style="color:#666;margin:0 0 32px;">Your ticket has been confirmed. See you at the event!</p>
            
            <div style="background:#f9f9f9;border-radius:12px;padding:24px;margin:0 0 24px;border-left:4px solid #ff6b35;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Ticket #</td><td style="padding:8px 0;font-weight:700;color:#ff6b35;">${booking.ticketNumber}</td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Event</td><td style="padding:8px 0;font-weight:600;color:#1a1a2e;">${event.title}</td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Date</td><td style="padding:8px 0;color:#333;">${eventDate}</td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Time</td><td style="padding:8px 0;color:#333;">${event.time}</td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Venue</td><td style="padding:8px 0;color:#333;">${event.location.venue}, ${event.location.city}</td></tr>
                <tr><td style="padding:8px 0;color:#999;font-size:13px;">Tickets</td><td style="padding:8px 0;color:#333;">${booking.quantity} × ₹${event.price}</td></tr>
                <tr style="border-top:1px solid #eee;"><td style="padding:12px 0;color:#1a1a2e;font-weight:700;">Total Paid</td><td style="padding:12px 0;font-weight:700;color:#2ecc71;font-size:18px;">₹${booking.totalAmount}</td></tr>
              </table>
            </div>
            
            <p style="color:#999;font-size:13px;text-align:center;">Your PDF ticket is attached below. Please carry it to the event.</p>
          </div>
          
          <div style="padding:20px 40px;background:#f5f5f5;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0;">© 2024 FESTIVA • Questions? Contact support@festiva.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `FESTIVA-Ticket-${booking.ticketNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationOTP, sendPaymentOTP, sendTicketConfirmation };
