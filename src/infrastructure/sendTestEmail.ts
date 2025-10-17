import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import EmailService from './EmailService.js';

// Load environment variables
dotenv.config();

// Force production mode to use real SMTP settings (Brevo)
process.env.NODE_ENV = "production";

// Fix the SMTP host if it's misspelled
if (process.env.SMTP_HOST === "stmp-relay.brevo.com") {
  process.env.SMTP_HOST = "smtp-relay.brevo.com";
}

console.log('SMTP Settings:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? '****' : 'not set'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendTestEmail() {
  try {
    console.log('Creating email service...');
    const emailService = new EmailService();
    
    console.log('Sending test email...');
    // Set your test email address here
    const testEmailAddress = process.argv[2] || 'yelmellouki@gmail.com';
    
    // Use the sendPasswordResetCode method that's already implemented
    await emailService.sendPasswordResetCode(
      testEmailAddress,
      '123456', // Test reset code
      'TestUser'  // Test username
    );
    
    console.log(`Test email sent successfully to ${testEmailAddress}!`);
    console.log('Check your inbox (and spam folder) for the email.');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

// Run the function
sendTestEmail();
