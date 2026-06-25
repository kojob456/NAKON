---
name: qa-bug-generator
description: >-
  Reads testcase specifications from markdown files (e.g. testcase.md), executes hybrid QA verification against live web applications using browser subagents and source code inspection, and outputs structured bug reports (bug_report.md) for failed tests.
---

# QA Bug Generator

## Overview
Automates the execution of test cases defined in specification documents (`testcase.md`) against a running frontend web application. Combines live browser subagent testing with source code analysis to ensure UI behavior, scrolling mechanics, authentication flows, and real-time data rendering match expected results. Generates detailed markdown bug reports (`bug_report.md`) for any failures encountered.

## Dependencies
- `modern-web-guidance`: Used to verify if client-side code implementations adhere to modern web best practices during static code inspection.

## Quick Start
To execute QA checks and write bug reports from `testcase.md`:
> "รบกวนใช้สคิล `qa-bug-generator` ตรวจสอบแอปพลิเคชันตามสเปคใน testcase.md แล้วสรุปรายงานบั๊กมาที่ bug_report.md"

## Workflow

### 1. Pre-flight & Specification Ingestion
- Use `view_file` to read the target test case document (default: `testcase.md`).
- Parse the markdown tables to extract Testcase IDs, Test Titles, Test Steps, and Expected Results.
- Check active running terminal commands or browser status to verify if the local dev server (e.g., `http://localhost:3001/`) is accessible. If the server is unreachable, inspect source code directly or ask the user if they want to launch `npm run dev`.

### 2. Hybrid QA Execution
Iterate through each extracted test case using a dual-verification approach:
- **Live Browser Verification:** Launch a `browser_subagent` to open URLs, click buttons, scroll page viewports, and capture screenshots/DOM trees corresponding to the test steps.
- **Source Code Inspection:** Use `grep_search` and `view_file` on React components, hooks, and style sheets to verify if underlying state logic, event listeners, responsive classes, and Firebase cloud sync support the expected behavior.
- Document pass/fail status and capture specific deviation notes where actual output diverges from expectations.

### 3. Bug Report Synthesis
- If all test cases pass cleanly, output a concise success summary in the chat.
- If any test case fails, use `write_to_file` (or `replace_file_content` if appending) to create `bug_report.md` in the project root directory.
- Format each reported bug with:
  - **Bug ID & Failed Testcase ID** (e.g., BUG-01 / TC-NAV-02)
  - **Severity Level** (🔴 Critical, 🟠 Major, 🟡 Minor)
  - **Bug Summary & Reproduction Steps**
  - **Actual vs. Expected Behavior**
  - **Root Cause Analysis** (Identified file path, component name, or CSS rule causing the issue)
  - **Proposed Fix** (Code snippet or suggested modification)

## Common Mistakes
- **Skipping Pre-flight Verification:** Attempting browser subagent clicks when the local server is down or operating on a different port. Always check active URLs first.
- **Relying Solely on Visual Viewports:** Certain responsive design tokens or background blur filters might render differently in simulation. Always cross-verify with source code logic.
- **Overwriting Previous Audit History:** When performing re-tests or follow-up QA audits, append or update sections within `bug_report.md` rather than overwriting existing historical records.
