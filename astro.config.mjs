import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import svelte from '@astrojs/svelte'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte()],
  output: 'server',
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
  },
})
