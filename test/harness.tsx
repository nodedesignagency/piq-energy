// Mimics the planned Framer layout: native inputs + RoleSelector + revealed section.
import { forwardRef } from "react"
import { createRoot } from "react-dom/client"
import { CheckboxGroup, RoleSelector, withShowWhenRoleSelected } from "../framer/ContactForm"

// Plain stand-in for a Framer frame; drops the motion props Framer frames accept.
const Frame = forwardRef<HTMLDivElement, any>(({ initial, animate, transition, ...props }, ref) => (
    <div ref={ref} {...props} />
))
const RevealedSection = withShowWhenRoleSelected(Frame)

const font = { fontFamily: "Helvetica, Arial, sans-serif", fontSize: 18, lineHeight: 1.2 }
const pillDefaults = {
    name: "are_you_a",
    label: "Are you a…",
    required: true,
    font,
    uppercase: true,
    textColor: "#2B2B2B",
    selectedTextColor: "#2B2B2B",
    fill: "rgba(0,0,0,0)",
    hoverFill: "rgba(43,43,43,0.06)",
    selectedFill: "#E6E1D1",
    borderColor: "#2B2B2B",
    borderWidth: 1,
    focusColor: "#4C7DF0",
    pillWidth: 196,
    pillHeight: 40,
    gap: 28,
}
const groupDefaults = {
    required: true,
    errorMessage: "Please select at least one option.",
    showFor: [] as string[],
    questionFont: { ...font, fontSize: 20 },
    optionFont: font,
    textColor: "#2B2B2B",
    boxColor: "#FFFFFF",
    checkedColor: "#4C7DF0",
    focusColor: "#4C7DF0",
    boxWidth: 48,
    boxHeight: 18,
    columns: 2,
    columnWidth: 245,
    rowGap: 10,
    labelGap: 16,
    questionGap: 24,
}
const inputStyle = { display: "block", width: 560, height: 44, border: 0, marginTop: 16, marginBottom: 28 }
const labelStyle = { ...font, fontSize: 20, color: "#2B2B2B" }

declare global {
    interface Window {
        submissions: Record<string, FormDataEntryValue>[]
    }
}
window.submissions = []

function App() {
    return (
        <form
            id="contact"
            onSubmit={(event) => {
                event.preventDefault()
                window.submissions.push(Object.fromEntries(new FormData(event.currentTarget)))
            }}
            style={{ display: "flex", gap: 80, padding: 40, background: "#F4F2EA", alignItems: "flex-start" }}
        >
            <div>
                {["name", "email", "role", "company"].map((field) => (
                    <label key={field} style={labelStyle}>
                        {field[0].toUpperCase() + field.slice(1)}
                        <input name={field} type={field === "email" ? "email" : "text"} required style={inputStyle} />
                    </label>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 40, width: 970 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div style={labelStyle}>Are you a...*</div>
                    <RoleSelector {...pillDefaults} options={["Large Load", "Generator", "Utility / Grid Operator", "Other"]} />
                </div>
                <RevealedSection data-testid="revealed" style={{ display: "flex", flexDirection: "column", gap: 56 }}>
                    <CheckboxGroup
                        {...groupDefaults}
                        question="What kind of projects do you develop?*"
                        name="project_types"
                        options={["Data Centers", "EV Charging", "Manufacturing", "Other"]}
                    />
                    <CheckboxGroup
                        {...groupDefaults}
                        question="Where are you focused?*"
                        name="focus_regions"
                        options={["MISO", "PJM", "SPP", "ERCOT", "WECC", "NYISO", "CAISO", "ISO-NE", "SERC", "Other"]}
                    />
                    <CheckboxGroup
                        {...groupDefaults}
                        question="Large load only question*"
                        name="large_load_only"
                        options={["A", "B"]}
                        showFor={["large load"]}
                    />
                    <label style={labelStyle}>
                        Tell us why you're interested in getting in touch with Piq
                        <textarea name="message" required style={{ ...inputStyle, width: 970, height: 166 }} />
                    </label>
                    <button type="submit" style={{ alignSelf: "flex-end" }}>
                        SUBMIT
                    </button>
                </RevealedSection>
            </div>
        </form>
    )
}

createRoot(document.getElementById("root")!).render(<App />)
