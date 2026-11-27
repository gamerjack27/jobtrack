## Summary
<!-- Briefly describe what this PR changes and why. -->

## Checklist

### Architecture conformance
- [ ] Route handlers stay thin and delegate business logic to the service layer
- [ ] Database queries stay encapsulated in repositories / data layer (no direct Prisma usage in routes or UI)

### Design quality
- [ ] New functions and variables are clearly named for their responsibility
- [ ] No duplicated validation or business logic that should be shared
- [ ] Errors use structured/typed handling without leaking internal details

### UX and accessibility (if applicable)
- [ ] Interactive controls are keyboard-accessible and properly labeled
- [ ] Loading, empty, and error states are handled cleanly
- [ ] Layout checked across desktop and mobile viewports

### Process hygiene
- [ ] Commit messages follow Conventional Commits (`feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `security`)
- [ ] Relevant unit/integration/frontend tests, lint, and build checks pass
- [ ] No `.env` files, credentials, or secrets committed