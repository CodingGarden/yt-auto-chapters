import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGID,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function parseHtmlEntities(str) {
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
}

function padNumber(value) {
  return value.toString().padStart(2, "0");
}

const ignore = ["[Music]", "foreign"];

async function getTranscript(videoId) {
  // TODO: cache transcripts in file in case of failure
  const { data: html } = await axios.get(
    "https://www.youtube.com/watch?v=" + videoId
  );
  let parts = html.match(
    /playerCaptionsTracklistRenderer":\{"captionTracks":\[\{"baseUrl":"(.*?)",/
  );
  if (parts) {
    let [, url] = parts;
    url = url.replaceAll("\\u0026", "&");
    const { data: xml } = await axios.get(url);
    const $ = cheerio.load(xml);
    let transcriptText = "";
    $("transcript text").each((i, el) => {
      const $el = $(el);
      const text = parseHtmlEntities($el.text());
      if (ignore.includes(text)) return;
      const start = Number($el.attr("start"));
      const seconds = Math.floor(start % 60);
      const minutes = Math.floor((start / 60) % 60);
      const hours = Math.floor(start / 3600);
      const timestamp = [hours, minutes, seconds].map(padNumber).join(":");
      transcriptText += `${timestamp}\n${text}\n`;
    });
    console.log(transcriptText.length / 4);
    await fs.promises.writeFile("transcript.txt", transcriptText, "utf-8");
    return { text: transcriptText, id: videoId };
  } else {
    console.log("Captions not found...");
    return { text: '', id: videoId };
  }
}

async function summarizeTranscript({ id, text }) {
  if (!text) return;
  try {
    // const { data } = await openai.listModels();
    // // console.log(data.data.map((i) => i.id));
    // IDEA: first combine transcript into larger sections
    // IDEA: then summarize / chapter title each section
    const { data, headers } = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You create labeled chapters for youtube videos about Programming from the YouTube channel Coding Garden. The host of the show is CJ and should be referenced by name when needed. The transcript you will be given has a timestamp on one line and the next line is the correspond text for that timestamp. This repeats for the whole transcript. The output should be each timestamp and chapter title on a newline. Each chapter title should be no longer than 50 characters. The chapter titles can be keywords, summarized concepts or titles. Only create a new chapter when the topic changes significantly. At least 2 minutes should have elapsed before specifying a new chapter. Only use the timestamps specified in the transcript. The chapter timestamps should not be greater than the largest timestamp in the transcript. The output for each line should look like: 00:00:00 Title" },
        { role: "user", content: `Summarize the following transcript:\n${text}` },
      ],
    });

    // The given transcript might include incorrect or wrong translations, always assume the speaker is talking about programming and correct the transcript accordingly.
    console.log(data.choices[0].message.content);
    await fs.promises.writeFile(`./completions/${Date.now()}-${id}.json`, JSON.stringify({ data, headers }, null, 2), 'utf-8');
  } catch (error) {
    if (error.response && error.response.data) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

// getTranscript('aTlhf2hPp4k');
// getTranscript('BbCfkUMj8lA');
// getTranscript("XzCM_fKQCJI").then(summarizeTranscript);
// getTranscript("_4M46HRHoIw").then(summarizeTranscript);
getTranscript("9FRIB2GhIdk").then(summarizeTranscript);
