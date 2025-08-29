import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface EmailVerificationData {
  email: string;
  verificationUrl: string;
  userName?: string;
}

class ResendEmailService {
  private static instance: ResendEmailService;
  private resend: Resend | null = null;
  private initialized = false;
  private readonly defaultFrom = 'Investimate <noreply@myinvestimate.com>';
  private readonly supportEmail = 'support@myinvestimate.com';

  private constructor() {
    this.initialize();
  }

  static getInstance(): ResendEmailService {
    if (!ResendEmailService.instance) {
      ResendEmailService.instance = new ResendEmailService();
    }
    return ResendEmailService.instance;
  }

  private initialize() {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    
    if (!apiKey) {
      console.warn('Resend API key not configured. Please set VITE_RESEND_API_KEY environment variable.');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.initialized = true;
      console.log('✅ Resend Email Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Resend Email Service:', error);
    }
  }

  isConfigured(): boolean {
    return this.initialized && this.resend !== null;
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.resend) {
      return { success: false, error: 'Resend not configured. Please check your API key.' };
    }

    try {
      console.log('📧 Sending email via Resend to:', options.to);
      
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        console.error('❌ Resend email error:', error);
        return { success: false, error: error.message || 'Failed to send email' };
      }

      if (data?.id) {
        console.log('✅ Email sent successfully. Message ID:', data.id);
        return { success: true, messageId: data.id };
      }

