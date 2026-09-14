import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  try {
    const result = await db.execute('SELECT key, value FROM store_config');
    const config = {};

    result.rows.forEach(row => {
      config[row.key] = row.value;
    });

    return res.status(200).json(config);
  } catch (error) {
    console.error('get-config error:', error);
    return res.status(500).json({ error: error.message });
  }
}