import NodeCache from 'node-cache';
import { fetchTranscript } from './fetchTranscript';
import { chapterize } from './chapterize';
import { error } from '@sveltejs/kit';

const transcriptCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7 });

export async function POST({ request }) {
  // Data
  const { videoId } = await request.json() as { videoId: string; };
  const authorization: string | null = request.headers.get('authorization');
  const apiToken = authorization.split(' ')[1];

  // Request Validation
  if (!videoId || !apiToken) throw error(400, 'Missing Video ID or Authorization header');

  // Fetch Transcript
  let transcript: string = transcriptCache.get(videoId);
  if (!transcript) transcript = await fetchTranscript(videoId);
  if (!transcript) throw error(500, 'Error fetching video transcript for video ID: ' + videoId);

  // Chapterize Transcript
  let chapters = await chapterize(transcript, apiToken, error);

  // Return Chapters
  return new Response(JSON.stringify(chapters), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

}