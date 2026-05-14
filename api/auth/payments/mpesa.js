export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { amount, phoneNumber, courseId, userId } = req.body;
  
  // M-Pesa API integration (example structure)
  const mpesaResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getMpesaToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: generatePassword(),
      Timestamp: getTimestamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.VITE_API_URL}/api/payments/callback`,
      AccountReference: `COURSE-${courseId}`,
      TransactionDesc: `MEI Drive Course Enrollment`
    })
  });
  
  const data = await mpesaResponse.json();
  return res.status(200).json(data);
}

async function getMpesaToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const data = await response.json();
  return data.access_token;
}

function generatePassword() {
  const timestamp = getTimestamp();
  return Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
}

function getTimestamp() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
}
