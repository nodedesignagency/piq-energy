// Custom pieces for the native Framer contact form.
//
// - RoleSelector: the "Are you a…" pills. Picking one reveals the rest of the form.
// - CheckboxGroup: a checkbox grid where at least one box must be ticked.
// - withShowWhenRoleSelected: override for the frame that holds the rest of the
//   form (checkbox groups, message, submit button). Hidden until a pill is picked.
//
// Both components render real form inputs, so they validate and submit with the
// native Framer Form Container like any other field.

import {
    forwardRef,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
    type ComponentType,
    type CSSProperties,
    type RefObject,
} from "react"
import { addPropertyControls, ControlType } from "framer"

// Which "Are you a…" option is picked, shared between the pills and the override.
let selectedRole = ""
const listeners = new Set<() => void>()

function setSelectedRole(role: string) {
    selectedRole = role
    listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

function useSelectedRole() {
    return useSyncExternalStore(
        subscribe,
        () => selectedRole,
        () => ""
    )
}

const normalize = (value: string) => value.trim().toLowerCase()

// Runs onReset when the surrounding form is reset (Framer resets it after a successful submit).
function useFormReset(ref: RefObject<HTMLElement>, onReset: () => void) {
    const onResetRef = useRef(onReset)
    onResetRef.current = onReset

    useEffect(() => {
        const form = ref.current?.closest("form")
        if (!form) return
        const handleReset = () => onResetRef.current()
        form.addEventListener("reset", handleReset)
        return () => form.removeEventListener("reset", handleReset)
    }, [])
}

// Native input stretched invisibly over its custom face, so clicks, keyboard
// focus and the browser's validation bubble all land in the right place.
const overlayInput: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    opacity: 0,
    cursor: "pointer",
}

const sharedCSS = `
.piq-pill:hover { background: var(--piq-hover); }
.piq-pill[data-selected="true"]:hover { background: var(--piq-selected-fill); }
.piq-pill:has(input:focus-visible),
.piq-box:has(input:focus-visible) { outline: 2px solid var(--piq-focus); outline-offset: 2px; }
`

