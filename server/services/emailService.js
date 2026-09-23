const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || 'TalentFlow AI <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'https://rms-blush-iota.vercel.app';
const EMAIL_MODE = process.env.EMAIL_MODE || (process.env.NODE_ENV === 'production' ? 'production' : 'development');

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

// Safe date formatter
const formatDate = (d) => {
  if (!d) return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Base HTML template generator for consistent TalentFlow branding
const createBaseTemplate = ({ title, preheader, bodyHtml, ctaText, ctaUrl, secondaryCtaText, secondaryCtaUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0b1120; padding: 36px 0; }
    .main-table { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #1e293b; }
    .header { background: #0f172a; padding: 28px 30px; text-align: center; border-bottom: 2px solid #6366f1; }
    .brand-title { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-accent { color: #818cf8; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.65; color: #1e293b; }
    .h1-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.3px; }
    .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 4px; text-align: center; }
    .btn-secondary { background-color: #f1f5f9; color: #334155 !important; border: 1px solid #cbd5e1; }
    .detail-card { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 6px; padding: 16px 20px; margin: 20px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .detail-row { margin: 7px 0; font-size: 14px; color: #334155; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
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
              ${(ctaText || secondaryCtaText) ? `
                <div style="text-align: center; margin-top: 28px;">
                  ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="btn" target="_blank">${ctaText} &rarr;</a>` : ''}
                  ${secondaryCtaText && secondaryCtaUrl ? `<a href="${secondaryCtaUrl}" class="btn btn-secondary" target="_blank">${secondaryCtaText}</a>` : ''}
                </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} TalentFlow AI Recruitment Platform. All rights reserved.</p>
              <p style="margin: 0; color: #94a3b8;">This is an automated transactional notification. Please do not reply directly.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Helper: Check idempotency key to prevent duplicate delivery within 5 minutes
async function checkIdempotency(idempotencyKey) {
  if (!idempotencyKey) return false;
  try {
    const EmailLog = require('../models/EmailLog');
    const existing = await EmailLog.findOne({
      idempotencyKey,
      status: { $in: ['sent', 'preview'] },
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    return !!existing;
  } catch (err) {
    console.warn('[EmailService:Idempotency] Warning:', err.message);
    return false;
  }
}

// Core sender dispatcher with deduplication and demo-safe logging
async function deliverEmail({ to, subject, html, text, eventType, entityId, idempotencyKey, user }) {
  if (!to) return null;

  // 1. Duplicate check (Idempotency)
  if (idempotencyKey && await checkIdempotency(idempotencyKey)) {
    console.log(`[EmailService:Deduplicated] Skipped duplicate "${subject}" for ${to} (Key: ${idempotencyKey})`);
    return { deduplicated: true, to, subject };
  }

  const isDemo = user?.isDemoAccount || 
    to.endsWith('@demo.com') || 
    to.endsWith('@rms.com') || 
    to.endsWith('@talentflow.ai');

  // 2. Demo account safety: In development or for mock demo domains, simulate cleanly without bouncing
  if (isDemo && (!process.env.RESEND_API_KEY || EMAIL_MODE === 'development')) {
    console.log(`[EmailService:DemoSafe] Simulated "${subject}" to demo account ${to}`);
    try {
      const EmailLog = require('../models/EmailLog');
      await EmailLog.create({
        eventType: eventType || 'DEMO_SIMULATION',
        recipient: to,
        entityId,
        idempotencyKey,
        status: 'preview',
        subject,
        provider: 'demo-simulator'
      });
    } catch (e) {}
    return { preview: true, to, subject };
  }

  // 3. Try Resend if configured
  if (resendClient) {
    try {
      const data = await resendClient.emails.send({
        from: MAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || subject
      });
      const msgId = data.id || data.data?.id;
      console.log(`[EmailService:Resend] Sent "${subject}" to ${to} (ID: ${msgId})`);
      try {
        const EmailLog = require('../models/EmailLog');
        await EmailLog.create({
          eventType: eventType || 'TRANSACTIONAL',
          recipient: to,
          entityId,
          idempotencyKey,
          status: 'sent',
          subject,
          provider: 'resend',
          providerMessageId: msgId
        });
      } catch (e) {}
      return data;
    } catch (err) {
      console.warn(`[EmailService:Resend] Error: ${err.message}. Trying fallback transport...`);
      try {
        const EmailLog = require('../models/EmailLog');
        await EmailLog.create({
          eventType: eventType || 'TRANSACTIONAL',
          recipient: to,
          entityId,
          idempotencyKey,
          status: 'failed',
          subject,
          provider: 'resend',
          error: err.message
        });
      } catch (e) {}
    }
  }

  // 4. Try Nodemailer fallback if configured
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
      try {
        const EmailLog = require('../models/EmailLog');
        await EmailLog.create({
          eventType: eventType || 'TRANSACTIONAL',
          recipient: to,
          entityId,
          idempotencyKey,
          status: 'sent',
          subject,
          provider: 'nodemailer',
          providerMessageId: info.messageId
        });
      } catch (e) {}
      return info;
    } catch (err) {
      console.warn(`[EmailService:Nodemailer] Error: ${err.message}`);
      try {
        const EmailLog = require('../models/EmailLog');
        await EmailLog.create({
          eventType: eventType || 'TRANSACTIONAL',
          recipient: to,
          entityId,
          idempotencyKey,
          status: 'failed',
          subject,
          provider: 'nodemailer',
          error: err.message
        });
      } catch (e) {}
    }
  }

  // 5. Dev/Test mode preview log
  console.log(`[EmailService:Preview] To: ${to} | Subject: "${subject}"`);
  try {
    const EmailLog = require('../models/EmailLog');
    await EmailLog.create({
      eventType: eventType || 'PREVIEW',
      recipient: to,
      entityId,
      idempotencyKey,
      status: 'preview',
      subject,
      provider: 'preview'
    });
  } catch (e) {}
  return { preview: true, to, subject };
}

// ─────────────────────────────────────────────────────────────
// 1. APPLICATION SUBMISSION (BIDIRECTIONAL)
// ─────────────────────────────────────────────────────────────

// A. Send Email to Candidate
exports.sendApplicationSubmittedToCandidate = async ({ 
  email, 
  candidateName = 'there', 
  jobTitle = 'Position', 
  companyName = 'TalentFlow Partner', 
  status = 'Applied', 
  appliedDate = new Date(),
  applicationId,
  idempotencyKey 
}) => {
  const subject = `Application submitted — ${jobTitle} at ${companyName}`;
  const title = 'Application Submitted Successfully';
  const formattedDate = formatDate(appliedDate);

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
    
    <div class="detail-card">
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Company:</strong> ${companyName}</p>
      <p class="detail-row"><strong>Application status:</strong> <span class="badge" style="background:#e0f2fe;color:#0284c7;">${status}</span></p>
      <p class="detail-row"><strong>Application date:</strong> ${formattedDate}</p>
    </div>

    <p>The hiring team has received your profile and credentials. You can view your real-time status and recruiter notes anytime from your Application Tracker.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Your application for ${jobTitle} at ${companyName} has been received.`,
      bodyHtml,
      ctaText: 'View Application',
      ctaUrl: `${APP_URL}/applications`
    }),
    text: `Hi ${candidateName}, your application for ${jobTitle} at ${companyName} has been successfully submitted. Status: ${status}. Date: ${formattedDate}.`,
    eventType: 'APPLICATION_SUBMITTED_CANDIDATE',
    entityId: applicationId,
    idempotencyKey: idempotencyKey || `app_sub_cand_${applicationId || email}_${jobTitle}`
  });
};

// B. Send Email to Recruiter
exports.sendNewApplicationToRecruiter = async ({ 
  email, 
  recruiterName = 'Hiring Manager', 
  candidateName = 'A Candidate', 
  candidateEmail, 
  jobTitle = 'Position', 
  companyName = 'TalentFlow Partner', 
  matchScore = 85, 
  status = 'Applied',
  candidateId,
  applicationId,
  idempotencyKey
}) => {
  const subject = `New application received — ${candidateName} for ${jobTitle}`;
  const title = 'New Candidate Application Received';

  const bodyHtml = `
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p>A new candidate has applied for <strong>${jobTitle}</strong>.</p>
    
    <div class="detail-card">
      <p class="detail-row"><strong>Candidate:</strong> ${candidateName}</p>
      <p class="detail-row"><strong>Email:</strong> ${candidateEmail || 'Protected'}</p>
      <p class="detail-row"><strong>AI Match:</strong> <span style="font-weight:700;color:#10b981;">${matchScore}%</span></p>
      <p class="detail-row"><strong>Application status:</strong> <span class="badge" style="background:#e0f2fe;color:#0284c7;">${status}</span></p>
    </div>

    <p>The candidate profile and technical qualifications are ready for your review in the hiring pipeline.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `New candidate ${candidateName} applied for ${jobTitle} (${matchScore}% match).`,
      bodyHtml,
      ctaText: 'View Application',
      ctaUrl: `${APP_URL}/crm`,
      secondaryCtaText: 'View Candidate',
      secondaryCtaUrl: `${APP_URL}/candidates`
    }),
    text: `Hi ${recruiterName}, a new candidate (${candidateName}, ${candidateEmail}) applied for ${jobTitle} with ${matchScore}% AI match.`,
    eventType: 'APPLICATION_SUBMITTED_RECRUITER',
    entityId: applicationId,
    idempotencyKey: idempotencyKey || `app_sub_rec_${applicationId || email}_${jobTitle}`
  });
};

// ─────────────────────────────────────────────────────────────
// 2. APPLICATION STATUS CHANGES (BIDIRECTIONAL)
// ─────────────────────────────────────────────────────────────

const getStatusBadgeStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('screen')) return { bg: '#e0f2fe', color: '#0284c7' };
  if (s.includes('shortlist')) return { bg: '#ede9fe', color: '#7c3aed' };
  if (s.includes('interview')) return { bg: '#e0e7ff', color: '#4338ca' };
  if (s.includes('offer')) return { bg: '#dcfce7', color: '#16a34a' };
  if (s.includes('hired')) return { bg: '#d1fae5', color: '#059669' };
  if (s.includes('reject')) return { bg: '#fee2e2', color: '#dc2626' };
  return { bg: '#f1f5f9', color: '#475569' };
};

