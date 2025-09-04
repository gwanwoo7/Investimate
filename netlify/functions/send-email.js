import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_3pr5WXq7_KhHRaDYULJB5HLm43j44Cm2q');

export const handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { type, email, verificationUrl, userName } = JSON.parse(event.body);
    
    let emailData;
    
    if (type === 'welcome') {
      emailData = {
        from: 'Investimate <noreply@myinvestimate.com>',
        to: email,
        subject: 'Welcome to Investimate! 🏠',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2E7D32; margin: 0;">Welcome to Investimate!</h1>
            </div>
            <p style="color: #333; font-size: 16px;">Hi ${userName || 'there'},</p>
            <p style="color: #333; font-size: 16px;">Thank you for joining Investimate! We're excited to help you analyze rental property investments and make informed decisions.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">What you can do with Investimate:</h3>
              <ul style="color: #555; line-height: 1.6;">
                <li>🏠 Search and analyze rental properties</li>
                <li>💰 Calculate cash flow and ROI</li>
                <li>📊 Compare investment opportunities</li>
                <li>🔍 Get detailed property insights</li>
              </ul>
            </div>
            <p style="color: #333; font-size: 16px;">Get started by exploring our property search and cash flow calculator.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://myinvestimate.com" style="background: #2E7D32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Start Analyzing Properties</a>
            </div>
            <p style="color: #666; font-size: 14px;">Best regards,<br>The Investimate Team</p>
          </div>
        `,
        text: `Welcome to Investimate! Hi ${userName || 'there'}, Thank you for joining Investimate! We're excited to help you analyze rental property investments. Visit https://myinvestimate.com to get started.`
      };
    } else if (type === 'verification') {
      emailData = {
        from: 'Investimate <noreply@myinvestimate.com>',
        to: email,
        subject: 'Verify your email address - Investimate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2E7D32; margin: 0;">Verify Your Email</h1>
            </div>
            <p style="color: #333; font-size: 16px;">Hi ${userName || 'there'},</p>
            <p style="color: #333; font-size: 16px;">Please verify your email address to complete your Investimate account setup.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #2E7D32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #2E7D32; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #666; font-size: 13px; margin: 0;">This verification link will expire in 24 hours. If you didn't create an account with Investimate, you can safely ignore this email.</p>
            </div>
            <p style="color: #666; font-size: 14px;">Best regards,<br>The Investimate Team</p>
          </div>
        `,
        text: `Verify Your Email - Hi ${userName || 'there'}, Please verify your email address by visiting: ${verificationUrl}`
      };
    } else if (type === 'contact') {
      const { subject, message, name } = JSON.parse(event.body);
      emailData = {
        from: 'Investimate <noreply@myinvestimate.com>',
        to: 'support@myinvestimate.com',
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2E7D32;">New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        `,
        text: `New Contact Form Submission\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
      };
    } else {
      // Generic email
      const { subject, html, text } = JSON.parse(event.body);
      emailData = {
        from: 'Investimate <noreply@myinvestimate.com>',
        to: email,
        subject: subject,
        html: html,
        text: text
      };
    }
    
    console.log('Sending email via Resend API...', { type, to: email });
    
    const { data, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error('Resend API error:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: error.message })
      };
    }
    
    console.log('Email sent successfully:', data.id);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, messageId: data.id })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
