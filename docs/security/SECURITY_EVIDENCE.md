Vulnerability 1 (Mass Assignment):
    Before: Sending { userId: "other-user-id" } in PATCH /api/applications/:id passed raw req.body to Prisma, enabling row ownership hijacking.
    After: toApplicationUpdateDTO filters out userId. Verified by passing security.integration.test.js test case asserting res.body.userId remains unchanged.

Vulnerability 2 (Unchecked Cross-Tenant Access):
    Before: User B could call DELETE /api/applications/:id for User A's application.
    After: Verification check throws ForbiddenError (403). Verified via integration test.

Vulnerability 3 (Brute Force):
    Before: Unlimited POST attempts to /api/auth/login.
    After: authRateLimiter returns 429 Too Many Requests after 5 failed attempts in 10 minutes.