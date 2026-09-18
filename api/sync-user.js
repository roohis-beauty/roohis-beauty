import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, name, email, phone, provider } = req.body;

    try {
        await db.execute({
            sql: `INSERT INTO users (id, name, email, phone, provider) 
                  VALUES (?, ?, ?, ?, ?) 
                  ON CONFLICT(id) DO UPDATE SET 
                  name = excluded.name, 
                  email = excluded.email, 
                  phone = excluded.phone`,
            args: [id, name || null, email || null, phone || null, provider]
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Turso sync error:', error);
        return res.status(500).json({ error: error.message });
    }
}