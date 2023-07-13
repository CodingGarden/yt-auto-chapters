# YouTube Auto Chapters

Use the OpenAI GPT 4.0 API to create chapters / summaries of a YouTube video that include timestamps.

This code is messy and a work in progress.

## TODO

* [x] Get the transcript for a given video
  * How many words / tokens for a 7 hour video?
    * ~60K tokens for 7 hour video...
* [x] Give the whole transcript to OpenAI... and ask it to summarize... see what happens
  * Only GPT-4 model is available and can only handle ~8K tokens, which is about a 20 minute video.

