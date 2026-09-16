const { createClient } = require('@libsql/client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return res.status(500).json({ error: 'Database environment variables missing.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { title, price, category, shortDescription, longDescription, imageUrl } = body || {};
    const db = createClient({ url, authToken });

    // Force create a brand new clean table to avoid any legacy schema conflicts
    await db.execute(`
      CREATE TABLE IF NOT EXISTS store_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price TEXT NOT NULL,
        short_desc TEXT,
        long_desc TEXT,
        image_url TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute({
      sql: `INSERT INTO store_products (title, price, category, short_desc, long_desc, image_url) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        String(title || ''), 
        String(price || ''), 
        String(category || 'General'), 
        String(shortDescription || ''), 
        String(longDescription || ''), 
        String(imageUrl || '')
      ]
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};