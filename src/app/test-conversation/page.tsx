'use client';

import { useState } from 'react';

export default function TestConversationPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{role: string, content: string, timestamp?: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to state
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          conversationType: 'general',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }
      
      const data = await response.json();
      
      // Save conversation ID for future messages
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Conversation API</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center h-full flex items-center justify-center">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-100 ml-auto max-w-[80%]' 
                    : 'bg-gray-100 mr-auto max-w-[80%]'
                }`}
              >
                <div className="text-sm">{msg.content}</div>
                {msg.timestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
      
      {conversationId && (
        <div className="mt-2 text-xs text-gray-500">
          Conversation ID: {conversationId}
        </div>
      )}
    </div>
  );
} 