interface RoleSelectorProps {
    options: string[]
    name: string
    label: string
    required: boolean
    font: CSSProperties
    uppercase: boolean
    textColor: string
    selectedTextColor: string
    fill: string
    hoverFill: string
    selectedFill: string
    borderColor: string
    borderWidth: number
    focusColor: string
    pillWidth: number
    pillHeight: number
    gap: number
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export function RoleSelector(props: RoleSelectorProps) {
    const {
        options,
        name,
        label,
        required,
        font,
        uppercase,
        textColor,
        selectedTextColor,
        fill,
        hoverFill,
        selectedFill,
        borderColor,
        borderWidth,
        focusColor,
        pillWidth,
        pillHeight,
        gap,
    } = props
    const ref = useRef<HTMLDivElement>(null)
    const selected = useSelectedRole()

    useFormReset(ref, () => setSelectedRole(""))

    // A fresh form (e.g. after navigating back to the page) starts collapsed.
    useEffect(() => () => setSelectedRole(""), [])

    return (
        <div
            ref={ref}
            role="radiogroup"
            aria-label={label}
            style={
                {
                    ...props.style,
                    display: "flex",
                    flexWrap: "wrap",
                    gap,
                    "--piq-hover": hoverFill,
                    "--piq-selected-fill": selectedFill,
                    "--piq-focus": focusColor,
                } as CSSProperties
            }
        >
            <style>{sharedCSS}</style>
            {options.map((option) => {
                const isSelected = option === selected
                return (
                    <label
                        key={option}
                        className="piq-pill"
                        data-selected={isSelected}
                        style={{
                            ...font,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxSizing: "border-box",
                            minWidth: pillWidth,
                            height: pillHeight,
                            padding: "0 24px",
                            borderRadius: 999,
                            border: `${borderWidth}px solid ${borderColor}`,
                            background: isSelected ? selectedFill : fill,
                            color: isSelected ? selectedTextColor : textColor,
                            textTransform: uppercase ? "uppercase" : "none",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            userSelect: "none",
                            transition: "background 0.2s",
                        }}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            required={required}
                            checked={isSelected}
                            onChange={() => setSelectedRole(option)}
                            style={overlayInput}
                        />
                        {option}
                    </label>
                )
            })}
        </div>
    )
}

addPropertyControls(RoleSelector, {
    options: {
        type: ControlType.Array,
        title: "Options",
        control: { type: ControlType.String },
        defaultValue: ["Large Load", "Generator", "Utility / Grid Operator", "Other"],
    },
    name: {
        type: ControlType.String,
        title: "Field Name",
        defaultValue: "are_you_a",
        description: "Name of this field in form submissions.",
    },
    label: {
        type: ControlType.String,
        title: "A11y Label",
        defaultValue: "Are you a…",
    },
    required: {
        type: ControlType.Boolean,
        title: "Required",
        defaultValue: true,
    },
    font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 20, lineHeight: 1.2 },
    },
    uppercase: {
        type: ControlType.Boolean,
        title: "Uppercase",
        defaultValue: true,
    },
    textColor: { type: ControlType.Color, title: "Text", defaultValue: "#2B2B2B" },
    selectedTextColor: { type: ControlType.Color, title: "Selected Text", defaultValue: "#2B2B2B" },
    fill: { type: ControlType.Color, title: "Fill", defaultValue: "rgba(0, 0, 0, 0)" },
    hoverFill: { type: ControlType.Color, title: "Hover Fill", defaultValue: "rgba(43, 43, 43, 0.06)" },
    selectedFill: { type: ControlType.Color, title: "Selected Fill", defaultValue: "#E6E1D1" },
    borderColor: { type: ControlType.Color, title: "Border", defaultValue: "#2B2B2B" },
    borderWidth: { type: ControlType.Number, title: "Border Width", defaultValue: 1, min: 0, max: 4, step: 0.5 },
    focusColor: { type: ControlType.Color, title: "Focus Ring", defaultValue: "#4C7DF0" },
    pillWidth: { type: ControlType.Number, title: "Min Width", defaultValue: 196, min: 0, max: 400 },
    pillHeight: { type: ControlType.Number, title: "Height", defaultValue: 40, min: 20, max: 80 },
    gap: { type: ControlType.Number, title: "Gap", defaultValue: 28, min: 0, max: 80 },
})

