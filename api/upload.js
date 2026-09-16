const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN environment variable missing on Vercel.' });
    }

    const filename = req.query.filename || `upload-${Date.now()}.jpg`;
    const blob = await put(filename, req, {
      access: 'public',
      token: token
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
};