// A. Send Status Update to Candidate
exports.sendApplicationStatusUpdatedToCandidate = async ({
  email,
  candidateName = 'there',
  jobTitle = 'Position',
  companyName = 'the employer',
  previousStatus = 'Applied',
  newStatus = 'Screening',
  updatedDate = new Date(),
  notes,
  applicationId,
  idempotencyKey
}) => {
  const subject = `Application update — ${jobTitle} at ${companyName}`;
  const title = `Application Update: ${newStatus}`;
  const badge = getStatusBadgeStyle(newStatus);
  const formattedDate = formatDate(updatedDate);

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been moved to:</p>
    
    <div style="margin: 16px 0;">
      <span class="badge" style="background:${badge.bg};color:${badge.color};font-size:14px;padding:6px 14px;">
        ${newStatus}
      </span>
    </div>

    <div class="detail-card" style="border-left-color: ${badge.color};">
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Company:</strong> ${companyName}</p>
      <p class="detail-row"><strong>Previous status:</strong> ${previousStatus}</p>
      <p class="detail-row"><strong>New status:</strong> ${newStatus}</p>
      <p class="detail-row"><strong>Updated date:</strong> ${formattedDate}</p>
      ${notes ? `<p class="detail-row" style="margin-top:10px;"><strong>Next action / Recruiter Note:</strong> "${notes}"</p>` : ''}
    </div>

    <p>Sign in to your candidate portal to track next steps and prepare for potential interview rounds.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Your application for ${jobTitle} is now in ${newStatus}.`,
      bodyHtml,
      ctaText: 'View Application Tracker',
      ctaUrl: `${APP_URL}/applications`
    }),
    text: `Hi ${candidateName}, your application for ${jobTitle} at ${companyName} has moved from ${previousStatus} to ${newStatus}. Date: ${formattedDate}.`,
    eventType: 'APPLICATION_STATUS_CANDIDATE',
    entityId: applicationId,
    idempotencyKey: idempotencyKey || `app_status_cand_${applicationId}_${newStatus}`
  });
};

// B. Send Status Update Confirmation to Recruiter
exports.sendApplicationStatusUpdatedToRecruiter = async ({
  email,
  recruiterName = 'Recruiter',
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  previousStatus = 'Applied',
  newStatus = 'Screening',
  updatedBy = 'Hiring Team',
  applicationId,
  idempotencyKey
}) => {
  const subject = `Application status updated — ${candidateName}`;
  const title = 'Application Status Updated';
  const badge = getStatusBadgeStyle(newStatus);

  const bodyHtml = `
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p>The application for <strong>${candidateName}</strong> has been updated.</p>

    <div class="detail-card" style="border-left-color: ${badge.color};">
      <p class="detail-row"><strong>Candidate:</strong> ${candidateName}</p>
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Previous status:</strong> ${previousStatus}</p>
      <p class="detail-row"><strong>New status:</strong> <span class="badge" style="background:${badge.bg};color:${badge.color};">${newStatus}</span></p>
      <p class="detail-row"><strong>Updated by:</strong> ${updatedBy}</p>
    </div>

    <p>This confirmation verifies that the candidate's hiring stage was successfully updated in your TalentFlow database.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Application for ${candidateName} updated from ${previousStatus} to ${newStatus}.`,
      bodyHtml,
      ctaText: 'View Application',
      ctaUrl: `${APP_URL}/crm`
    }),
    text: `Hi ${recruiterName}, the application for ${candidateName} (${jobTitle}) was updated from ${previousStatus} to ${newStatus} by ${updatedBy}.`,
    eventType: 'APPLICATION_STATUS_RECRUITER',
    entityId: applicationId,
    idempotencyKey: idempotencyKey || `app_status_rec_${applicationId}_${newStatus}`
  });
};

