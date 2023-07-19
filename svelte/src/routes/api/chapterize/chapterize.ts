import { Configuration, OpenAIApi } from 'openai';
import { systemMessage } from './systemMessage';
import type { HttpError } from '@sveltejs/kit';

/**
 * Function to generate chapters from a given transcript using OpenAI's GPT-4 model.
 * @param transcript The transcript to chapterize.
 * @param apiToken The API token for OpenAI.
 * @param error HTTP error object for error handling.
 * @throws Will throw an error if the transcript or API token is not provided.
 * @returns The chapterized transcript.
 */
export const chapterize = async (transcript: string, apiToken: string, error: HttpError) => {
  // Validate input parameters
  if (!transcript) throw new Error('Missing transcript');
  if (!apiToken) throw new Error('Missing API token');

  // Configure OpenAI Client with the provided API token
  const openAIConfig = new Configuration({ apiKey: apiToken });
  const OpenAI = new OpenAIApi(openAIConfig);

  // Chapterize Transcript
  try {
    const { data } = await OpenAI.createChatCompletion({
      model: "gpt-4-0613",
      messages: [
        systemMessage,
        {
          role: 'user',
          content: transcript,
        },
      ],
    });

    // Return the content of the first message in the chat completion
    return data.choices[0].message?.content;
  } catch (e) {
    // Log any error that occurs during the chat completion creation
    console.error('Error from OpenAI API:', e);

    // If error object is provided, use it to handle the error
    if (error) error.message = 'Error from OpenAI API: ' + e.message;
  }
};