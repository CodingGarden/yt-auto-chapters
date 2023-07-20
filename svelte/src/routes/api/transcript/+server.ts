import NodeCache from 'node-cache';
import { fetchTranscript } from './fetchTranscript';
import { error } from '@sveltejs/kit';

const transcriptCache = new NodeCache({ stdTTL: 60 * 60 * 24 * 7 });

export async function POST({ request }) {
  // Data
  const { videoId } = await request.json() as { videoId: string; };

  // Request Validation
  if (!videoId) throw error(400, 'Missing Video ID');

  // Fetch Transcript
  let transcript: string = transcriptCache.get(videoId);
  if (!transcript) transcript = await fetchTranscript(videoId);
  if (!transcript) throw error(500, 'Error fetching video transcript for video ID: ' + videoId);

  // Return Transcript
  return new Response(JSON.stringify(transcript), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