// ─────────────────────────────────────────────────────────────
// 3. INTERVIEW SCHEDULED (BIDIRECTIONAL)
// ─────────────────────────────────────────────────────────────

// A. Send Interview Scheduled to Candidate
exports.sendInterviewScheduledToCandidate = async ({
  email,
  candidateName = 'there',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  interviewType = 'virtual',
  date = new Date(),
  time = '14:00',
  duration = '45 mins',
  interviewer,
  meetLink,
  prepLink,
  interviewId,
  idempotencyKey
}) => {
  const subject = `Interview scheduled — ${jobTitle} at ${companyName}`;
  const title = 'Interview Scheduled';
  const formattedDate = formatDate(date);

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>An interview round has been scheduled for your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
    
    <div class="detail-card">
      <p class="detail-row"><strong>Role:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Company:</strong> ${companyName}</p>
      <p class="detail-row"><strong>Interview Type:</strong> ${interviewType === 'in-person' ? 'On-site / In-person' : 'Virtual Video Conference'}</p>
      <p class="detail-row"><strong>Date:</strong> ${formattedDate}</p>
      <p class="detail-row"><strong>Time:</strong> ${time}</p>
      <p class="detail-row"><strong>Duration:</strong> ${duration}</p>
      <p class="detail-row"><strong>Interviewer:</strong> ${interviewer || `${companyName} Hiring Team`}</p>
      ${meetLink ? `<p class="detail-row"><strong>Meeting Link:</strong> <a href="${meetLink}" target="_blank" style="color:#4f46e5;font-weight:600;">${meetLink}</a></p>` : ''}
    </div>

    <p>Practice technical dimensions, architecture questions, and behavioral responses in our built-in <strong>AI Mock Interview Simulator</strong> before your session.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Interview confirmed for ${jobTitle} on ${formattedDate} at ${time}.`,
      bodyHtml,
      ctaText: 'Prepare in AI Simulator',
      ctaUrl: prepLink || `${APP_URL}/interview-simulator`,
      secondaryCtaText: 'View My Interviews',
      secondaryCtaUrl: `${APP_URL}/interviews`
    }),
    text: `Hi ${candidateName}, your interview for ${jobTitle} at ${companyName} is scheduled for ${formattedDate} at ${time}. Link: ${meetLink || 'N/A'}`,
    eventType: 'INTERVIEW_SCHEDULED_CANDIDATE',
    entityId: interviewId,
    idempotencyKey: idempotencyKey || `int_sched_cand_${interviewId || email}_${formattedDate}`
  });
};

// B. Send Interview Scheduled to Recruiter
exports.sendInterviewScheduledToRecruiter = async ({
  email,
  recruiterName = 'Recruiter',
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  interviewType = 'virtual',
  date = new Date(),
  time = '14:00',
  meetLink,
  currentStage = 'Interview',
  interviewId,
  idempotencyKey
}) => {
  const subject = `Interview scheduled — ${candidateName}`;
  const title = 'Interview Scheduled Confirmation';
  const formattedDate = formatDate(date);

  const bodyHtml = `
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p>An interview has been scheduled with <strong>${candidateName}</strong>.</p>
    
    <div class="detail-card">
      <p class="detail-row"><strong>Candidate:</strong> ${candidateName}</p>
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Interview Date & Time:</strong> ${formattedDate} at ${time}</p>
      <p class="detail-row"><strong>Interview Type:</strong> ${interviewType === 'in-person' ? 'On-site / In-person' : 'Virtual Video Conference'}</p>
      ${meetLink ? `<p class="detail-row"><strong>Meeting Link:</strong> <a href="${meetLink}" target="_blank" style="color:#4f46e5;font-weight:600;">${meetLink}</a></p>` : ''}
      <p class="detail-row"><strong>Current application stage:</strong> ${currentStage}</p>
    </div>

    <p>The candidate has been notified via email and calendar sync with preparation resources.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Interview confirmed with ${candidateName} for ${jobTitle} on ${formattedDate} at ${time}.`,
      bodyHtml,
      ctaText: 'View Interviews',
      ctaUrl: `${APP_URL}/interviews`
    }),
    text: `Hi ${recruiterName}, interview scheduled with ${candidateName} for ${jobTitle} on ${formattedDate} at ${time}.`,
    eventType: 'INTERVIEW_SCHEDULED_RECRUITER',
    entityId: interviewId,
    idempotencyKey: idempotencyKey || `int_sched_rec_${interviewId || email}_${formattedDate}`
  });
};

// ─────────────────────────────────────────────────────────────
// 4. INTERVIEW CHANGES (RESCHEDULED / CANCELLED)
// ─────────────────────────────────────────────────────────────

// A. Send Rescheduled to Candidate
exports.sendInterviewUpdatedToCandidate = async ({
  email,
  candidateName = 'there',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  oldDate,
  oldTime,
  newDate = new Date(),
  newTime = '14:00',
  meetLink,
  interviewType = 'virtual',
  interviewId,
  idempotencyKey
}) => {
  const subject = `Interview rescheduled — ${jobTitle} at ${companyName}`;
  const title = 'Interview Schedule Updated';
  const formattedNewDate = formatDate(newDate);
  const formattedOldDate = oldDate ? formatDate(oldDate) : 'Previous Date';

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Please note that your upcoming interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been rescheduled.</p>
    
    <div class="detail-card" style="border-left-color: #f59e0b;">
      <p class="detail-row" style="color: #94a3b8; text-decoration: line-through;">
        <strong>OLD DATE/TIME:</strong> ${formattedOldDate} at ${oldTime || 'N/A'}
      </p>
      <p class="detail-row" style="font-weight: 700; color: #0f172a;">
        <strong>NEW DATE/TIME:</strong> ${formattedNewDate} at ${newTime}
      </p>
      <p class="detail-row"><strong>Interview Type:</strong> ${interviewType === 'in-person' ? 'On-site' : 'Virtual'}</p>
      ${meetLink ? `<p class="detail-row"><strong>Meeting Link:</strong> <a href="${meetLink}" target="_blank" style="color:#4f46e5;">${meetLink}</a></p>` : ''}
    </div>

    <p>Please log in to your dashboard to confirm your availability.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Interview for ${jobTitle} moved to ${formattedNewDate} at ${newTime}.`,
      bodyHtml,
      ctaText: 'Check Interview Schedule',
      ctaUrl: `${APP_URL}/interviews`
    }),
    text: `Hi ${candidateName}, your interview for ${jobTitle} was rescheduled from ${formattedOldDate} to ${formattedNewDate} at ${newTime}.`,
    eventType: 'INTERVIEW_UPDATED_CANDIDATE',
    entityId: interviewId,
    idempotencyKey: idempotencyKey || `int_upd_cand_${interviewId}_${formattedNewDate}_${newTime}`
  });
};

