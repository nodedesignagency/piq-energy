// Connects to the Framer project and prints basic info, to confirm the API key works.
// Usage: FRAMER_API_KEY=... npm run framer:check
import { connect } from "framer-api"
import { FRAMER_PROJECT_URL, FRAMER_START_NODE_ID } from "../framer.config.mjs"

if (!process.env.FRAMER_API_KEY) {
  console.error("FRAMER_API_KEY is not set. Create one in Framer: project settings → API Keys.")
  process.exit(1)
}

const framer = await connect(FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY)

try {
  const info = await framer.getProjectInfo()
  console.log("Project:", info)

  const node = await framer.getNode(FRAMER_START_NODE_ID)
  if (!node) {
    console.log(`Node ${FRAMER_START_NODE_ID} not found`)
  } else {
    console.log(`Node ${FRAMER_START_NODE_ID}:`, node.__class, node.name ?? "")
    const children = await framer.getChildren(FRAMER_START_NODE_ID)
    for (const child of children) {
      console.log(`  - ${child.id} ${child.__class} ${child.name ?? ""}`)
    }
  }
} finally {
  await framer.disconnect()
}
