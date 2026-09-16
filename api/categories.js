import { createClient } from '@libsql/client';

// Initialize client outside handler to reuse connection across warm serverless invocations
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

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

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM categories ORDER BY id ASC');
      return res.status(200).json(result.rows || []);
    } catch (e) {
      console.error('GET /api/categories error:', e);
      return res.status(500).json({ error: e.message || 'Failed to fetch categories' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Safely parse body if sent as raw string
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (err) {
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
    } catch (e) {
      console.error('POST /api/categories error:', e);
      return res.status(500).json({ error: e.message || 'Failed to create category' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}