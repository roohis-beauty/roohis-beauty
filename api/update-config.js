import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { backgroundColor } = req.body;

  try {
    await db.execute({
      sql: `INSERT INTO store_config (key, value) VALUES ('background_color', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [backgroundColor]
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}