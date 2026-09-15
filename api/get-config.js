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

    // Provide camelCase aliases for front-end JS compatibility
    if (config.background_color) config.backgroundColor = config.background_color;
    if (config.secondary_color) config.secondaryColor = config.secondary_color;
    if (config.text_color) config.textColor = config.text_color;
    if (config.text_hover_color) config.textHoverColor = config.text_hover_color;

    return res.status(200).json(config);
  } catch (error) {
    console.error('get-config error:', error);
    return res.status(500).json({ error: error.message });
  }
}