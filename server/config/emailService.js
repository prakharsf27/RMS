const nodemailer = require('nodemailer');

const createTemplate = (title, body) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        .container { font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px; background-color: white; border-top-right-radius: 24px; border-top-left-radius: 24px; margin-top: -20px; }
        .footer { padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        h1 { margin: 0; font-size: 24px; font-weight: 800; }
        p { line-height: 1.6; color: #334155; }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
      <div class="container">
        <div class="header">
          <h1>TalentFlow</h1>
        </div>
        <div class="content">
          <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
          ${body}
          <a href="${process.env.FRONTEND_URL || 'https://rms-blush-iota.vercel.app'}" class="button">Visit Dashboard</a>
        </div>
        <div class="footer">
          <p>© 2026 TalentFlow Recruitment. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

const emailService = require('../services/emailService');

// Backward compatibility bridge for old sendEmail signature
const sendEmail = async ({ email, subject, type, data = {} }) => {
  switch (type) {
    case 'WELCOME':
      return emailService.sendWelcomeEmail({ email, name: data.name, role: data.role });
    case 'APPLICATION_CONFIRM':
      return emailService.sendApplicationSubmitted({ 
        email, 
        candidateName: data.name, 
        jobTitle: data.jobTitle, 
        companyName: data.companyName 
      });
    case 'STATUS_UPDATE':
      return emailService.sendApplicationStatusUpdate({
        email,
        candidateName: data.name,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        status: data.status,
        notes: data.message
      });
    case 'INTERVIEW_SCHEDULED':
      return emailService.sendInterviewScheduled({
        email,
        candidateName: data.name,
        jobTitle: data.jobTitle,
        date: data.date,
        time: data.time,
        location: data.location,
        meetLink: data.meetLink
      });
    case 'OTP':
      return emailService.sendVerificationOTP({
        email,
        name: data.name,
        otp: data.otp || data.message
      });
    default:
      return emailService.sendVerificationOTP({
        email,
        name: data.name,
        otp: data.otp || '000000'
      });
  }
};

module.exports = sendEmail;
