const express = require('express');
const router = express.Router();
const { JSDOM } = require('jsdom');

// Ruta para previsualizar enlaces
router.get('/fetch-url', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: 0, message: 'URL requerida' });
  }

  try {
    // Importación dinámica compatible con ESM
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const title = document.querySelector('title')?.textContent || url;
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

    return res.status(200).json({
      success: 1,
      meta: {
        title,
        description,
        image
      }
    });

  } catch (error) {
    console.error("Error al obtener preview:", error);
    return res.status(500).json({ success: 0, message: 'Error al procesar la URL' });
  }
});

module.exports = router;