// B. Send Rescheduled to Recruiter
exports.sendInterviewUpdatedToRecruiter = async ({
  email,
  recruiterName = 'Recruiter',
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  oldDate,
  oldTime,
  newDate = new Date(),
  newTime = '14:00',
  meetLink,
  interviewType = 'virtual',
  interviewId,
  idempotencyKey
}) => {
  const subject = `Interview rescheduled — ${candidateName}`;
  const title = 'Interview Rescheduled';
  const formattedNewDate = formatDate(newDate);
  const formattedOldDate = oldDate ? formatDate(oldDate) : 'Previous Date';

  const bodyHtml = `
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p>The interview with <strong>${candidateName}</strong> for <strong>${jobTitle}</strong> has been updated with new schedule details.</p>
    
    <div class="detail-card" style="border-left-color: #f59e0b;">
      <p class="detail-row"><strong>Candidate:</strong> ${candidateName}</p>
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row" style="color: #94a3b8; text-decoration: line-through;">
        <strong>OLD DATE/TIME:</strong> ${formattedOldDate} at ${oldTime || 'N/A'}
      </p>
      <p class="detail-row" style="font-weight: 700; color: #0f172a;">
        <strong>NEW DATE/TIME:</strong> ${formattedNewDate} at ${newTime}
      </p>
      ${meetLink ? `<p class="detail-row"><strong>Meeting Link:</strong> <a href="${meetLink}" target="_blank" style="color:#4f46e5;">${meetLink}</a></p>` : ''}
    </div>

    <p>The candidate has been notified of this updated time slot.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Interview with ${candidateName} rescheduled to ${formattedNewDate} at ${newTime}.`,
      bodyHtml,
      ctaText: 'View Interviews',
      ctaUrl: `${APP_URL}/interviews`
    }),
    text: `Hi ${recruiterName}, interview with ${candidateName} for ${jobTitle} was rescheduled to ${formattedNewDate} at ${newTime}.`,
    eventType: 'INTERVIEW_UPDATED_RECRUITER',
    entityId: interviewId,
    idempotencyKey: idempotencyKey || `int_upd_rec_${interviewId}_${formattedNewDate}_${newTime}`
  });
};

