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

const sendEmail = async ({ email, subject, type, data = {} }) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let htmlBody = '';
  let emailTitle = subject;

  switch (type) {
    case 'WELCOME':
      emailTitle = `Welcome to TalentFlow, ${data.name}!`;
      htmlBody = `<p>We're excited to help you find your next career opportunity. Your profile is now active and ready for applications.</p>`;
      break;
    case 'APPLICATION_CONFIRM':
      emailTitle = 'Application Received';
      htmlBody = `<p>Your application for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong> has been received. We'll review it and get back to you soon.</p>`;
      break;
    case 'STATUS_UPDATE':
      emailTitle = 'Update on your Application';
      htmlBody = `<p>There has been an update regarding your application for <strong>${data.jobTitle}</strong>.</p>
                  <div style="padding: 15px; background: #f1f5f9; border-radius: 8px; margin: 20px 0;">
                    <strong>New Status:</strong> ${data.status.toUpperCase()}
                  </div>
                  <p>${data.message}</p>`;
      break;
    case 'INTERVIEW_SCHEDULED':
      emailTitle = 'Interview Scheduled';
      htmlBody = `<p>An interview has been scheduled for the <strong>${data.jobTitle}</strong> position.</p>
                  <div style="padding: 15px; border-left: 4px solid #6366f1; background: #f8fafc; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${data.time}</p>
                    <p style="margin: 5px 0;"><strong>Location:</strong> ${data.location}</p>
                  </div>
                  <p><strong>Notes:</strong> ${data.notes || 'None'}</p>`;
      break;
    default:
      htmlBody = `<p>${data.message || 'No message content provided.'}</p>`;
  }

  const message = {
    from: `${process.env.FROM_NAME || 'TalentFlow RMS'} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: emailTitle,
    html: createTemplate(emailTitle, htmlBody),
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send failure:', error.message);
    // Suppress error in production to avoid crashing the main request
    return null;
  }
};

module.exports = sendEmail;
