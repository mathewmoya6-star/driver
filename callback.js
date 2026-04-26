export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  // Here you can save payment result to database later
  console.log('Daraja Callback:', data);

  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: 'Accepted'
  });
}