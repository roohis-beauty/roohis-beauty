import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  // Disable Vercel CDN and browser caching completely so site updates instantly
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const result = await db.execute('SELECT key, value FROM store_config');
    const config = {};

    result.rows.forEach(row => {
      config[row.key] = row.value;
    });

    // Handle snake_case vs camelCase key matching across entire app
    config.backgroundColor = config.backgroundColor || config.background_color;
    config.secondaryColor = config.secondaryColor || config.secondary_color;
    config.textColor = config.textColor || config.text_color;
    config.textHoverColor = config.textHoverColor || config.text_hover_color;

    return res.status(200).json(config);
  } catch (error) {
    console.error('get-config error:', error);
    return res.status(500).json({ error: error.message });
  }
}