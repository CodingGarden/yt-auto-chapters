import axios from 'axios';
import cheerio from 'cheerio';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';
const IGNORE_XML_SECTIONS = ['[Music]', 'foreign'];

/**
 * Parses HTML entities in a string into their corresponding characters.
 */
const parseHtmlEntities = (str: string): string => {
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
};

/**
 * Pads a number with leading zeros to ensure it has at least two digits.
 */
const padNumber = (value: number): string => {
  return value.toString().padStart(2, "0");
};

/**
 * Async function that fetches the transcripts for a YouTube video based on the provided video ID.
 */
export async function fetchTranscript(videoId: string) {
  const { data: html } = await axios.get(YOUTUBE_URL + videoId);
  let captionUrlMatch = html.match(
    /playerCaptionsTracklistRenderer":\{"captionTracks":\[\{"baseUrl":"(.*?)",/
  );
  if (captionUrlMatch) {
    let [, encodedUrl] = captionUrlMatch;
    const captionUrl = encodedUrl.replaceAll('\\u0026', '&');
    const { data: xml } = await axios.get(captionUrl);
    const $ = cheerio.load(xml);
    let transcriptText = '';

    $('transcript text').each((i, el) => {
      const $el = $(el);
      const text = parseHtmlEntities($el.text());
      if (IGNORE_XML_SECTIONS.includes(text)) return;
      const start = Number($el.attr('start'));
      const seconds = Math.floor(start % 60);
      const minutes = Math.floor((start / 60) % 60);
      const hours = Math.floor(start / 3600);
      const timestamp = [hours, minutes, seconds].map(padNumber).join(':');
      transcriptText += `${timestamp}\n${text}\n`;
    });

    return transcriptText;
  } else {
    console.error('Captions not found...');
    return false;
  }
}