// C. Send Cancelled to Candidate
exports.sendInterviewCancelledToCandidate = async ({
  email,
  candidateName = 'there',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  date,
  time,
  reason,
  interviewId,
  idempotencyKey
}) => {
  const subject = `Interview cancelled — ${jobTitle} at ${companyName}`;
  const title = 'Interview Cancelled';
  const formattedDate = date ? formatDate(date) : '';

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Your scheduled interview for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>${formattedDate ? ` previously scheduled for <strong>${formattedDate}${time ? ` at ${time}` : ''}</strong>` : ''} has been cancelled.</p>
    
    <div class="detail-card" style="border-left-color: #ef4444; background: #fff5f5;">
      <p class="detail-row" style="color: #b91c1c; font-weight: 700;">INTERVIEW CANCELLED</p>
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      <p class="detail-row"><strong>Company:</strong> ${companyName}</p>
      ${reason ? `<p class="detail-row"><strong>Reason:</strong> ${reason}</p>` : ''}
    </div>

    <p>Your recruiter will reach out with alternative availability or next steps regarding your candidacy.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Your interview for ${jobTitle} has been cancelled.`,
      bodyHtml,
      ctaText: 'Go to TalentFlow Portal',
      ctaUrl: `${APP_URL}/dashboard`
    }),
    text: `Hi ${candidateName}, your interview for ${jobTitle} at ${companyName} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    eventType: 'INTERVIEW_CANCELLED_CANDIDATE',
    entityId: interviewId,
    idempotencyKey: idempotencyKey || `int_can_cand_${interviewId || email}`
  });
};

