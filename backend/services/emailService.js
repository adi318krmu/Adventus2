import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp, purpose) => {
  console.log(`[EmailService] Preparing to send OTP to ${email}...`);

  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes("your-gmail-address") || 
      !process.env.EMAIL_PASS || process.env.EMAIL_PASS.includes("your-gmail-app-password")) {
    console.error("[EmailService] Error: Gmail credentials are not configured or are placeholders in backend/.env!");
    throw new Error("Email service is not configured. Please update EMAIL_USER and EMAIL_PASS in your backend/.env file with a valid Gmail and App Password.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false for 587 (uses STARTTLS)
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10s timeout
    socketTimeout: 10000
  });

  const isReg = purpose === "registration";
  const subject = isReg ? "Adventus Tuition Center - Account Registration OTP" : "Adventus Tuition Center - Email Verification OTP";
  const title = isReg ? "Verify Your Registration" : "Verify Your Email Address";
  const bodyText = isReg 
    ? "Thank you for choosing Adventus Tuition Center. Use the OTP below to complete your registration. This OTP is valid for 5 minutes."
    : "You requested to verify your email address. Use the OTP below to complete the verification. This OTP is valid for 5 minutes.";

  const mailOptions = {
    from: `"Adventus Tuition Center" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1111; color: #f8fafc; border: 1px solid #24474a; border-radius: 16px; padding: 32px; box-shadow: 0 0 40px rgba(62, 208, 184, 0.14);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #3ed0b8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">ADVENTUS</h2>
          <p style="color: #6b7f83; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Tuition Center</p>
        </div>
        
        <h3 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-align: center;">${title}</h3>
        
        <p style="color: #94a3b8; font-size: 15px; line-height: 24px; margin-bottom: 24px; text-align: center;">
          ${bodyText}
        </p>
        
        <div style="background: #162021; border: 1px solid #24474a; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; color: #3ed0b8; letter-spacing: 6px; font-family: monospace;">${otp}</span>
        </div>
        
        <p style="color: #6b7f83; font-size: 12px; text-align: center; line-height: 18px; margin-bottom: 0;">
          If you did not request this OTP, please ignore this email.<br/>
          &copy; ${new Date().getFullYear()} Adventus Tuition Center. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] OTP email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
