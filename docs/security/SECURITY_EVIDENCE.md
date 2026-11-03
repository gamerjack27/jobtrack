Vulnerability 1 (Mass Assignment):
    Before: Sending { userId: "other-user-id" } in PATCH /api/applications/:id passed raw req.body to Prisma, enabling row ownership hijacking.
    After: toApplicationUpdateDTO filters out userId. Verified by passing security.integration.test.js test case asserting res.body.userId remains unchanged.

Control 2 (Cross-Tenant Access, existing control, now tested):
    Before: Ownership checks already existed in application.service.js (since Milestone 1) and return 403 when the application belongs to a different user, but they had no automated tests.
    After: security.integration.test.js now proves that User B cannot update or delete User A's application (403).

Vulnerability 3 (Brute Force):
    Before: Unlimited POST attempts to /api/auth/login.
    After: authRateLimiter returns 429 Too Many Requests after 5 failed attempts in 10 minutes.