import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, price, short_desc, long_desc, image_url, category } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: 'Title, price, and category are required.' });
    }

    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    await db.execute({
      sql: `INSERT INTO products (title, price, short_desc, long_desc, image_url, category) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [title, price, short_desc || '', long_desc || '', image_url || '', category],
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}