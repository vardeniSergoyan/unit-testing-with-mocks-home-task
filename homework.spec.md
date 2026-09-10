# homework.spec.md — Dynamic Unit Testing Homework Spec

Edit ONLY this file for each new homework. The agent must follow this spec.

## Commands
- Install: `npm install`
- Tests: `npm test`
- Coverage: `npm run coverage`

## Targets
Coverage and tests must focus on:
- `src/data_handlers/user_data_handler.js`

## Coverage policy
- Coverage scope: ONLY the target file(s) above
- Thresholds: 100% for statements/branches/functions/lines
- Coverage HTML artifact must exist at: `coverage/lcov-report/index.html`

## Mocking requirements
Do both variants (can be in separate test files or separate describe blocks):
1) mocha + proxyquire + sinon
2) nock (HTTP mocking for `loadUsers()` success + error)

## Husky (pre-push)
- Configure husky `pre-push` hook to run: `npm run coverage`
- Push must fail if tests/coverage fail

## Git/PR
- Branch: `homework/unit-tests-agent`
- Push branch to origin
- Create PR targeting default branch (usually `main`)
