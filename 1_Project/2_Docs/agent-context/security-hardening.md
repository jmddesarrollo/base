# Security Hardening - OpenCode Agent Context

## Current Goal

Incrementally harden app-base without changing the fundamental WebSocket architecture or the Controller -> BLL -> DAL pattern.

## Implemented Areas

- Input sanitization utility: `backend/utils/inputSanitizer.ts`.
- Security logger: `backend/utils/securityLogger.ts`.
- APP_SEED validation on server startup.
- CORS origin restriction via `APP_CORS_ORIGINS`.
- WebSocket rate limiter via `server/rateLimiter.ts`.
- Minimal JWT payload in `services/user/auth.bll.ts`.
- Security logging in auth and authorization flows.
- DB-backed user verification in `AuthorizedMiddleware`.
- Recovery token hashing, validation, and consumption.
- User model fields for recovery token hash/timestamp.
- Migration script for recovery-token and attempts changes.
- Property tests for sanitizer, logger, CORS, rate limiter, JWT payload, user model, and recovery token behavior.

## Active/Remaining Security Work

- Apply `InputSanitizer` in WebSocket controllers:
  - `controllers/ws/auth.controller.ts`
  - `controllers/ws/user.controller.ts`
  - `controllers/ws/permission.controller.ts`
  - `controllers/ws/role.controller.ts`
  - `controllers/ws/email.controller.ts`
- Add frontend password validator equivalent to backend regex.
- Integrate password validation in password-change forms.
- Add frontend inactivity service and integrate session timeout warning/logout.
- Add frontend property/unit tests for password validator and inactivity service.
- Run final backend/frontend verification after each batch of changes.

## Recovery Token Flow

- `auth/recoveryPassword` generates a recovery JWT and stores `SHA-256(token)` in DB.
- `auth/validateTokenRecovery` verifies JWT and calls `authService.validateRecoveryToken(user.id, token)`.
- The recovery form uses the validated token as the temporary socket token.
- `user/editPasswordUser` receives `recovery: true` from the frontend when there is no active normal session.
- After successful password change, `user.controller.ts` calls `authService.consumeRecoveryToken(user.id, user.username)`.

## Important Commands

```bash
cd 1_Project/1_Sources/backend
npm test -- --testPathPatterns=recoveryToken --runInBand
npx tsc --noEmit --ignoreDeprecations 6.0
```
