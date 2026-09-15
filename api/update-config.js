import { createClient } from '@libsql/client';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Safely extract key/value regardless of how Vercel parsed req.body
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                // Keep as is if parsing fails
            }
        }

        const { key, value } = body || {};

        if (!key) {
            return res.status(400).json({ error: 'Missing key parameter' });
        }

        // Initialize Turso database connection
        const db = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        // Ensure value is formatted as a valid string for database storage
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