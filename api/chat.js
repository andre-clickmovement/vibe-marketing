// /api/chat.js — Vercel Serverless Function
// Proxies requests to Anthropic API, keeping ANTHROPIC_API_KEY server-side.

export const config = {
  maxDuration: 120, // Allow longer responses for tool use loops
};

// Helper to fetch URL content using Jina Reader (renders JavaScript)
async function fetchUrlContent(url) {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: { 'Accept': 'text/markdown' },
    });
    if (!response.ok) {
      return { error: `Failed to fetch: ${response.statusText}` };
    }
    const content = await response.text();
    // Truncate if too long (Claude has context limits)
    const maxLength = 15000;
    const truncated = content.length > maxLength
      ? content.slice(0, maxLength) + '\n\n[Content truncated...]'
      : content;
    return { content: truncated, url };
  } catch (err) {
    return { error: err.message };
  }
}

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

    // Tools available to Claude
    const tools = [
      // Web search for general queries
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3,
      },
      // Custom URL fetch tool for direct page content (renders JavaScript)
      {
        name: 'fetch_url',
        description: 'Fetch and read the content of a specific URL. Use this when a user provides a direct link to their website or any webpage. This tool renders JavaScript so it works with React/SPA sites. Returns the page content as markdown.',
        input_schema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The full URL to fetch (e.g., https://example.com)',
            },
          },
          required: ['url'],
        },
      },
    ];

    const anthropicBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: system || 'You are a helpful marketing assistant.',
      messages,
      tools,
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

    // ─── Non-Streaming Mode with Tool Use Loop ───
    let currentMessages = [...messages];
    let loopCount = 0;
    const maxLoops = 5; // Prevent infinite loops

    while (loopCount < maxLoops) {
      loopCount++;

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ ...anthropicBody, messages: currentMessages }),
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        return res.status(anthropicRes.status).json({
          error: `Anthropic API error: ${anthropicRes.status}`,
          details: errText,
        });
      }

      const data = await anthropicRes.json();

      // Check if Claude wants to use a tool
      if (data.stop_reason === 'tool_use') {
        // Find tool_use blocks in the response
        const toolUseBlocks = data.content.filter(block => block.type === 'tool_use');

        // Add assistant's response to messages
        currentMessages.push({ role: 'assistant', content: data.content });

        // Execute each tool and collect results
        const toolResults = [];
        for (const toolUse of toolUseBlocks) {
          if (toolUse.name === 'fetch_url') {
            const result = await fetchUrlContent(toolUse.input.url);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: result.error
                ? `Error fetching URL: ${result.error}`
                : `# Content from ${result.url}\n\n${result.content}`,
            });
          } else {
            // Unknown tool - return error
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Unknown tool: ${toolUse.name}`,
              is_error: true,
            });
          }
        }

        // Add tool results to messages
        currentMessages.push({ role: 'user', content: toolResults });

        // Continue the loop to get Claude's final response
        continue;
      }

      // No more tool use, return the final response
      return res.status(200).json(data);
    }

    // If we hit max loops, return an error
    return res.status(500).json({ error: 'Tool use loop exceeded maximum iterations' });
  } catch (err) {
    console.error('API route error:', err);
    return res.status(500).json({ error: err.message });
  }
}
