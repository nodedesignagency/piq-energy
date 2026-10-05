// Saves the Framer agent docs (canvas command syntax + this project's fonts, colors, styles)
// to .framer/ so they can be read before building on the canvas with framer.agent.applyChanges.
// Usage: FRAMER_API_KEY=... npm run framer:agent-docs
import { mkdir, writeFile } from "node:fs/promises"
import { connect } from "framer-api"
import { FRAMER_PROJECT_URL } from "../framer.config.mjs"

if (!process.env.FRAMER_API_KEY) {
  console.error("FRAMER_API_KEY is not set. Create one in Framer: project settings → API Keys.")
  process.exit(1)
}

const framer = await connect(FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY)

try {
  await mkdir(".framer", { recursive: true })
  await writeFile(".framer/agent-system-prompt.md", await framer.agent.getSystemPrompt())
  await writeFile(".framer/agent-context.md", await framer.agent.getContext())
  console.log("Wrote .framer/agent-system-prompt.md and .framer/agent-context.md")
} finally {
  await framer.disconnect()
}
