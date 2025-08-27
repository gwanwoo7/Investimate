# Supabase Email Template for Investimate

Use this HTML template in your Supabase Authentication → Templates → Confirm signup:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Investimate</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { 
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
        }
        .content { padding: 40px 30px; }
        .button { 
            background: #1976d2; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            display: inline-block; 
            margin: 20px 0;
            font-weight: bold;
        }
        .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #e9ecef;
        }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { font-size: 16px; opacity: 0.9; }
        .highlight { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 Investimate</div>
            <div class="subtitle">Welcome to Smart Property Investment</div>
        </div>
        
        <div class="content">
            <h2 style="color: #1976d2; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p>Hi there,</p>
            
            <p>Thank you for joining Investimate! To start analyzing rental properties and accessing our powerful investment tools, please verify your email address.</p>
            
            <div class="highlight">
                <strong>Email:</strong> {{ .Email }}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    ✅ Verify Email Address
                </a>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Click the verification button above</li>
                <li>You'll be redirected to Investimate</li>
                <li>Start analyzing investment properties immediately</li>
            </ul>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <strong>⏰ Important:</strong> This verification link expires in 24 hours for security.
            </div>
            
            <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #1976d2; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
                If you didn't create an account with Investimate, you can safely ignore this email.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Investimate</strong> - Smart Rental Property Analysis</p>
            <p>© 2025 Investimate. All rights reserved.</p>
            <p style="font-size: 12px; margin-top: 10px;">
                This is an automated email. Please do not reply to this message.
            </p>
        </div>
    </div>
</body>
</html>
```

## Alternative Simple Template:

If you prefer a simpler template, use this:

```html
<h2>Welcome to Investimate! 🏠</h2>

<p>Hi {{ .Email }},</p>

<p>Thank you for signing up for Investimate! To complete your registration and start analyzing investment properties, please verify your email address.</p>

<p style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" style="background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
        ✅ Verify Email Address
    </a>
</p>

<p><strong>What's next?</strong></p>
<ul>
    <li>Click the verification link above</li>
    <li>You'll be redirected back to Investimate</li>
    <li>Start analyzing rental properties right away!</li>
</ul>

<p style="color: #666; font-size: 14px;">
    <strong>Note:</strong> This link expires in 24 hours for security reasons.
</p>

<p style="color: #666; font-size: 14px;">
    If you didn't create this account, please ignore this email.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
<p style="color: #666; font-size: 12px; text-align: center;">
    © 2025 Investimate. This is an automated email, please do not reply.
</p>
```
