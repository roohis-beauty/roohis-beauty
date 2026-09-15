import { put } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const filename = req.headers['x-filename'] || 'upload.jpg';
        
        // Upload raw file directly to Vercel Blob
        const blob = await put(filename, req, {
            access: 'public',
        });

        // Return clean public URL
        return res.status(200).json({ url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image.' });
    }
}