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
    this.transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    // For production, use a robust transport like SMTP with a reliable email provider (SendGrid, Mailgun, AWS SES, etc.)
    // For development/testing, you can use ethereal.email or a local SMTP server like MailHog.
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "stage"
    ) {
      if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_PORT ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
      ) {
        this.logger.error(
          "SMTP configuration missing for email service in production/stage environment."
        );
        // Depending on strictness, you might throw an error here to prevent startup
        // or allow the service to start but log critical errors when sending emails.
        // For this example, we'll let it proceed but sending will fail.
      }
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        pool: true, // Use connection pooling for better performance
        maxConnections: 5, // Example: configure as needed
        maxMessages: 100, // Example: configure as needed
        rateLimit: 10, // Example: max 10 messages per second
      });
    } else {
      // For local development, you might use a test account from ethereal.email
      // or a local SMTP server like MailHog/Mailtrap
      // This example uses ethereal.email for easy setup without a real SMTP server
      this.logger.info(
        "EmailService: Using Ethereal for email transport in development/test."
      );
      nodemailer.createTestAccount((err, account) => {
        if (err) {
          this.logger.error(
            "Failed to create a testing account for Ethereal. " + err.message
          );
          // Fallback to a dummy transporter if Ethereal fails
          this.transporter = nodemailer.createTransport({
            jsonTransport: true,
          });
          return;
        }
        this.logger.info("Ethereal test account created:");
        this.logger.info(`User: ${account.user}`);
        this.logger.info(`Pass: ${account.pass}`);

        this.transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
      });
    }
  }

  public async sendPasswordResetCode(
    toEmail: string,
    code: string,
    username: string
  ): Promise<void> {
    const mailOptions = {
      from: `"Your App Name" <${this.emailFrom}>`,
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
      if (nodemailer.getTestMessageUrl(info)) {
        this.logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error: any) {
      this.logger.error("Error sending password reset email", {
        toEmail,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      // Do not re-throw the raw nodemailer error to the client.
      // Throw a generic application-specific error.
      throw APIError.InternalServerError(
        "We encountered an issue sending the password reset email. Please try again later."
      );
    }
  }
}
