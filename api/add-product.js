const { createClient } = require('@libsql/client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return res.status(500).json({ error: 'Database environment variables missing on Vercel.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    const { title, price, category, shortDescription, longDescription, imageUrl } = body || {};

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and Price are required.' });
    }

    const db = createClient({ url, authToken });

    // Columns matching your Turso schema: short_description and long_description
    await db.execute({
      sql: `INSERT INTO products (title, price, category, short_description, long_description, image_url) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        String(title), 
        parseFloat(price) || 0, 
        String(category || 'General'), 
        String(shortDescription || ''), 
        String(longDescription || ''), 
        String(imageUrl || '')
      ]
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Add Product API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save product' });
  }
};