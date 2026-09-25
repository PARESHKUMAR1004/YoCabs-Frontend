# Admin console: build the static site, then serve it with nginx, which also forwards /api to the
# backend so the browser only ever talks to one origin (no CORS).
#
# The build needs the shared @yocabs/api-client package, so the context is the repository root:
#   docker build -f apps/admin-web/Dockerfile -t yocabs-admin .

FROM node:20-alpine AS build
WORKDIR /repo

# Manifests first so the dependency install is cached until a package.json changes. Every
# workspace manifest is needed for the lockfile to validate, but only this app's dependencies
# are installed (-w), so nothing from the mobile app is downloaded.
COPY package.json package-lock.json .npmrc tsconfig.base.json ./
COPY packages/api-client/package.json packages/api-client/
COPY apps/admin-web/package.json apps/admin-web/
COPY apps/mobile/package.json apps/mobile/
RUN npm ci -w @yocabs/admin-web --include-workspace-root --no-audit --no-fund

COPY packages/api-client packages/api-client
COPY apps/admin-web apps/admin-web
RUN npm run build -w @yocabs/admin-web

FROM nginx:1.27-alpine

# nginx renders /etc/nginx/templates/*.template with the container's environment on start-up.
COPY apps/admin-web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY apps/admin-web/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /repo/apps/admin-web/dist /usr/share/nginx/html

# PORT is supplied by the host (Railway); API_UPSTREAM / API_HOST point at the backend.
ENV PORT=8080
EXPOSE 8080