      return { success: false, error: 'Unknown error sending email' };
    } catch (error) {
      console.error('❌ Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  /**
   * Send contact form email
   */
  async sendContactFormEmail(formData: ContactFormData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = this.generateContactFormHTML(formData);
    const textContent = this.generateContactFormText(formData);

    return this.sendEmail({
      to: this.supportEmail,
      subject: `[Investimate Contact] ${formData.subject}`,
      html: htmlContent,
      text: textContent,
      replyTo: formData.email,
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(data: EmailVerificationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = this.generateEmailVerificationHTML(data);
    const textContent = this.generateEmailVerificationText(data);

    return this.sendEmail({
      to: data.email,
      subject: 'Verify your email address - Investimate',
      html: htmlContent,
      text: textContent,
    });
  }

  /**
   * Send QA diagnostic email
   */
  async sendQADiagnosticEmail(results: any, testEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = this.generateQADiagnosticHTML(results);
    const textContent = this.generateQADiagnosticText(results);

    return this.sendEmail({
      to: testEmail,
      subject: 'QA Diagnostic Results - Investimate',
      html: htmlContent,
      text: textContent,
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, userName?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = this.generateWelcomeHTML(userName);
    const textContent = this.generateWelcomeText(userName);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Investimate! 🏠',
      html: htmlContent,
      text: textContent,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const htmlContent = this.generatePasswordResetHTML(resetUrl);
    const textContent = this.generatePasswordResetText(resetUrl);

    return this.sendEmail({
      to: email,
      subject: 'Reset your password - Investimate',
      html: htmlContent,
      text: textContent,
    });
  }

  /**
   * Generate HTML content for contact form email
   */
  private generateContactFormHTML(formData: ContactFormData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission - Investimate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #1976d2; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #1976d2; }
        .message-content { background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd; white-space: pre-wrap; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>From Investimate.com</p>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">From:</div>
                <div class="value">${formData.name} &lt;${formData.email}&gt;</div>
            </div>
            
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${formData.subject}</div>
            </div>
            
            <div class="field">
                <div class="label">Message:</div>
                <div class="message-content">${formData.message}</div>
            </div>
            
            <div class="footer">
                <p><strong>Sent from:</strong> ${window.location.origin}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Reply to:</strong> ${formData.email}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text content for contact form email
   */
  private generateContactFormText(formData: ContactFormData): string {
    return `
Contact Form Submission from Investimate.com

From: ${formData.name} <${formData.email}>
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from: ${window.location.origin}
Date: ${new Date().toLocaleString()}
Reply to: ${formData.email}
`;
  }

  /**
   * Generate HTML content for email verification
   */
  private generateEmailVerificationHTML(data: EmailVerificationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Investimate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1976d2; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { background: #1565c0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .url-fallback { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; word-break: break-all; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Investimate! 🏠</h1>
            <p>Please verify your email address</p>
        </div>
        <div class="content">
            <p>Hi${data.userName ? ` ${data.userName}` : ''},</p>
            
            <p>Thank you for signing up for Investimate! To complete your registration and start analyzing investment properties, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this URL into your browser:</p>
            <div class="url-fallback">${data.verificationUrl}</div>
            
            <p><strong>This link will expire in 24 hours for security reasons.</strong></p>
            
            <p>If you didn't create an account with Investimate, you can safely ignore this email.</p>
            
            <p>Happy investing!<br>
            The Investimate Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Investimate. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text content for email verification
   */
  private generateEmailVerificationText(data: EmailVerificationData): string {
    return `
Welcome to Investimate!

Hi${data.userName ? ` ${data.userName}` : ''},

Thank you for signing up for Investimate! To complete your registration and start analyzing investment properties, please verify your email address.

Verification URL: ${data.verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account with Investimate, you can safely ignore this email.

Happy investing!
The Investimate Team

© 2025 Investimate. All rights reserved.
This is an automated email, please do not reply.
`;
  }

  /**
   * Generate HTML content for QA diagnostic email
   */
  private generateQADiagnosticHTML(results: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Diagnostic Results - Investimate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .results { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
        .success { border-left: 4px solid #4caf50; }
        .error { border-left: 4px solid #f44336; }
        .warning { border-left: 4px solid #ff9800; }
        .info { border-left: 4px solid #2196f3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>QA Diagnostic Results 🔍</h1>
            <p>System Test Report</p>
        </div>
        <div class="content">
            <p>This email was sent successfully via Resend, confirming that the email system is working correctly!</p>
            
            <div class="results">
                <h3>Test Results:</h3>
                <pre>${JSON.stringify(results, null, 2)}</pre>
            </div>
            
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text content for QA diagnostic email
   */
  private generateQADiagnosticText(results: any): string {
    return `
QA Diagnostic Results - Investimate

This email was sent successfully via Resend, confirming that the email system is working correctly!

Test Results:
${JSON.stringify(results, null, 2)}

Timestamp: ${new Date().toISOString()}
`;
  }

  /**
   * Generate HTML content for welcome email
   */
  private generateWelcomeHTML(userName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Investimate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1976d2; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .feature { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Investimate! 🏠</h1>
            <p>Your real estate investment journey starts here</p>
        </div>
        <div class="content">
            <p>Hi${userName ? ` ${userName}` : ''},</p>
            
            <p>Welcome to Investimate! We're excited to help you make smarter real estate investment decisions.</p>
            
            <div class="feature">
                <h3>🔍 Property Analysis</h3>
                <p>Analyze rental properties with comprehensive cash flow calculations and ROI metrics.</p>
            </div>
            
            <div class="feature">
                <h3>📊 Investment Scoring</h3>
                <p>Get data-driven recommendations with our investment scoring system.</p>
            </div>
            
            <div class="feature">
                <h3>🗺️ Market Search</h3>
                <p>Search and discover investment opportunities in your target markets.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${window.location.origin}" class="button">Start Analyzing Properties</a>
            </div>
            
            <p>If you have any questions, don't hesitate to reach out to our support team.</p>
            
            <p>Happy investing!<br>
            The Investimate Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Investimate. All rights reserved.</p>
            <p>Visit us at <a href="${window.location.origin}">${window.location.origin}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text content for welcome email
   */
  private generateWelcomeText(userName?: string): string {
    return `
Welcome to Investimate!

Hi${userName ? ` ${userName}` : ''},

Welcome to Investimate! We're excited to help you make smarter real estate investment decisions.

Features:
• Property Analysis: Analyze rental properties with comprehensive cash flow calculations and ROI metrics
• Investment Scoring: Get data-driven recommendations with our investment scoring system  
• Market Search: Search and discover investment opportunities in your target markets

Get started: ${window.location.origin}

If you have any questions, don't hesitate to reach out to our support team.

Happy investing!
The Investimate Team

© 2025 Investimate. All rights reserved.
`;
  }

  /**
   * Generate HTML content for password reset email
   */
  private generatePasswordResetHTML(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Investimate</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1976d2; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .url-fallback { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; word-break: break-all; font-family: monospace; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password 🔐</h1>
            <p>Investimate</p>
        </div>
        <div class="content">
            <p>Hi there,</p>
            
            <p>We received a request to reset your password for your Investimate account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this URL into your browser:</p>
            <div class="url-fallback">${resetUrl}</div>
            
            <div class="warning">
                <p><strong>⚠️ Important:</strong></p>
                <ul>
                    <li>This link will expire in 1 hour for security reasons</li>
                    <li>If you didn't request this password reset, you can safely ignore this email</li>
                    <li>Your current password will remain unchanged until you create a new one</li>
                </ul>
            </div>
            
            <p>For security reasons, this password reset link can only be used once.</p>
            
            <p>Best regards,<br>
            The Investimate Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Investimate. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text content for password reset email
   */
  private generatePasswordResetText(resetUrl: string): string {
    return `
Reset Your Password - Investimate

Hi there,

We received a request to reset your password for your Investimate account. Use the link below to create a new password:

${resetUrl}

Important:
• This link will expire in 1 hour for security reasons
• If you didn't request this password reset, you can safely ignore this email
• Your current password will remain unchanged until you create a new one

For security reasons, this password reset link can only be used once.

Best regards,
The Investimate Team

© 2025 Investimate. All rights reserved.
This is an automated email, please do not reply.
`;
  }

  /**
   * Test email delivery
   */
  async testEmailDelivery(testEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const testResults = {
      timestamp: new Date().toISOString(),
      testEmail,
      service: 'Resend',
      status: 'success'
    };

    return this.sendEmail({
      to: testEmail,
      subject: '✅ Resend Email Test - Investimate',
      html: this.generateQADiagnosticHTML(testResults),
      text: this.generateQADiagnosticText(testResults),
    });
  }
}

export default ResendEmailService;
