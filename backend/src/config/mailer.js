const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Send email helper or fallback to console in dev mode
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject,
        text,
        html,
      });
      console.log(`[Email Service] Sent email to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email Service] Failed to send email via SMTP to ${to}:`, error.message);
      // Fallback log to console so development is not blocked
      console.log(`[Email Service Fallback] To: ${to}\nSubject: ${subject}\nContent:\n${text || html}`);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[Email Service DEV CONSOLE] (No SMTP credentials configured)`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || html}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }
};

module.exports = {
  sendMail,
};
