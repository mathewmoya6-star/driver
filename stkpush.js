export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, amount, plan } = req.body;

  let clean = String(phone).trim();
  if (clean.startsWith('0')) clean = '254' + clean.slice(1);
  if (clean.startsWith('+')) clean = clean.slice(1);

  // Replace this mock response with real Daraja API request
  return res.status(200).json({
    success: true,
    message: 'STK Push sent successfully',
    phone: clean,
    amount,
    plan
  });
}