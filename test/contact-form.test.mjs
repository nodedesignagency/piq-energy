// Behaviour tests for framer/ContactForm.tsx, run in Chromium against test/harness.tsx.
import { after, before, beforeEach, test } from "node:test"
import assert from "node:assert/strict"
import { build } from "esbuild"
import { chromium } from "playwright"

let browser
let page
let html

before(async () => {
    const result = await build({
        entryPoints: ["test/harness.tsx"],
        bundle: true,
        write: false,
        format: "iife",
        jsx: "automatic",
        alias: { framer: "./test/framer-stub.ts" },
        define: { "process.env.NODE_ENV": '"production"' },
    })
    html = `<!doctype html><body style="margin:0"><div id="root"></div><script>${result.outputFiles[0].text}</script></body>`
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
})

after(() => browser?.close())

beforeEach(async () => {
    page = await browser.newPage({ viewport: { width: 1800, height: 1100 } })
    await page.setContent(html)
})

const revealed = () => page.getByTestId("revealed")
const pill = (label) => page.locator("label.piq-pill", { hasText: label })
const box = (label) => page.getByRole("checkbox", { name: label, exact: true })
const submissions = () => page.evaluate(() => window.submissions)

async function fillLeft() {
    await page.locator("[name=name]").fill("Ada Lovelace")
    await page.locator("[name=email]").fill("ada@example.com")
    await page.locator("[name=role]").fill("Head of Energy")
    await page.locator("[name=company]").fill("Analytical Engines")
}

test("starts collapsed: only the pills show, no submit button", async () => {
    assert.equal(await revealed().count(), 0)
    assert.equal(await page.getByRole("button", { name: "SUBMIT" }).count(), 0)
    assert.equal(await page.getByRole("radio").count(), 4)
})

test("picking a pill reveals the rest even when the left side is empty", async () => {
    await pill("Generator").click()
    await revealed().waitFor()
    assert.equal(await page.getByRole("radio", { name: "Generator" }).isChecked(), true)
    assert.equal(await pill("Generator").getAttribute("data-selected"), "true")
    assert.equal(await page.getByRole("button", { name: "SUBMIT" }).isVisible(), true)
})

test("submit is blocked until a box is ticked in every required group", async () => {
    await fillLeft()
    await pill("Generator").click()
    await page.locator("[name=message]").fill("Interested in interconnection.")
    await page.getByRole("button", { name: "SUBMIT" }).click()
    assert.deepEqual(await submissions(), [])
    assert.equal(await box("Data Centers").evaluate((el) => el.validationMessage), "Please select at least one option.")

    await box("Data Centers").check()
    await page.getByRole("button", { name: "SUBMIT" }).click()
    assert.deepEqual(await submissions(), [], "focus regions still empty")
})

test("submit is blocked while a left-side field is empty", async () => {
    await pill("Other").click()
    await box("Manufacturing").check()
    await box("PJM").check()
    await page.locator("[name=message]").fill("Hello")
    await page.getByRole("button", { name: "SUBMIT" }).click()
    assert.deepEqual(await submissions(), [])
    assert.equal(await page.locator("[name=name]").evaluate((el) => el.validity.valueMissing), true)
})

test("a complete form submits every field", async () => {
    await fillLeft()
    await pill("Utility / Grid Operator").click()
    await box("Data Centers").check()
    await box("Manufacturing").check()
    await box("MISO").check()
    await box("ERCOT").check()
    await box("ERCOT").uncheck()
    await box("SERC").check()
    await page.locator("[name=message]").fill("Grid planning.")
    await page.getByRole("button", { name: "SUBMIT" }).click()
    assert.deepEqual(await submissions(), [
        {
            name: "Ada Lovelace",
            email: "ada@example.com",
            role: "Head of Energy",
            company: "Analytical Engines",
            are_you_a: "Utility / Grid Operator",
            project_types: "Data Centers, Manufacturing",
            focus_regions: "MISO, SERC",
            message: "Grid planning.",
        },
    ])
})

test("Show For limits a group to the listed options", async () => {
    await pill("Generator").click()
    assert.equal(await page.getByRole("group", { name: "Large load only question*" }).count(), 0)
    await pill("Large Load").click()
    assert.equal(await page.getByRole("group", { name: "Large load only question*" }).count(), 1)
})

test("resetting the form collapses it and clears every choice", async () => {
    await pill("Large Load").click()
    await box("EV Charging").check()
    await page.evaluate(() => document.getElementById("contact").reset())
    await revealed().waitFor({ state: "detached" })
    assert.equal(await page.locator("label.piq-pill[data-selected=true]").count(), 0)
    await pill("Large Load").click()
    assert.equal(await box("EV Charging").isChecked(), false)
})
