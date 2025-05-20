import * as FileSystem from 'expo-file-system';
import { OPENAI_API_KEY } from '@env';

interface TranscriptionResponse {
  text: string;
}

export const transcribeAudio = async (audioUri: string): Promise<string | null> => {
  try {
    const apiKey = OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return null;
    }

    // Create form data for the API request
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Specify English to improve accuracy
    formData.append('response_format', 'json');

    // Make the API request
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Don't set Content-Type header explicitly for multipart/form-data
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json() as TranscriptionResponse;
    return data.text.trim();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return null;
  }
}; 