// D. Send Cancelled to Recruiter
exports.sendInterviewCancelledToRecruiter = async ({
  email,
  recruiterName = 'Recruiter',
  candidateName = 'Candidate',
  jobTitle = 'Position',
  companyName = 'TalentFlow Partner',
  date,
  time,
  reason,
  interviewId,
  idempotencyKey
}) => {
  const subject = `Interview cancelled — ${candidateName}`;
  const title = 'Interview Cancelled';
  const formattedDate = date ? formatDate(date) : '';

  const bodyHtml = `
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p>The interview with <strong>${candidateName}</strong> for <strong>${jobTitle}</strong>${formattedDate ? ` scheduled for <strong>${formattedDate}${time ? ` at ${time}` : ''}</strong>` : ''} has been cancelled.</p>
    
    <div class="detail-card" style="border-left-color: #ef4444; background: #fff5f5;">
      <p class="detail-row" style="color: #b91c1c; font-weight: 700;">INTERVIEW CANCELLED</p>
      <p class="detail-row"><strong>Candidate:</strong> ${candidateName}</p>
      <p class="detail-row"><strong>Position:</strong> ${jobTitle}</p>
      ${reason ? `<p class="detail-row"><strong>Cancellation Reason:</strong> ${reason}</p>` : ''}
    </div>

    <p>The interview record has been updated and the candidate was notified.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `Interview with ${candidateName} for ${jobTitle} was cancelled.`,
      bodyHtml,
      ctaText: 'View Hiring Pipeline',
      ctaUrl: `${APP_URL}/crm`
    }),
    text: `Hi ${recruiterName}, the interview with ${candidateName} for ${jobTitle} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    eventType: 'INTERVIEW_CANCELLED_RECRUITER',
    entityId: interviewId,
    idempotencyKey: idempotencyKey || `int_can_rec_${interviewId || email}`
  });
};

