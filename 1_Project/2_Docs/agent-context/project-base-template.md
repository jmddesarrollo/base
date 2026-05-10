# Project Base Template - OpenCode Agent Context

## Objective

Keep this repository as a reusable base for future projects. The base should include generic infrastructure only and avoid project-specific business/domain code.

## Included Core Features

- Login/logout and JWT renewal.
- Password recovery by email.
- User CRUD and password change flow.
- Roles and permissions (RBAC).
- Socket.IO communication.
- MySQL/Sequelize persistence.
- Docker/Nginx deployment baseline.
- Generic home/dashboard and user/permission administration.

## Naming and Branding

- Use `app-base` for the template identity.
- Do not introduce project-specific names, domains, logos, emails, or legal text.
- Generic email/domain references should use:
  - Email: `jmddesarrollo@gmail.com`
  - Web: `app-base.es`
  - App name: `app-base`
- Preserve local secrets/passwords only when changing them would break the developer environment.

## Generic Permissions

- Keep generic permissions such as `permissions_manager` and `users_manager`.
- New modules should define their own permission names explicitly and document them.
- Avoid restoring old domain-specific permissions.

## Adding New Backend Modules

1. Add Sequelize model in `backend/models/`.
2. Add DAL/BLL in `backend/services/<domain>/`.
3. Add controller in `backend/controllers/ws/`.
4. Register events in `backend/routes/ws/`.
5. Wire routes in the server if needed.
6. Add property/unit tests when behavior is non-trivial.

## Adding New Frontend Modules

1. Add model in `frontend/src/app/models/`.
2. Add WebSocket service in `frontend/src/app/services/websockets/`.
3. Add component under `frontend/src/app/components/`.
4. Register route/guard in Angular routing.
5. Add menu item and permissions if applicable.

## Verification Checklist

- Backend compiles with `npx tsc --noEmit --ignoreDeprecations 6.0`.
- Frontend builds with `npx ng build`.
- Relevant Jest tests pass.
- Search for old project-specific terms before finishing branding/template tasks.
