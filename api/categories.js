import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify Environment Variables
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Turso environment variables missing!');
    return res.status(500).json({ 
      error: 'Database configuration missing. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN on Vercel.' 
    });
  }

  try {
    const db = createClient({ url, authToken });

    if (req.method === 'GET') {
      const result = await db.execute('SELECT * FROM categories ORDER BY id ASC');
      return res.status(200).json(result.rows || []);
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON payload' });
        }
      }

      const name = body?.name;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name required' });
      }

      await db.execute({
        sql: 'INSERT INTO categories (name) VALUES (?)',
        args: [name.trim()],
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: err.message || 'Database transaction failed' });
  }
}