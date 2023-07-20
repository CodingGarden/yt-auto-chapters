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

  /**
   * Function to generate chapters from a given transcript using OpenAI's GPT-4 model.
   */
  const getChapters = async (transcript: string, conversation?: { model: string; messages: { role: 'user' | 'system' | 'assistant'; content: string; }[]; }) => {
    // if (conversation) {
    //   conversation.messages.push({
    //     role: 'user',
    //     content: transcript,
    //   });
    //   try {
    //     const { data } = await OpenAI.createChatCompletion(conversation);
    //     const chapters = data.choices[0].message?.content;
    //     // Add new lines after each chapter
    //     return chapters?.replace(/(?<=\w)\n/g, '\n');
    //   } catch (e) {
    //     // Log any error that occurs during the chat completion creation
    //     console.error('Error from OpenAI API:', e);

    //     // If error object is provided, use it to handle the error
    //     if (error) error.message = 'Error from OpenAI API: ' + e.message;
    //   }
    // }

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
      const chapters = data.choices[0].message?.content;
      // Add each chapter as an element of an array 
      const arr = chapters?.split('\n');
      return arr;
    } catch (e) {
      // Log any error that occurs during the chat completion creation
      console.error('Error from OpenAI API:', e);

      // If error object is provided, use it to handle the error
      if (error) error.message = 'Error from OpenAI API: ' + e.message;
    }
  };

  // If transcript is less than 10,000 characters, chapterize it and return the result.
  if (transcript.length <= 10000) {
    return await getChapters(transcript);
  }

  // Otherwise, break into chunks of 10,000 characters
  const transcriptChunks = transcript.match(/.{1,10000}/g);
  const chapterChunks = [];
  while (transcriptChunks?.length) {
    const transcriptChunk = transcriptChunks.shift();
    const chapter = await getChapters(transcriptChunk);
    chapterChunks.push(chapter);
  }
  // Join the chapters together and return the result
  return chapterChunks.join('\n');
};