import { createClient } from '@libsql/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse body whether it arrives as JSON or object
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { key, value } = body || {};

        if (!key) {
            return res.status(400).json({ error: 'Missing key parameter' });
        }

        const db = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        // Ensure value is always saved as a clean string
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value ?? '');

        await db.execute({
            sql: `INSERT INTO store_config (key, value) VALUES (?, ?) 
                  ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            args: [key, stringValue],
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Update config error:', error);
        return res.status(500).json({ error: error.message || 'Failed to update configuration' });
    }
}