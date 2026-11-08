const { sendMail } = require('../config/mailer');

/**
 * Send OTP Verification Email
 */
const sendOtpEmail = async (email, otp, purpose) => {
  const isRegister = purpose === 'REGISTER';
  const subject = isRegister
    ? 'PHMS - Account Verification OTP'
    : 'PHMS - Password Reset OTP';

  const title = isRegister ? 'Verify Your Account' : 'Reset Your Password';
  const actionText = isRegister
    ? 'Thank you for registering with PHMS. Please use the verification code below to complete your registration:'
    : 'We received a request to reset your password. Please use the verification code below:';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin: 0;">PHMS Veterinary Hospital</h2>
        <p style="color: #64748b; margin: 5px 0 0 0;">Dedicated Pet Care System</p>
      </div>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px;">
        <h3 style="color: #1e293b; margin-top: 0;">${title}</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">${actionText}</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #3b82f6;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code is valid for <strong>5 minutes</strong>. If you did not initiate this request, please disregard this email.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
        &copy; ${new Date().getFullYear()} PHMS Veterinary Hospital. All rights reserved.
      </div>
    </div>
  `;

  const text = `${title}\n\n${actionText}\n\nOTP Code: ${otp}\n\nThis code will expire in 5 minutes.`;

  return sendMail({ to: email, subject, html, text });
};

module.exports = {
  sendOtpEmail,
};
