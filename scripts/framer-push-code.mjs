// Uploads every framer/*.tsx file to the Framer project as a code file,
// creating it or updating the file with the same name, then typechecks it in Framer.
// Usage: FRAMER_API_KEY=... npm run framer:push-code
import { readdir, readFile } from "node:fs/promises"
import { connect } from "framer-api"
import { FRAMER_PROJECT_URL } from "../framer.config.mjs"

if (!process.env.FRAMER_API_KEY) {
  console.error("FRAMER_API_KEY is not set. Create one in Framer: project settings → API Keys.")
  process.exit(1)
}

const names = (await readdir("framer")).filter((name) => name.endsWith(".tsx"))
const framer = await connect(FRAMER_PROJECT_URL, process.env.FRAMER_API_KEY)

try {
  const existing = await framer.getCodeFiles()
  for (const name of names) {
    const code = await readFile(`framer/${name}`, "utf8")
    const current = existing.find((file) => file.name === name)

    let file = current
    if (!current) {
      file = await framer.createCodeFile(name, code)
      console.log(`+ created ${file.path}`)
    } else if (current.content !== code) {
      file = await current.setFileContent(code)
      console.log(`~ updated ${file.path}`)
    } else {
      console.log(`= unchanged ${file.path}`)
    }

    console.log(`  exports: ${file.exports.map((item) => `${item.name} (${item.type})`).join(", ")}`)
    const diagnostics = await file.typecheck()
    for (const diagnostic of diagnostics) console.log("  typecheck:", diagnostic)
  }
} finally {
  await framer.disconnect()
}
