const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN missing from process.env');
    return res.status(500).json({ error: 'Storage configuration missing on Vercel.' });
  }

  try {
    const filename = req.query.filename || `product-${Date.now()}.jpg`;
    
    // Pass token explicitly to ensure authorization
    const blob = await put(filename, req, {
      access: 'public',
      token: token,
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Image upload failed' });
  }
};