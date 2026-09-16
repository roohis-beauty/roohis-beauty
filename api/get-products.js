import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await db.execute('SELECT * FROM products ORDER BY id DESC');
    return res.status(200).json(result.rows);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}