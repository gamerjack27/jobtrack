# docs/security/OWASP-TOP-10-REVIEW.md

| # | Category | Status in JobTrack | Action |
|---|----------|--------------------|--------|
| A01 | Broken Access Control | Multi-tenant ownership checks in `application.service.js` (existing since Milestone 1) prevent cross-tenant update/delete | Verified — now covered by integration regression tests returning `403 Forbidden` |
| A02 | Cryptographic Failures | Passwords securely hashed with `bcrypt` (cost factor 10 / test factor 4); JWT tokens signed with dedicated secrets. **Known gaps:** access tokens expire after 15m and are stored in client-side `localStorage`; no local HTTPS enforcement for MVP | Verified, secure; known gaps documented |
| A03 | Injection | Prisma ORM parameterized queries used universally across repositories, preventing SQL injection by design | Verified, no action needed |
| A04 | Insecure Design | Addressed via threat modeling, DTO input boundaries, and explicit multi-tenant separation | Verified, no action needed |
| A05 | Security Misconfiguration | Found: no security headers (Express also sent `X-Powered-By`), and the error handler returned raw `err.message` text, including database error details, to clients | Fixed — Implemented `helmet` HTTP headers and `errorHandler` message masking when `NODE_ENV=production` (development mode still returns the message for debugging) |
| A06 | Vulnerable/Outdated Components | Monitored via regular dependency reviews and `npm audit`. **Known gap:** dev-only audit advisories remain for local MVP execution | Maintained; known gaps documented |
| A07 | Authentication Failures | Found: login endpoint susceptible to credential brute-forcing | Fixed — Integrated `express-rate-limit` with `skipSuccessfulRequests: true` on `/api/auth/login` |
| A08 | Software/Data Integrity Failures | Found: risk of mass-assignment where clients could inject unauthorized keys during updates | Fixed — Implemented allowlist-based input DTO (`toApplicationUpdateDTO`) |
| A09 | Logging/Monitoring Failures | Errors logged centrally through internal error handler middleware (`console.error(err)`). **Known gap:** console-only logging without external centralized log aggregation | Verified, logged internally; known gap documented |
| A10 | Server-Side Request Forgery (SSRF) | Not applicable — application handles internal structured JSON payloads without fetching external user-supplied URLs | Not applicable for MVP |