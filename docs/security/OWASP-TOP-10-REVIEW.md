# docs/security/OWASP-TOP-10-REVIEW.md

| # | Category | Status in JobTrack | Action |
|---|----------|--------------------|--------|
| A01 | Broken Access Control | Multi-tenant ownership checks protecting application patch/delete routes against cross-tenant access | Verified; existing safeguards now explicitly covered by new integration test suites |
| A02 | Cryptographic Failures | Passwords secured with `bcrypt`; JWT tokens used. **Known Gaps:** Access tokens set to 15m; tokens stored in client-side `localStorage`; no local HTTPS enforcement for MVP | Documented known gaps |
| A03 | Injection | Prisma ORM parameterized queries used universally across repositories, preventing SQL injection by design | Verified, no action needed |
| A04 | Insecure Design | Addressed via threat modeling, DTO input boundaries, and explicit multi-tenant separation | Verified, no action needed |
| A05 | Security Misconfiguration | Default Express configuration lacked security headers and detailed stack traces could be exposed | Fixed — Implemented `helmet` HTTP headers and centralized production `errorHandler` sanitization |
| A06 | Vulnerable/Outdated Components | Monitored via regular dependency reviews and `npm audit`. **Known Gap:** Dev-only audit advisories permitted for local MVP execution | Documented known gaps |
| A07 | Authentication Failures | Login endpoint susceptible to credential brute-forcing | Fixed — Integrated `express-rate-limit` with `skipSuccessfulRequests: true` on `/api/auth/login` |
| A08 | Software/Data Integrity Failures | Risk of mass-assignment where clients could inject unauthorized keys during updates | Fixed — Implemented allowlist-based input DTO (`toApplicationUpdateDTO`) |
| A09 | Logging/Monitoring Failures | Errors logged centrally through internal error handler middleware (`console.error(err)`). **Known Gap:** Console-only logging without external centralized log aggregation | Documented known gaps |
| A10 | Server-Side Request Forgery (SSRF) | Not applicable — application handles internal structured JSON payloads without fetching external user-supplied URLs | Not applicable for MVP |