interface CheckboxGroupProps {
    question: string
    options: string[]
    name: string
    required: boolean
    errorMessage: string
    showFor: string[]
    questionFont: CSSProperties
    optionFont: CSSProperties
    textColor: string
    boxColor: string
    checkedColor: string
    focusColor: string
    boxWidth: number
    boxHeight: number
    columns: number
    columnWidth: number
    rowGap: number
    labelGap: number
    questionGap: number
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export function CheckboxGroup(props: CheckboxGroupProps) {
    const {
        question,
        options,
        name,
        required,
        errorMessage,
        showFor,
        questionFont,
        optionFont,
        textColor,
        boxColor,
        checkedColor,
        focusColor,
        boxWidth,
        boxHeight,
        columns,
        columnWidth,
        rowGap,
        labelGap,
        questionGap,
    } = props
    const ref = useRef<HTMLDivElement>(null)
    const firstBoxRef = useRef<HTMLInputElement>(null)
    const [checked, setChecked] = useState<string[]>([])
    const role = useSelectedRole()

    useFormReset(ref, () => setChecked([]))

    const isMissing = required && checked.length === 0
    useEffect(() => {
        firstBoxRef.current?.setCustomValidity(isMissing ? errorMessage : "")
    })

    const hidden = showFor.length > 0 && !showFor.some((option) => normalize(option) === normalize(role))
    if (hidden) return null

    const toggle = (option: string) =>
        setChecked((current) =>
            current.includes(option) ? current.filter((item) => item !== option) : [...current, option]
        )

    const rows = Math.max(1, Math.ceil(options.length / Math.max(1, columns)))

    return (
        <div
            ref={ref}
            role="group"
            aria-label={question}
            style={
                {
                    ...props.style,
                    display: "flex",
                    flexDirection: "column",
                    gap: questionGap,
                    color: textColor,
                    "--piq-focus": focusColor,
                } as CSSProperties
            }
        >
            <style>{sharedCSS}</style>
            {question && <div style={{ ...questionFont, margin: 0 }}>{question}</div>}
            <div
                style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gridTemplateRows: `repeat(${rows}, auto)`,
                    gridTemplateColumns: `repeat(${Math.max(1, columns)}, ${columnWidth}px)`,
                    rowGap,
                }}
            >
                {options.map((option, index) => {
                    const isChecked = checked.includes(option)
                    return (
                        <label
                            key={option}
                            style={{
                                ...optionFont,
                                display: "flex",
                                alignItems: "center",
                                gap: labelGap,
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
                            <span
                                className="piq-box"
                                style={{
                                    position: "relative",
                                    flexShrink: 0,
                                    width: boxWidth,
                                    height: boxHeight,
                                    background: isChecked ? checkedColor : boxColor,
                                    transition: "background 0.2s",
                                }}
                            >
                                <input
                                    ref={index === 0 ? firstBoxRef : undefined}
                                    type="checkbox"
                                    value={option}
                                    checked={isChecked}
                                    onChange={() => toggle(option)}
                                    style={overlayInput}
                                />
                            </span>
                            {option}
                        </label>
                    )
                })}
            </div>
            {/* Ticked options are submitted as one comma-separated value. */}
            <input type="hidden" name={name} value={checked.join(", ")} />
        </div>
    )
}

addPropertyControls(CheckboxGroup, {
    question: {
        type: ControlType.String,
        title: "Question",
        defaultValue: "What kind of projects do you develop?*",
    },
    options: {
        type: ControlType.Array,
        title: "Options",
        control: { type: ControlType.String },
        defaultValue: ["Data Centers", "EV Charging", "Manufacturing", "Other"],
    },
    name: {
        type: ControlType.String,
        title: "Field Name",
        defaultValue: "project_types",
        description: "Name of this field in form submissions.",
    },
    required: {
        type: ControlType.Boolean,
        title: "Required",
        defaultValue: true,
        description: "At least one option must be ticked.",
    },
    errorMessage: {
        type: ControlType.String,
        title: "Error",
        defaultValue: "Please select at least one option.",
        hidden: (props) => !props.required,
    },
    showFor: {
        type: ControlType.Array,
        title: "Show For",
        control: { type: ControlType.String },
        defaultValue: [],
        description: "Only show for these “Are you a…” options. Leave empty to show for all.",
    },
    questionFont: {
        type: ControlType.Font,
        title: "Question Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 20, lineHeight: 1.2 },
    },
    optionFont: {
        type: ControlType.Font,
        title: "Option Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: { fontSize: 18, lineHeight: 1.2 },
    },
    textColor: { type: ControlType.Color, title: "Text", defaultValue: "#2B2B2B" },
    boxColor: { type: ControlType.Color, title: "Box", defaultValue: "#FFFFFF" },
    checkedColor: { type: ControlType.Color, title: "Checked", defaultValue: "#4C7DF0" },
    focusColor: { type: ControlType.Color, title: "Focus Ring", defaultValue: "#4C7DF0" },
    boxWidth: { type: ControlType.Number, title: "Box Width", defaultValue: 48, min: 8, max: 120 },
    boxHeight: { type: ControlType.Number, title: "Box Height", defaultValue: 18, min: 8, max: 60 },
    columns: { type: ControlType.Number, title: "Columns", defaultValue: 2, min: 1, max: 6, step: 1, displayStepper: true },
    columnWidth: { type: ControlType.Number, title: "Column Width", defaultValue: 245, min: 40, max: 600 },
    rowGap: { type: ControlType.Number, title: "Row Gap", defaultValue: 10, min: 0, max: 60 },
    labelGap: { type: ControlType.Number, title: "Label Gap", defaultValue: 16, min: 0, max: 60 },
    questionGap: { type: ControlType.Number, title: "Question Gap", defaultValue: 24, min: 0, max: 80 },
})

// Apply to the frame holding everything below the pills (checkbox groups, message, submit).
export function withShowWhenRoleSelected(Component: ComponentType<any>): ComponentType<any> {
    return forwardRef<HTMLElement, any>((props, ref) => {
        const role = useSelectedRole()
        if (!role) return null
        return (
            <Component
                ref={ref}
                {...props}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            />
        )
    })
}
