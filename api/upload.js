import { put } from '@vercel/blob';

// Tell Vercel NOT to parse body into JSON/urlencoded so binary file stream passes cleanly
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}.jpg`;

    // Stream raw file payload directly to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload image.' });
  }
}