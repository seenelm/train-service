import nodemailer, { Transporter } from "nodemailer";
import { Logger } from "../common/logger.js";
import { APIError } from "../common/errors/APIError.js";

export interface IEmailService {
  sendPasswordResetCode(
    toEmail: string,
    code: string,
    username: string
  ): Promise<void>;
}

export default class EmailService implements IEmailService {
  private transporter: Transporter;
  private logger: Logger;
  private emailFrom: string;

  constructor() {
    this.logger = Logger.getInstance();
    this.emailFrom = process.env.EMAIL_FROM || "noreply@example.com";
    
    // Check for required SMTP configuration
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      this.logger.error(
        "SMTP configuration missing for email service."
      );
      // Fallback to a dummy transporter if SMTP config is missing
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    } else {
      // Always use the configured SMTP settings
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        pool: true, // Use connection pooling for better performance
        maxConnections: 5, 
        maxMessages: 100,
        rateLimit: 10, // max 10 messages per second
      });
      
      this.logger.info(
        `EmailService: Using SMTP transport with host ${process.env.SMTP_HOST}`
      );
    }
  }

  public async sendPasswordResetCode(
    toEmail: string,
    code: string,
    username: string
  ): Promise<void> {
    const mailOptions = {
      from: `"Train App" <${this.emailFrom}>`,
      to: toEmail,
      subject: "Your Password Reset Code",
      text: `Hello ${username},\n\nYour password reset code is: ${code}\n\nThis code will expire in 10 minutes.\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Your App Name Team`,
      html: `<p>Hello ${username},</p><p>Your password reset code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br/>The Your App Name Team</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.info("Password reset email sent successfully", {
        toEmail,
        messageId: info.messageId,
      });
      // Remove the Ethereal preview URL check
    } catch (error: any) {
      this.logger.error("Failed to send password reset email", {
        toEmail,
        error: error.message,
      });
      throw APIError.InternalServerError(
        "Failed to send password reset email. Please try again later.",
        error
      );
    }
  }
}
