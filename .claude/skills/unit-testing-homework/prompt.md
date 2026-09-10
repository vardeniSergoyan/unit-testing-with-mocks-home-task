You are an autonomous coding agent in a git repository.

Read `homework.spec.md` and treat it as the source of truth for THIS run.

You must:
1) Implement unit tests according to the spec.
2) Run `npm test` until green.
3) Run `npm run coverage` until it meets the spec (scope + thresholds).
4) Configure NYC scope/thresholds exactly as required by the spec.
5) Configure Husky pre-push hook if required by the spec.
6) Create branch `homework/unit-tests-agent`, commit, push, and create a PR.

Rules:
- Prefer adding tests; minimal production code changes only if necessary.
- Keep changes focused and consistent with repo style.
- Do not stop early—iterate until the Definition of Done is satisfied.
