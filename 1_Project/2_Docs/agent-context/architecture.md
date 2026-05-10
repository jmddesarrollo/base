# Architecture - OpenCode Agent Context

## Purpose

This repository is an app-base template for future full-stack projects. It keeps common infrastructure only: authentication, authorization, user management, permissions, email, WebSocket communication, Docker/Nginx, and MySQL persistence.

## Stack

- Backend: Node.js, Express, TypeScript, Socket.IO, Sequelize, MySQL.
- Frontend: Angular 17, PrimeNG, PrimeFlex, W3.CSS, Socket.IO client.
- Infrastructure: Docker Compose, Nginx reverse proxy, MySQL.
- Authentication: JWT signed with `APP_SEED` and bcrypt password hashes.

## Non-Negotiable Architecture

- Do not add HTTP REST endpoints for the project backend.
- Client/backend communication uses Socket.IO events.
- Backend layers must follow `Controller -> BLL -> DAL -> Model`.
- Controllers receive socket events, validate/sanitize input, call BLL, and emit socket responses.
- BLL contains business rules and validation.
- DAL contains Sequelize/database access.
- Controllers must not query Sequelize models directly except for transaction creation already present in existing patterns.

## Backend Structure

```text
1_Project/1_Sources/backend/
├── config/              # Environment-specific configuration
├── controllers/ws/      # Socket.IO event controllers
├── models/              # Sequelize models
├── routes/ws/           # Socket.IO event registration
├── server/              # Server, middlewares, mail, cron, shell services
├── services/            # Domain BLL + DAL
├── tests/property/      # Jest + fast-check property tests
├── types/               # Project-specific TypeScript types
└── utils/               # ControlException, logger, sanitizer, security logger
```

## Frontend Structure

```text
1_Project/1_Sources/frontend/src/app/
├── components/          # Angular components by feature/domain
├── guards/              # Route guards
├── models/              # TypeScript models/interfaces
├── pipes/               # Angular pipes
├── services/            # WebSocket services, shared state, helpers
└── utils/               # Frontend utilities
```

## WebSocket Event Conventions

- Events follow `domain/action`, for example `auth/login`, `auth/renewToken`, `user/editPasswordUser`.
- Normal responses emit on the same event name.
- Controlled errors emit `error_message` with `{ message, code }`.
- Permission denials emit `auth/notAllowed` with `{ mode }`.

## Error Handling

- Use `ControlException` for expected/business errors.
- Controllers must catch `ControlException` and emit its message/code.
- Unknown errors should emit `Error no controlado` without leaking internals.

## Security Principles

- JWT payload should stay minimal: `{ id, username, role_id }`.
- `AuthorizedMiddleware` must verify JWT and consult DB for current user state.
- Passwords are hashed with bcrypt.
- Recovery tokens are stored as SHA-256 hashes and consumed after successful password change.
- Use `SecurityLogger` for login failures, account locks, invalid/expired tokens, access denials, and password recovery events.
- Use `InputSanitizer` at controller boundaries when accepting user input.
