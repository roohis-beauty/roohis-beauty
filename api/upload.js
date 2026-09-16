// api/upload.js - Handles binary image uploads to Vercel Blob storage

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Disables body parsing so raw binary stream can be read directly
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract original filename from request header or generate a default one
    const filename = req.headers['x-filename'] || `upload-${Date.now()}.png`;

    // Upload the raw request body stream directly to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
    });

    // Returns { url: 'https://...' } expected by admin.js
    return res.status(200).json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Image upload failed' });
  }
}