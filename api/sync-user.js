import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, name, email, phone, provider, cart } = req.body;

    try {
        if (cart !== undefined) {
            // Update cart specifically
            await db.execute({
                sql: `UPDATE users SET cart = ? WHERE id = ?`,
                args: [JSON.stringify(cart), id]
            });
            return res.status(200).json({ success: true, message: 'Cart updated' });
        }

        // Standard user sync on login
        await db.execute({
            sql: `INSERT INTO users (id, name, email, phone, provider) 
                  VALUES (?, ?, ?, ?, ?) 
                  ON CONFLICT(id) DO UPDATE SET 
                  name = excluded.name, 
                  email = excluded.email, 
                  phone = excluded.phone`,
            args: [id, name || null, email || null, phone || null, provider]
        });

        // Fetch saved cart to sync back to client
        const userRow = await db.execute({
            sql: `SELECT cart FROM users WHERE id = ?`,
            args: [id]
        });

        const savedCart = userRow.rows[0]?.cart ? JSON.parse(userRow.rows[0].cart) : [];

        return res.status(200).json({ success: true, cart: savedCart });
    } catch (error) {
        console.error('Turso sync error:', error);
        return res.status(500).json({ error: error.message });
    }
}