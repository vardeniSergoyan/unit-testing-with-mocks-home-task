---
name: unit-testing-homework
description: Dynamic unit testing skill that reads homework.spec.md and completes the homework (green tests + coverage + PR).
mode: code
agents:
  - codemie-code
  - claude
---

# Unit Testing Homework Skill (Dynamic)

## Source of truth
Read `homework.spec.md` in the repository root. This file changes every homework and defines:
- target files/modules
- testing framework & mocking requirements
- coverage scope and thresholds
- required scripts/commands
- branch/PR requirements

If `homework.spec.md` is missing, search for `homework*.md` and use the most relevant one (prefer `homework.spec.md`).

## Non‑negotiable Definition of Done
Do not stop until ALL are true:
1. `npm test` is GREEN.
2. `npm run coverage` is GREEN and enforces the scope + thresholds from `homework.spec.md`.
3. Coverage is computed ONLY for the target file(s) required by `homework.spec.md` (no accidental extra files counted).
4. If the spec requires Husky:
   - `.husky/pre-push` exists and runs the required command (prefer coverage if thresholds must be enforced).
   - The hook fails the push when tests/coverage fail.
5. Git delivery:
   - Create/switch to the branch specified in the spec (default: `homework/unit-tests-agent`).
   - Commit all changes (tests, config, hooks, spec/skill files if required).
   - Push branch to origin.
   - Create a PR to the base branch (default: `main`) with a clear summary and run instructions.

## Execution strategy (repeatable loop)
1. **Intake**
   - Read `homework.spec.md`.
   - Read `package.json` scripts and existing test layout.
   - Identify target modules and dependencies (HTTP, fs, DB, env vars).
2. **Plan**
   - Produce a minimal test plan to cover:
     - happy paths
     - error paths
     - boundary cases
     - branch conditions (if/else, early returns, loops)
3. **Implement**
   - Add tests following repo style and homework requirements.
   - Add minimal configuration changes only if required (nyc scope/thresholds, husky, scripts).
4. **Verify**
   - Run `npm test`. Fix failures. Repeat until green.
   - Run `npm run coverage`. If thresholds fail, add meaningful tests. Repeat until green.
5. **Deliver**
   - Ensure all requirements in the spec are met.
   - Commit, push, create PR.

## Rules for writing GOOD unit tests (quality bar)

### A) Test structure & readability
- Use **Arrange → Act → Assert** (AAA).
- One test should verify **one behavior**. Split if necessary.
- Test names must describe behavior and condition:
  - `should <expected behavior> when <condition>`
- Keep tests short and focused; avoid unnecessary setup.

### B) Determinism & isolation
- Tests must be deterministic:
  - no dependency on network, time, randomness, or execution order
- Never call real external services.
- Reset state between tests (`beforeEach/afterEach`).
- Restore stubs/mocks after each test (e.g., `sinon.restore()`).

### C) What to test (coverage that matters)
- Cover both:
  - successful behavior (happy path)
  - failures (exceptions/rejections)
  - empty inputs / missing params / invalid inputs
- For complex conditions/loops, ensure each branch is executed at least once:
  - matching vs not matching
  - early break/return branches
  - “no data loaded” branches

### D) What NOT to test
- Avoid testing implementation details when public behavior can be tested.
- Avoid brittle tests that break on harmless refactors.
- Don’t snapshot large blobs unless required by the homework.

### E) Mocks/stubs guidance (Node + Mocha)
- Prefer stubbing at module boundaries:
  - If a module imports dependencies (e.g., `axios`), use **proxyquire** to inject a stubbed module.
  - Use **sinon** stubs/spies for:
    - return values / rejected promises
    - asserting call count/arguments
- Use **nock** when homework explicitly requires HTTP-level mocking:
  - intercept the exact URL(s)
  - cover success + error behavior
- Do not mix mocking styles unnecessarily—follow spec requirements.

### F) Assertions
- Use Node `assert` by default unless repository already uses `chai/expect`.
- Assert:
  - returned values
  - thrown errors (type/message)
  - relevant side effects (e.g., internal state changes) if part of behavior
- Avoid overly generic assertions (“not null”) when you can assert exact expected output.

### G) Coverage rules
- If coverage is below threshold:
  - add tests that cover meaningful scenarios for uncovered lines/branches
  - don’t add fake calls just to “touch lines”
- Enforce nyc config as required:
  - include only target files
  - exclude tests and non-target sources from the coverage scope

## Repo hygiene rules
- Do not commit secrets (tokens/keys).
- Keep config changes minimal and justified by `homework.spec.md`.
- Update README/run instructions only if required by homework.

## PR content requirements
The PR description must include:
- How to run tests: `npm test`
- How to run coverage: `npm run coverage`
- What was added (tests + config + hooks)
- What mocking approach was used (proxyquire/sinon and/or nock), as required by spec
