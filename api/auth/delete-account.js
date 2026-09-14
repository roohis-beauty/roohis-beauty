import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await db.execute('DELETE FROM admin_users');
    return res.status(200).json({ success: true, message: 'Owner account wiped.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}