import { useState, useCallback, useRef } from 'react';

// Check if message contains a URL (likely needs tool use)
function containsUrl(text) {
  const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+|\b[\w-]+\.(com|ai|io|co|org|net|app)\b/i;
  return urlPattern.test(text);
}

// Upload files and get extracted content
async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach(file => formData.append('file', file));

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState([]); // Current pending attachments
  const abortRef = useRef(null);

  // Add files to pending attachments
  const addAttachments = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const result = await uploadFiles(Array.from(files));
      if (result.success && result.files) {
        setAttachments(prev => [...prev, ...result.files]);
      }
      return result.files;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Remove a pending attachment
  const removeAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all pending attachments
  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const sendMessage = useCallback(async (userMessage, systemPrompt, messageAttachments = null) => {
    // Use provided attachments or current pending ones
    const filesToSend = messageAttachments || attachments;

    // Build user message content (can be string or array for multimodal)
    let userContent = userMessage;

    if (filesToSend.length > 0) {
      const contentParts = [];

      // Add file contents
      for (const file of filesToSend) {
        if (file.type === 'image') {
          // Images go as image blocks for Claude Vision
          contentParts.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: file.mimetype,
              data: file.content,
            },
          });
        } else {
          // Text-based files get added as text context
          contentParts.push({
            type: 'text',
            text: `[File: ${file.filename}]\n${file.content}\n[End of file]`,
          });
        }
      }

      // Add the user's message text
      contentParts.push({ type: 'text', text: userMessage });
      userContent = contentParts;
    }

    // Add user message immediately (display version)
    const displayMessage = {
      role: 'user',
      content: userMessage,
      attachments: filesToSend.length > 0 ? filesToSend.map(f => ({ filename: f.filename, type: f.type })) : undefined,
    };
    const updatedMessages = [...messages, displayMessage];
    setMessages(updatedMessages);
    setIsStreaming(true);

    // Clear pending attachments after sending
    if (!messageAttachments) {
      setAttachments([]);
    }

    // If message contains a URL, use non-streaming for tool use support
    const useStreaming = !containsUrl(userMessage);
    if (!useStreaming) {
      setIsFetchingUrl(true);
    }

    try {
      abortRef.current = new AbortController();

      // Build API messages (with actual content)
      const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content: userContent });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: apiMessages,
          stream: useStreaming,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        const errMsg = typeof errData?.error === 'string' ? errData.error
          : typeof errData?.details === 'string' ? errData.details
          : `Request failed: ${res.status}`;
        throw new Error(errMsg);
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
        const text = (
          Array.isArray(data?.content)
            ? data.content
                .filter((c) => c.type === 'text')
                .map((c) => (typeof c.text === 'string' ? c.text : String(c.text ?? '')))
                .join('\n')
            : ''
        ) || 'No response generated.';

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
      setIsFetchingUrl(false);
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
    setIsFetchingUrl(false);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return {
    messages,
    setMessages,
    isStreaming,
    isFetchingUrl,
    isUploading,
    attachments,
    sendMessage,
    stopStreaming,
    resetChat,
    addAttachments,
    removeAttachment,
    clearAttachments,
  };
}
