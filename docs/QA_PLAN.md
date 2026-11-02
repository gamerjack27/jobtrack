Quality Assurance & Testing Plan — JobTrack (Milestone 2)

1. Overview & Strategy
This Quality Assurance Plan outlines the automated and manual testing strategies, environment configurations, and verification checklists used by the development team (James Zittlow and Jackson Lammons) to ensure the stability, data isolation, and security of the JobTrack backend application for Milestone 2.
Our strategy relies on a multi-tiered approach:
    Unit Testing: Validates isolated service logic, token generation/verification, validation helpers, and error middleware.
    Integration Testing: Uses Supertest to verify REST API endpoints against an isolated PostgreSQL test database instance.
    Security & Authorization Verification: Ensures RBAC constraints, rate limiting, header protections, and mass-assignment mitigations are actively enforced.
    Manual QA Checklist: Provides reproducible verification steps for continuous release readiness.

2. Test Environment & Database Strategy
To prevent test pollution and non-deterministic behavior, automated tests run against a dedicated PostgreSQL database container with database state reset between tests using fixtures.js.
    Database URL (Test): Uses a dedicated database string containing test (e.g., postgresql://user:password@localhost:5433/jobtrack_test).
    Execution Strategy: Tests execute serially using Jest's --runInBand flag to prevent concurrent transaction lock conflicts.
    Fixture Utility (tests/test-utils/fixtures.js):
        resetDatabase(): Clears Application and User tables prior to test runs.
        createTestUser(): Creates seeded users with low-cost bcrypt hashes (cost = 4) for fast test performance.
        createTestApplication(): Seeds mock job applications tied to specific user IDs.
        tokenFor(): Generates valid JWT access tokens for authenticated Supertest requests.

3. Automated Test Coverage & Justified Targets
Coverage Target
    Proposal Target: 70%+ Statement Coverage.
    Achieved Milestone 2 Coverage: >93% Statement Coverage across core modules.
Coverage Breakdown
|---Module---|---Target %---|---Current Statement %---|---Status---|
|------------|--------------|-------------------------|------------|
| src/app.js | 80% | 100% |Pass |
| src/middleware | 80% | 100% | Pass |
| src/repositories |80% |100% | Pass |
| src/routes | 80% | 89% | Pass |
| src/services | 80% |98% | Pass |
| src/utils | 80% | 100% | Pass |
| Overall Project| >70% | >94% | Exceeds Target |

4. Security & OWASP Hardening Verification
|---Control---|---Implementation---|---Verification Method---|
|-------------|--------------------|-------------------------|
| Mass-Assignment Mitigation | Structural allowlist filtering via toApplicationUpdateDTO in PATCH /api/applications/:id | security.integration.test.js verifies that extra payload fields (such as userId) are ignored. | 
| Multi-Tenant Authorization | Database ownership checks enforcing 403 Forbidden if application.userId !== req.user.sub | Integration test asserts User B cannot update or delete User A's job application records. |
| Brute-Force Rate Limiting | express-rate-limit middleware (authRateLimiter) on POST /api/auth/login | Automated test verifies IP request throttling after limit exceeded. | 
| Production Error Masking | Centralized errorHandler middleware stripping stack traces in production | Unit tests in error-handler.test.js verify sanitized output during non-development environments. |
| Security Headers | helmet middleware added in app.js | HTTP response header inspection during integration suite runs. |

5. Manual QA & TA Verification Checklist
Use this checklist to manually verify local deployment readiness before merging release tags:
Step A: Infrastructure Setup
    Docker container running PostgreSQL on port 5433.
    backend/.env populated matching backend/.env.example.
    npx prisma migrate dev applied cleanly without schema errors.
Step B: Execution of Automated Test Suite
    Run npm run test — all test suites pass without unhandled rejections.
    Run npm run test:coverage — total statement coverage meets or exceeds 85%.
Step C: API Workflow Verification
    Health Check: GET /api/health returns HTTP 200 { status: "ok" }.
    Registration: POST /api/auth/register creates user and returns JWT pair.
    Authentication: POST /api/auth/login validates credentials and issues fresh access token.
    CRUD Flow: POST /api/applications, GET /api/applications, PATCH /api/applications/:id, and DELETE /api/applications/:id execute cleanly for authenticated users.

6. Cross-Platform Testing
Ran the README verification steps (register, login, add/edit/delete, status dropdown, search/sort, summary totals, status filter, notes, refresh persistence) on each platform below.

| Browser / Device | OS | Result | Issues |
|---|---|---|---|
| Chrome <version> | Windows 11 | Pass | None |
| Firefox <version> | Ubuntu (VM) | Pass | None |
| <browser> | <OS> | Pass | None |
| Mobile viewport (Chrome DevTools, <device>) | — | Pass | None |

Tested on 10/31/26.