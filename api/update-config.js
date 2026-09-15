import { createClient } from '@libsql/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { key, value } = req.body;

    if (!key) {
        return res.status(400).json({ error: 'Missing key' });
    }

    try {
        const db = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        await db.execute({
            sql: `INSERT INTO store_config (key, value) VALUES (?, ?) 
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            args: [key, typeof value === 'string' ? value : JSON.stringify(value)],
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Update config error:', error);
        return res.status(500).json({ error: 'Failed to update configuration' });
    }
}