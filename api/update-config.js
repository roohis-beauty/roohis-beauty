import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { backgroundColor, secondaryColor, textColor, textHoverColor } = req.body || {};

    const updates = [
      { key: 'background_color', value: backgroundColor },
      { key: 'secondary_color', value: secondaryColor },
      { key: 'text_color', value: textColor },
      { key: 'text_hover_color', value: textHoverColor },
    ];

    for (const item of updates) {
      if (item.value) {
        // First try updating an existing row
        const updateResult = await db.execute({
          sql: `UPDATE store_config SET value = ? WHERE key = ?`,
          args: [item.value, item.key],
        });

        // If no row was updated, insert a new one
        if (updateResult.rowsAffected === 0) {
          await db.execute({
            sql: `INSERT INTO store_config (key, value) VALUES (?, ?)`,
            args: [item.key, item.value],
          });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Update config database error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}