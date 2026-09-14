import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const existing = await db.execute('SELECT COUNT(*) as count FROM admin_users');
    if (existing.rows[0].count > 0) {
      return res.status(400).json({ error: 'An owner account already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute({
      sql: 'INSERT INTO admin_users (email, password_hash) VALUES (?, ?)',
      args: [email, hashedPassword]
    });

    return res.status(200).json({ success: true, message: 'Owner registered successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}