const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || 'TalentFlow AI <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

let resendClient = null;
if (RESEND_API_KEY && RESEND_API_KEY.startsWith('re_')) {
  resendClient = new Resend(RESEND_API_KEY);
  console.log('✅ Resend email client initialized.');
}

// Fallback nodemailer transport
const getFallbackTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

// Base HTML template generator for consistent TalentFlow branding
const createBaseTemplate = ({ title, preheader, bodyHtml, ctaText, ctaUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0b1120; padding: 40px 0; }
    .main-table { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border: 1px solid #1e293b; }
    .header { background: #0f172a; padding: 32px 30px; text-align: center; border-bottom: 2px solid #6366f1; }
    .brand-title { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-accent { color: #818cf8; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.65; color: #1e293b; }
    .h1-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.3px; }
    .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; }
    .btn { display: inline-block; padding: 13px 28px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 20px; text-align: center; }
    .detail-card { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .detail-row { margin: 6px 0; font-size: 14px; color: #334155; }
    .footer { padding: 24px; background-color: #f8fafc; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="main-table" role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td class="header">
              <h1 class="brand-title">TalentFlow <span class="brand-accent">AI</span></h1>
            </td>
          </tr>
          <tr>
            <td class="content">
              <h2 class="h1-title">${title}</h2>
              ${bodyHtml}
              ${ctaText && ctaUrl ? `
                <div style="text-align: center; margin-top: 28px;">
                  <a href="${ctaUrl}" class="btn" target="_blank">${ctaText} &rarr;</a>
                </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} TalentFlow AI Recruitment Platform. All rights reserved.</p>
              <p style="margin: 0; color: #94a3b8;">This is an automated transactional message. Please do not reply directly.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Core sender dispatcher
async function deliverEmail({ to, subject, html, text }) {
  if (!to) return null;

  // 1. Try Resend if configured
  if (resendClient) {
    try {
      const data = await resendClient.emails.send({
        from: MAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || subject
      });
      console.log(`[EmailService:Resend] Sent "${subject}" to ${to} (ID: ${data.id || data.data?.id})`);
      return data;
    } catch (err) {
      console.warn(`[EmailService:Resend] Error: ${err.message}. Trying fallback transport...`);
    }
  }

  // 2. Try Nodemailer fallback if configured
  const transporter = getFallbackTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `${process.env.FROM_NAME || 'TalentFlow AI'} <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || subject
      });
      console.log(`[EmailService:Nodemailer] Sent "${subject}" to ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (err) {
      console.warn(`[EmailService:Nodemailer] Error: ${err.message}`);
    }
  }

  // 3. Dev/Test mode preview log
  console.log(`[EmailService:Preview] To: ${to} | Subject: "${subject}"`);
  return { preview: true, to, subject };
}

// ─── 1. Verification OTP Email ───
exports.sendVerificationOTP = async ({ email, name = 'there', otp }) => {
  const title = 'Verify Your TalentFlow Account';
  const bodyHtml = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>Welcome to TalentFlow AI. To complete your registration and secure your account, please enter the 6-digit verification code below:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
    <p style="color: #64748b; font-size: 13px;">If you did not request this registration, please safely disregard this email.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Your TalentFlow Verification Code: ${otp}`,
    html: createBaseTemplate({
      title,
      preheader: `Your verification code is ${otp}. Valid for 10 minutes.`,
      bodyHtml,
      ctaText: 'Enter Verification Code',
      ctaUrl: `${APP_URL}/verify-email`
    }),
    text: `Your TalentFlow verification code is: ${otp}. It expires in 10 minutes.`
  });
};

// ─── 2. Welcome Email ───
exports.sendWelcomeEmail = async ({ email, name = 'there', role = 'candidate' }) => {
  const title = 'Welcome to TalentFlow AI!';
  const isRecruiter = role === 'recruiter';
  const bodyHtml = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your email has been verified successfully. Welcome to the next-generation AI recruitment ecosystem!</p>
    <div class="detail-card">
      <p class="detail-row"><strong>Role:</strong> ${isRecruiter ? 'Recruitment Partner / Hiring Manager' : 'Candidate'}</p>
      <p class="detail-row"><strong>Next Step:</strong> Complete your profile onboarding to unlock the full platform.</p>
    </div>
    <p>${isRecruiter 
      ? 'Set up your company workspace, post verified openings, and utilize AI screening to discover top engineering talent.' 
      : 'Optimize your resume with our AI Studio, test your skills in the Mock Interview Simulator, and track applications in real time.'}</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Welcome to TalentFlow AI, ${name}!`,
    html: createBaseTemplate({
      title,
      preheader: `Your account is ready! Complete your onboarding to get started.`,
      bodyHtml,
      ctaText: 'Complete Your Onboarding',
      ctaUrl: `${APP_URL}/onboarding`
    }),
    text: `Welcome to TalentFlow AI! Complete your onboarding at ${APP_URL}/onboarding`
  });
};

// ─── 3. Application Submitted Email ───
exports.sendApplicationSubmitted = async ({ email, candidateName = 'Candidate', jobTitle, companyName = 'the employer' }) => {
  const title = 'Application Submitted Successfully';
  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>We’ve received your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
    <div class="detail-card">
      <p class="detail-row"><strong>Role:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Company:</strong> ${companyName}</p>
      <p class="detail-row"><strong>Status:</strong> Applied (In Review)</p>
      <p class="detail-row"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
    </div>
    <p>The hiring team has been notified. You can track status updates and recruiter feedback directly from your Application Tracker.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Application Confirmed: ${jobTitle} at ${companyName}`,
    html: createBaseTemplate({
      title,
      preheader: `Your application for ${jobTitle} has been received.`,
      bodyHtml,
      ctaText: 'View in Application Tracker',
      ctaUrl: `${APP_URL}/applications`
    }),
    text: `Your application for ${jobTitle} at ${companyName} has been received.`
  });
};

// ─── 4. Application Status Update Email ───
exports.sendApplicationStatusUpdate = async ({ email, candidateName = 'Candidate', jobTitle, companyName = 'the employer', status, notes }) => {
  const title = `Application Update: ${status}`;
  const statusColors = {
    Screening: '#38bdf8',
    Shortlisted: '#818cf8',
    Interview: '#6366f1',
    Offer: '#10b981',
    Hired: '#059669',
    Rejected: '#ef4444'
  };
  const color = statusColors[status] || '#6366f1';

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>There is a new update regarding your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
    <div class="detail-card" style="border-left-color: ${color};">
      <p class="detail-row"><strong>New Stage:</strong> <span style="display:inline-block;padding:2px 8px;background:${color}20;color:${color};font-weight:700;border-radius:4px;">${status.toUpperCase()}</span></p>
      <p class="detail-row"><strong>Role:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Company:</strong> ${companyName}</p>
      ${notes ? `<p class="detail-row" style="margin-top:10px;"><strong>Recruiter Note:</strong> "${notes}"</p>` : ''}
    </div>
    <p>Log in to your candidate portal to view details, prepare next steps, or communicate with the hiring team.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Update on your application: ${jobTitle} (${status})`,
    html: createBaseTemplate({
      title,
      preheader: `Your application status for ${jobTitle} is now ${status}.`,
      bodyHtml,
      ctaText: 'Open Application Tracker',
      ctaUrl: `${APP_URL}/applications`
    }),
    text: `Your application status for ${jobTitle} at ${companyName} is now ${status}.`
  });
};

// ─── 5. Interview Scheduled Email ───
exports.sendInterviewScheduled = async ({ email, candidateName = 'Candidate', jobTitle, date, time, location, meetLink }) => {
  const title = 'Interview Scheduled';
  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Great news! An interview round has been scheduled for your application for <strong>${jobTitle}</strong>.</p>
    <div class="detail-card">
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Date:</strong> ${date}</p>
      <p class="detail-row"><strong>Time:</strong> ${time}</p>
      <p class="detail-row"><strong>Location/Link:</strong> ${location || meetLink || 'Video Conference'}</p>
      ${meetLink ? `<p class="detail-row"><strong>Meeting URL:</strong> <a href="${meetLink}" target="_blank">${meetLink}</a></p>` : ''}
    </div>
    <p>Tip: You can use our built-in <strong>Mock Interview Simulator</strong> to practice technical questions and receive AI feedback before your interview.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Interview Confirmed: ${jobTitle} on ${date}`,
    html: createBaseTemplate({
      title,
      preheader: `Interview confirmed for ${jobTitle} on ${date} at ${time}.`,
      bodyHtml,
      ctaText: 'View Interview Details',
      ctaUrl: `${APP_URL}/interviews`
    }),
    text: `Interview scheduled for ${jobTitle} on ${date} at ${time}.`
  });
};

