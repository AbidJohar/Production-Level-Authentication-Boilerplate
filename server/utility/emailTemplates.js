 
/**
 * Verification OTP sent on registration (or resent for unverified users).
 * @param {string} otp
 */
export const verifyEmailTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; line-height: 1.6; color: #333;">
  <h2>Welcome to Our App 🎉</h2>
  <p>Your account has been <strong>successfully created</strong>.</p>
  <p>Please verify your email using the OTP below:</p>
  <div style="background: #f4f4f4; display: inline-block; padding: 12px 28px;
              border-radius: 6px; font-size: 28px; font-weight: bold;
              letter-spacing: 6px; margin: 12px 0;">
    ${otp}
  </div>
  <p>This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
  <br/>
  <p>Best Regards,<br><strong>Your App Team</strong></p>
</div>`;

/**
 * OTP resent to an existing but unverified account.
 * @param {string} otp
 */
export const resendOtpTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; line-height: 1.6; color: #333;">
  <h2>Verify Your Email 🔐</h2>
  <p>We noticed your email address has not been verified yet.</p>
  <p>Here is a fresh OTP to complete your verification:</p>
  <div style="background: #f4f4f4; display: inline-block; padding: 12px 28px;
              border-radius: 6px; font-size: 28px; font-weight: bold;
              letter-spacing: 6px; margin: 12px 0;">
    ${otp}
  </div>
  <p>This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
  <br/>
  <p>Best Regards,<br><strong>Your App Team</strong></p>
</div>`;

/**
 * Password reset OTP.
 * @param {string} otp
 */
export const resetPasswordTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; line-height: 1.6; color: #333;">
  <h2>Password Reset Request 🔑</h2>
  <p>We received a request to reset your password.</p>
  <p>Use the OTP below to proceed:</p>
  <div style="background: #f4f4f4; display: inline-block; padding: 12px 28px;
              border-radius: 6px; font-size: 28px; font-weight: bold;
              letter-spacing: 6px; margin: 12px 0;">
    ${otp}
  </div>
  <p>This OTP will expire in <strong>5 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
  <br/>
  <p>Best Regards,<br><strong>Your App Team</strong></p>
</div>`;