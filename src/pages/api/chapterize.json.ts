import NodeCache from 'node-cache';
import cheerio from 'cheerio';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import type { APIRoute } from "astro";

// Create OpenAI API client
const OPENAI_CONFIG = new Configuration({ apiKey: import.meta.env.OPENAI_API_KEY });
const openai = new OpenAIApi(OPENAI_CONFIG);

// Create a cache with a TTL of 1 week
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7 });

export const post: APIRoute = async ({ request }) => {
  // Extract videoId from request body
  const body = await request.json();
  const { videoId } = body as { videoId: string; };
  if (!videoId) throw new Error({ message: 'No videoId provided', status: 400 });
  // Sanitize videoId
  const videoIdRegex = /^[\w-]{11}$/;
  if (!videoIdRegex.test(videoId)) throw new Error({ message: 'Invalid videoId', status: 400 });
  // Fetch transcript
  const transcript = await getTranscript(videoId);
  if (transcript === '' || !transcript) {
    return new Response(JSON.stringify({ message: 'No transcript found', status: 404 }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  // Chapterize transcript
  const chapters = await chapterize(transcript, videoId);
  if (chapters.success === false) {
    return new Response(JSON.stringify({ message: 'Transcript for this video was too long. Try a shorter video.', status: 400 }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else if (chapters.chapters === '' || !chapters) {
    return new Response(JSON.stringify({ message: 'No chapters created', status: 500 }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Return chapters
  return new Response(JSON.stringify(chapters), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

};

async function chapterize(transcript: string, videoId: string) {
  if (!transcript) throw new Error({ message: 'No transcript provided', status: 500 });

  let chapters = '';
  const tokenEstimate = Math.round(transcript.text.length / 4);
  console.log('Token estimate:', tokenEstimate);

  console.log('Request sent to OpenAI API');
  try {
    const { data } = await openai.createChatCompletion({
      model: "gpt-4-0613",
      messages: [
        {
          role: 'system',
          content:
            "You are creating chapter summaries for YouTube videos about programming. The goal is to divide the video into chapters with timestamps. Each chapter should have a concise title, no longer than 50 characters. The chapter titles can be keywords, summarized concepts, or titles. A new chapter should be created only when there is a significant change in the topic, and at least 2 minutes should have elapsed since the start of the previous chapter.\n\nThe video transcript you will be provided follows a specific format: each line contains a timestamp, followed by the corresponding text. The timestamps in the transcript will be in either the format '00:00:00' or '00:00', depending on the overall length of the video. Please use the provided timestamps to determine the chapter breaks. The chapter timestamps should not exceed the largest timestamp in the transcript.\n\nYour task is to generate the chapter titles with timestamps. Each line of the output should follow the format '00:00:00 Title' or '00:00 Title', matching the timestamp format in the transcript.\n\nPlease note that the presenter is the only person speaking in the video.\n\nStart creating the chapter summary for the transcript below:",
        },
        {
          role: 'user',
          content: transcript.text,
        },
      ],
    });
    console.log('Response received from OpenAI API');
    chapters = data.choices[0].message?.content;

    return {
      success: true,
      chapters,
    };
  } catch (e) {
    // if the open ai request fails with status code 400, it means the transcript was too long.
    // return an error message to the user.
    if (e.response.status === 400) {
      console.error('ChatGPT sent back a 400 error. Transcript might be too long.');
      return {
        success: false,
        issue: 1,
        message: 'Transcript for this video was too long. Try a shorter video. Token estimate: ' + tokenEstimate,
      };
    }
    console.error('Error:', e);
    return {
      success: false,
      issue: 2,
      message: 'An error occurred while creating the chapter summary. Please try again later.',
    };
  }
};


async function getTranscript(videoId) {
  const cachedTranscript = cache.get(videoId);
  if (cachedTranscript) {
    console.log('Transcript found in cache');
    return cachedTranscript;
  }

  const IGNORE = ['[Music]', 'foreign'];
  const { data: html } = await axios.get(
    'https://www.youtube.com/watch?v=' + videoId
  );
  let parts = html.match(
    /playerCaptionsTracklistRenderer":\{"captionTracks":\[\{"baseUrl":"(.*?)",/
  );
  if (parts) {
    let [, url] = parts;
    url = url.replaceAll('\\u0026', '&');
    const { data: xml } = await axios.get(url);
    const $ = cheerio.load(xml);
    let transcriptText = '';
    $('transcript text').each((i, el) => {
      const $el = $(el);
      const text = parseHtmlEntities($el.text());
      if (IGNORE.includes(text)) return;
      const start = Number($el.attr('start'));
      const seconds = Math.floor(start % 60);
      const minutes = Math.floor((start / 60) % 60);
      const hours = Math.floor(start / 3600);
      const timestamp = [hours, minutes, seconds].map(padNumber).join(':');
      transcriptText += `${timestamp}\n${text}\n`;
    });
    cache.set(videoId, transcriptText);
    return { text: transcriptText, id: videoId };
  } else {
    console.log('Captions not found...');
    return { text: '', id: videoId };
  }
}

/**
 * Parses HTML entities in a string into their corresponding characters.
 * 
 * @param str The string to parse.
 * @returns The parsed string.
 */
function parseHtmlEntities(str: string): string {
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
}

/**
 * Pads a number with leading zeros to ensure it has at least two digits.
 * 
 * @param value The number to pad.
 * @returns The padded number as a string.
 */
function padNumber(value: number): string {
  return value.toString().padStart(2, "0");
}