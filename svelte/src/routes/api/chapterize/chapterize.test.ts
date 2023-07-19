import { describe, it } from 'vitest';
import { chapterize } from './chapterize';
import { HttpError } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const TEST_TOKEN = process.env.OPENAI_API_KEY;

describe('chapterize', () => {

  it.concurrent('should throw an error if the transcript is not provided', async ({ expect }) => {
    const token = TEST_TOKEN;
    const transcript = null;
    try {
      await chapterize(transcript, token, null);
    } catch (e) {
      expect(e.message).toBe('Missing transcript');
    }
  });

  it.concurrent('should throw an error if the API token is not provided', async ({ expect }) => {
    const token = null;
    const transcript = 'This is a test transcript.';
    try {
      await chapterize(transcript, token, null);
    } catch (e) {
      expect(e.message).toBe('Missing API token');
    }
  });

  // it.concurrent('should return a chapterized transcript', async ({ expect }) => {
  //   const token = TEST_TOKEN;
  //   const transcript = fs.readFileSync('src/routes/api/chapterize/test_transcript.txt', 'utf8');

  //   const chapters = await chapterize(transcript, token, null);
  //   expect(chapters).toBeTruthy();

  // });
});