// ─── 6. Interview Rescheduled / Updated Email ───
exports.sendInterviewUpdated = async ({ email, candidateName = 'Candidate', jobTitle, date, time, location, meetLink }) => {
  const title = 'Interview Rescheduled';
  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Please note that your upcoming interview for <strong>${jobTitle}</strong> has been updated with new schedule details.</p>
    <div class="detail-card">
      <p class="detail-row"><strong>New Date:</strong> ${date}</p>
      <p class="detail-row"><strong>New Time:</strong> ${time}</p>
      <p class="detail-row"><strong>Location:</strong> ${location || meetLink || 'Online'}</p>
    </div>
    <p>Please check your interview dashboard to confirm your availability.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Interview Rescheduled: ${jobTitle} — ${date}`,
    html: createBaseTemplate({
      title,
      preheader: `Your interview for ${jobTitle} has been moved to ${date} at ${time}.`,
      bodyHtml,
      ctaText: 'Check My Schedule',
      ctaUrl: `${APP_URL}/interviews`
    }),
    text: `Your interview for ${jobTitle} was rescheduled to ${date} at ${time}.`
  });
};

// ─── 7. Interview Cancelled Email ───
exports.sendInterviewCancelled = async ({ email, candidateName = 'Candidate', jobTitle, reason }) => {
  const title = 'Interview Cancelled';
  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Your interview for the <strong>${jobTitle}</strong> position has been cancelled.</p>
    ${reason ? `<div class="detail-card"><p class="detail-row"><strong>Reason:</strong> ${reason}</p></div>` : ''}
    <p>Your recruiter will reach out with next steps or alternative availability.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `Interview Cancelled: ${jobTitle}`,
    html: createBaseTemplate({
      title,
      preheader: `Your interview for ${jobTitle} has been cancelled.`,
      bodyHtml,
      ctaText: 'Go to TalentFlow Portal',
      ctaUrl: `${APP_URL}/dashboard`
    }),
    text: `Your interview for ${jobTitle} was cancelled.`
  });
};

// ─── 8. New Recruiter/Candidate Message Email ───
exports.sendNewMessage = async ({ email, recipientName = 'there', senderName = 'A hiring team member', previewText }) => {
  const title = 'New Message Received';
  const bodyHtml = `
    <p>Hi <strong>${recipientName}</strong>,</p>
    <p><strong>${senderName}</strong> sent you a new message on TalentFlow Messenger:</p>
    <div class="detail-card">
      <p class="detail-row" style="font-style: italic; color: #1e293b;">
        "${previewText ? previewText.substring(0, 200) : 'You have received a new message.'}..."
      </p>
    </div>
    <p>Sign in to reply and keep your conversation moving forward.</p>
  `;

  return deliverEmail({
    to: email,
    subject: `New message from ${senderName} on TalentFlow`,
    html: createBaseTemplate({
      title,
      preheader: `New message from ${senderName}: "${previewText?.substring(0, 60)}..."`,
      bodyHtml,
      ctaText: 'Reply on TalentFlow',
      ctaUrl: `${APP_URL}/messages`
    }),
    text: `New message from ${senderName}: ${previewText}`
  });
};

// Backward-compatible alias for existing imports
module.exports = exports;
