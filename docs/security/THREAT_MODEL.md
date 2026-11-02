# docs/security/THREAT-MODEL.md

## Attack Surface
- POST /api/auth/register — unauthenticated, accepts email, displayName, password
- POST /api/auth/login — unauthenticated, accepts email, password
- POST /api/auth/refresh — unauthenticated, accepts refreshToken
- POST /api/applications — authenticated, accepts company, jobTitle, status, location, salary, appliedDate, notes
- GET /api/applications — authenticated, returns user's applications list with multi-tenant filtering
- PATCH /api/applications/:id — authenticated, accepts partial application update payloads
- DELETE /api/applications/:id — authenticated, removes specific user application record
- JWT access tokens & refresh tokens — bearer, sent in Authorization header

## STRIDE Analysis, with Risk Rating

| Component | Threat | Category | Likelihood | Impact | Risk Rating | Mitigation |
|-----------|--------|----------|------------|--------|-------------|------------|
| PATCH /api/applications/:id | A malicious user manipulates `userId` or injects unauthorized fields via mass-assignment to hijack or alter protected columns | Tampering / Elevation of Privilege | High | High | Critical | Structural input DTO (`toApplicationUpdateDTO`) using an explicit allowlist (`company`, `jobTitle`, `status`, `appliedDate`, `salary`, `location`, `notes`) to strip unsafe fields |
| PATCH /api/applications/:id & DELETE /api/applications/:id | User B attempts to update or delete User A's application by guessing or enumerating application IDs (Insecure Direct Object Reference) | Broken Access Control / Info Disclosure | High | High | Critical | Explicit ownership validation checking `existing.userId !== userId` throwing `403 Forbidden` prior to modification |
| POST /api/auth/login | Attackers perform automated credential-stuffing or brute-force attacks against user accounts | Denial of Service / Broken Auth | Medium | High | High | Rate-limiting middleware (`express-rate-limit`) restricting high-frequency requests |
| Global API error handling | Uncaught database errors or internal exceptions reveal stack traces and database schema connection details to clients | Information Disclosure | High | Medium | High | Centralized `errorHandler` middleware that sanitizes response payloads and logs errors internally in production |

### Hardening Log
- 2026 — Milestone 2: Implemented structural input DTO filtering (`toApplicationUpdateDTO`) with an explicit allowlist to prevent mass-assignment injection
- 2026 — Milestone 2: Enforced strict multi-tenant ownership checks returning `403 Forbidden` for cross-user resource access
- 2026 — Milestone 2: Added `express-rate-limit` protection to authentication endpoints
- 2026 — Milestone 2: Configured centralized production error-handling middleware to prevent stack trace leaks
- 2026 — Milestone 2: Added automated security integration test suite covering RBAC, mass-assignment protection, and unauthorized modifications

### Security Measurement Baseline
- Vulnerabilities found this pass: 3 (all remediated)
- Security test coverage: Dedicated integration test suite (`security.integration.test.js`) verifying multi-tenant data isolation and mass-assignment prevention
- Maturity note: JobTrack's security practice establishes baseline backend defense-in-depth controls (DTO validation, rate limiting, and RBAC guards) for the MVP architecture.