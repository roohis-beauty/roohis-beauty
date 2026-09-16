const { handleUpload } = require('@vercel/blob/client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob uploaded successfully:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message });
  }
};