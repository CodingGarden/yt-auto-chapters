import { describe, it } from "vitest";
import { fetchTranscript } from "./fetchTranscript";
const KNOWN_GOOD_VIDEO_ID = 'qmdHm7M3UGY';
const KNOWN_BAD_VIDEO_ID = '1234567890';

describe("fetchTranscript", () => {
  it.concurrent('should return a transcript for a video we know has transcripts', async ({ expect }) => {
    const transcript = await fetchTranscript(KNOWN_GOOD_VIDEO_ID);
    expect(transcript).toBeTruthy();
  });

  it.concurrent('should return false for a video we know does not have transcripts', async ({ expect }) => {
    const transcript = await fetchTranscript(KNOWN_BAD_VIDEO_ID);
    expect(transcript).toBeFalsy();
  });

});