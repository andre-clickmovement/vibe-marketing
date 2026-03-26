// API endpoint to fetch and render JavaScript-heavy websites using Jina Reader
// Jina Reader is free and renders JS before extracting content as clean markdown

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Use Jina Reader to fetch and render the page
    // Jina Reader renders JavaScript and returns clean markdown
    const jinaUrl = `https://r.jina.ai/${parsedUrl.href}`;

    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/markdown',
        // Optional: Add your Jina API key for higher rate limits
        // 'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch URL: ${response.statusText}`
      });
    }

    const content = await response.text();

    // Return the rendered content
    return res.status(200).json({
      url: parsedUrl.href,
      content: content,
      fetched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('URL fetch error:', err);
    return res.status(500).json({ error: err.message });
  }
}