// ─────────────────────────────────────────────────────────────
// 5. NEW MESSAGE (BIDIRECTIONAL)
// ─────────────────────────────────────────────────────────────

// A. Send New Message to Candidate
exports.sendNewMessageToCandidate = async ({
  email,
  candidateName = 'there',
  senderName = 'Sarah Jenkins',
  previewText,
  messageId,
  idempotencyKey
}) => {
  const subject = `New message from ${senderName} — TalentFlow`;
  const title = 'New Message Received';

  const bodyHtml = `
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>You have a new message from <strong>${senderName}</strong> on TalentFlow.</p>
    
    ${previewText ? `
      <div class="detail-card">
        <p class="detail-row" style="font-style: italic; color: #475569;">
          "${previewText.substring(0, 120)}${previewText.length > 120 ? '...' : ''}"
        </p>
      </div>
    ` : ''}

    <p>To view the full message and continue the conversation, open your TalentFlow Messenger.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `You have a new message from ${senderName} on TalentFlow.`,
      bodyHtml,
      ctaText: 'Open Messages',
      ctaUrl: `${APP_URL}/messages`
    }),
    text: `You have a new message from ${senderName} on TalentFlow. Open Messages at ${APP_URL}/messages`,
    eventType: 'NEW_MESSAGE_CANDIDATE',
    entityId: messageId,
    idempotencyKey: idempotencyKey || `msg_cand_${messageId || email}_${Date.now()}`
  });
};

// B. Send New Message to Recruiter
exports.sendNewMessageToRecruiter = async ({
  email,
  recruiterName = 'there',
  senderName = 'Aarav Sharma',
  previewText,
  messageId,
  idempotencyKey
}) => {
  const subject = `New message from ${senderName} — TalentFlow`;
  const title = 'New Candidate Message Received';

  const bodyHtml = `
    <p>Hi <strong>${recruiterName}</strong>,</p>
    <p>You have a new message from <strong>${senderName}</strong> on TalentFlow.</p>
    
    ${previewText ? `
      <div class="detail-card">
        <p class="detail-row" style="font-style: italic; color: #475569;">
          "${previewText.substring(0, 120)}${previewText.length > 120 ? '...' : ''}"
        </p>
      </div>
    ` : ''}

    <p>Sign in to your recruiter portal to reply directly to the candidate.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    html: createBaseTemplate({
      title,
      preheader: `You have a new message from ${senderName} on TalentFlow.`,
      bodyHtml,
      ctaText: 'Open Messages',
      ctaUrl: `${APP_URL}/messages`
    }),
    text: `You have a new message from ${senderName} on TalentFlow. Open Messages at ${APP_URL}/messages`,
    eventType: 'NEW_MESSAGE_RECRUITER',
    entityId: messageId,
    idempotencyKey: idempotencyKey || `msg_rec_${messageId || email}_${Date.now()}`
  });
};

// ─────────────────────────────────────────────────────────────
// 6. VERIFICATION & WELCOME
// ─────────────────────────────────────────────────────────────

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
    text: `Your TalentFlow verification code is: ${otp}. It expires in 10 minutes.`,
    eventType: 'AUTH_OTP'
  });
};

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
    text: `Welcome to TalentFlow AI! Complete your onboarding at ${APP_URL}/onboarding`,
    eventType: 'AUTH_WELCOME'
  });
};

// ─────────────────────────────────────────────────────────────
// Backward-compatible wrappers for legacy callers
// ─────────────────────────────────────────────────────────────
exports.sendApplicationSubmitted = exports.sendApplicationSubmittedToCandidate;
exports.sendApplicationStatusUpdate = exports.sendApplicationStatusUpdatedToCandidate;
exports.sendInterviewScheduled = exports.sendInterviewScheduledToCandidate;
exports.sendInterviewUpdated = exports.sendInterviewUpdatedToCandidate;
exports.sendInterviewCancelled = exports.sendInterviewCancelledToCandidate;
exports.sendNewMessage = exports.sendNewMessageToCandidate;

module.exports = exports;
