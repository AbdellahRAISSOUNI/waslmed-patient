// Gemini API utilities for WaslMed

// Gemini API Key
export const GEMINI_API_KEY = 'AIzaSyAaPd4OJxokEYKdpETKXchoXxVJ4kdysS4';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Makes a call to the Gemini API with proper formatting
 * @param messages Array of messages to send to the API
 * @param temperature Temperature for generation (0-1)
 * @param maxTokens Maximum number of tokens to generate
 * @returns The API response or error
 */
export async function callGeminiAPI(
  messages: Array<{role: string, content: string}>, 
  temperature: number = 0.7, 
  maxTokens: number = 1024
) {
  try {
    // Convert messages to Gemini format
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Make API call
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return { success: true, message: aiMessage, data };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { success: false, error };
  }
}

/**
 * Makes a multimodal call to the Gemini API for document analysis
 * @param systemPrompt System instruction for model behavior
 * @param userPrompt User's request prompt
 * @param fileBuffer The file buffer to analyze
 * @param mimeType The MIME type of the file
 * @param temperature Temperature for generation (0-1)
 * @param maxTokens Maximum number of tokens to generate
 * @returns The API response or error
 */
export async function callGeminiAPIWithFile(
  systemPrompt: string,
  userPrompt: string,
  fileBuffer: Buffer,
  mimeType: string,
  temperature: number = 0.4,
  maxTokens: number = 1024
) {
  try {
    // Create a multimodal message with system instructions first
    const systemMessage = {
      role: 'user',
      parts: [{ text: `Instructions for your task: ${systemPrompt}\n\nNow, let's analyze the document:` }]
    };

    // Create a content message with the file and prompt
    const contentMessage = {
      role: 'user',
      parts: [
        // Only include file for image types or PDFs
        ...(mimeType.startsWith('image/') || mimeType === 'application/pdf' ? [{
          inline_data: {
            mime_type: mimeType,
            data: fileBuffer.toString('base64')
          }
        }] : []),
        { text: userPrompt }
      ]
    };

    // Make API call
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [systemMessage, contentMessage],
        generationConfig: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return { success: true, message: aiMessage, data };
  } catch (error) {
    console.error('Error calling Gemini API with file:', error);
    return { success: false, error };
  }
}

/**
 * Extracts JSON from a text response that may contain markdown or other text
 * @param text The text containing JSON
 * @returns Parsed JSON object or null if parsing fails
 */
export function extractJsonFromText(text: string) {
  try {
    // Try direct parsing first
    return JSON.parse(text);
  } catch (error) {
    try {
      // Look for JSON in markdown code blocks or text
      const jsonRegex = /{[\s\S]*}/;
      const match = text.match(jsonRegex);
      
      if (match && match[0]) {
        return JSON.parse(match[0]);
      }
    } catch (innerError) {
      console.error('Error extracting JSON from text:', innerError);
    }
    return null;
  }
} 