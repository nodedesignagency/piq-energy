// Stand-in for the "framer" module so ContactForm.tsx can run outside Framer.
export function addPropertyControls() {}
export const ControlType = new Proxy({} as Record<string, string>, { get: (_, key) => String(key) })
