// /api/chat.js — Vercel Serverless Function
// Proxies requests to Anthropic API, keeping ANTHROPIC_API_KEY server-side.

export const config = {
  maxDuration: 60, // Allow longer responses for complex skill output
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured. Add it to your Vercel environment variables.',
    });
  }

  try {
    const { system, messages, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const anthropicBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: system || 'You are a helpful marketing assistant.',
      messages,
      // Web search tool - requires organization to have it enabled in Claude Console
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3, // Limit searches per request
      }],
    };

    // ─── Streaming Mode ───
    if (stream) {
      anthropicBody.stream = true;

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(anthropicBody),
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        return res.status(anthropicRes.status).json({
          error: `Anthropic API error: ${anthropicRes.status}`,
          details: errText,
        });
      }

      // Forward SSE stream
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = anthropicRes.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
      } catch (streamErr) {
        console.error('Stream error:', streamErr);
      } finally {
        res.end();
      }
      return;
    }

    // ─── Non-Streaming Mode ───
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(anthropicRes.status).json({
        error: `Anthropic API error: ${anthropicRes.status}`,
        details: errText,
      });
    }

    const data = await anthropicRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('API route error:', err);
    return res.status(500).json({ error: err.message });
  }
}
