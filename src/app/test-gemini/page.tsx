'use client';

import { useState } from 'react';
import { callGeminiAPI } from '@/lib/gemini';

export default function TestGeminiPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await callGeminiAPI([
        { role: 'user', content: input }
      ]);
      
      if (result.success) {
        setResponse(result.message);
      } else {
        setError('Failed to get response from Gemini API: ' + JSON.stringify(result.error));
      }
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Gemini API</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your message:
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
            placeholder="Type something to test the Gemini API..."
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
        >
          {isLoading ? 'Sending...' : 'Send to Gemini API'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div className="border border-gray-200 rounded-md p-4">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded">{response}</div>
        </div>
      )}
    </div>
  );
} 