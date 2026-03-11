import { useState, useCallback, useRef } from 'react';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (userMessage, systemPrompt) => {
    // Add user message immediately
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsStreaming(true);

    try {
      // Try streaming first
      abortRef.current = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || errData.details || `Request failed: ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // Parse SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = '';
        let buffer = '';

        // Add placeholder assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const event = JSON.parse(data);
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                assistantText += event.delta.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                  return updated;
                });
              }
            } catch {
              // Skip malformed events
            }
          }
        }

        // Ensure final state is set
        if (assistantText) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantText };
            return updated;
          });
        }

        return assistantText;
      } else {
        // Non-streaming JSON response
        const data = await res.json();
        const text =
          data.content
            ?.filter((c) => c.type === 'text')
            .map((c) => c.text)
            .join('\n') || 'No response generated.';

        setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
        return text;
      }
    } catch (err) {
      if (err.name === 'AbortError') return '';

      const errorMsg = `Error: ${err.message}`;
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg }]);
      return errorMsg;
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages]);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setIsStreaming(false);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming, resetChat };
}
