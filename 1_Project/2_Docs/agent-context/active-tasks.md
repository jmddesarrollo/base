# Active Tasks - OpenCode Agent Context

## Security Hardening

- [x] Base security utilities: input sanitizer and security logger.
- [x] Server startup hardening: APP_SEED validation and CORS restriction.
- [x] WebSocket rate limiter and tests.
- [x] Minimal JWT payload and DB-backed authorization checks.
- [x] Recovery token invalidation with hash storage and consumption.
- [ ] Apply input sanitization to all WebSocket controllers.
- [ ] Add frontend password validator and integrate it in password forms.
- [ ] Add frontend inactivity timeout service and integrate logout/renewal warning.
- [ ] Run final backend and frontend verification.

## Template Cleanup

- [x] Replace active legacy branding with `app-base`.
- [x] Remove old frontend logo assets.
- [x] Update active deployment/Nginx docs to app-base naming.
- [ ] Keep checking for domain-specific code when touching old files.

## Notes For Future Agents

- Treat this file as a lightweight task index, not a full project manager.
- Update it when completing major tasks so future OpenCode sessions start with accurate context.
- Keep detailed architecture and conventions in `AGENTS.md` and `architecture.md`.
