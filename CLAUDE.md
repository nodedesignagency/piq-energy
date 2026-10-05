# PIQ Energy — Framer

This repo drives the Framer project `https://framer.com/projects/piq-energy-claude--WXFDA0KlGRIphXsFjcRb-f6m9P`
through the Framer Server API (`framer-api`). Project URL and the starting node (`augiA20Il`) live in
`framer.config.mjs`. All scripts need `FRAMER_API_KEY` in the environment; never commit it.

- `npm run framer:check` — confirm the connection, list node `augiA20Il` and its children
- `npm run framer:agent-docs` — save the canvas command syntax and project fonts/colors to `.framer/`
  (read these before calling `framer.agent.applyChanges`)
- `npm run framer:push-code` — upload `framer/*.tsx` as Framer code files and typecheck them there
- `npm test` / `npm run typecheck` — Playwright behaviour tests and tsc for the code files

## In progress: contact form

Build only the contact form; nav and footer already exist in another file. Inspect `augiA20Il` first.

- Use a native Framer Form Container. Left column: native Inputs `name`, `email` (Email type),
  `role`, `company`, all Required, with labels Name / Email / Role / Company.
- Right column: text "Are you a...*" and the `RoleSelector` code component (`are_you_a`).
- Under it, one frame with the `withShowWhenRoleSelected` override containing:
  - a `CheckboxGroup`: "What kind of projects do you develop?*", `project_types`:
    Data Centers, EV Charging, Manufacturing, Other
  - a `CheckboxGroup`: "Where are you focused?*", `focus_regions`:
    MISO, PJM, SPP, ERCOT, WECC, NYISO, CAISO, ISO-NE, SERC, Other
  - a native Textarea `message`, Required, label "Tell us why you're interested in getting in touch with Piq"
  - the native Submit button: outlined pill "SUBMIT" with a circled arrow to its right
- Look: cream page background, white borderless inputs, dark text `#2B2B2B`, outlined pill buttons,
  selected pill fill `#E6E1D1`, blue accent `#4C7DF0`. Use the project's own fonts and styles.
- After building, confirm in Preview that the components' fields arrive in a test submission.
