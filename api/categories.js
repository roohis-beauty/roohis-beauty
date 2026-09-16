import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM categories ORDER BY id ASC');
      return res.status(200).json(result.rows);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Category name required' });

      await db.execute({
        sql: 'INSERT INTO categories (name) VALUES (?)',
        args: [name.trim()],
      });
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}