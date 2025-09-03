// Quick test of Resend email service
const RESEND_API_KEY = 're_3pr5WXq7_KhHRaDYULJB5HLm43j44Cm2q';

async function testResendEmail() {
  console.log('🧪 Testing Resend Email Service...');
  
  const emailData = {
    from: 'Investimate <noreply@myinvestimate.com>',
    to: 'test@example.com',
    subject: 'Test Email from Investimate',
    html: '<p>This is a test email to verify Resend API is working.</p>',
    text: 'This is a test email to verify Resend API is working.'
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.id);
      return { success: true, messageId: result.id };
    } else {
      console.error('❌ Email failed:');
      console.error('Status:', response.status);
      console.error('Error:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// Test the email service
testResendEmail().then(result => {
  console.log('Final result:', result);
}).catch(error => {
  console.error('Test failed:', error);
});
