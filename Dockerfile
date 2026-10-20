# One image for the whole site: the Node server answers /api and serves the
# Vite build for every other path.

# The site, built to dist/.
FROM node:24-alpine AS site
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# The server's runtime dependencies only.
FROM node:24-alpine AS server-deps
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Node runs the server's TypeScript directly (type stripping), so there is
# nothing to compile.
FROM node:24-alpine
# set by CI from the release tag, shown by /api/health
ARG VERSION=dev
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    STATIC_DIR=public \
    APP_VERSION=$VERSION
COPY --from=server-deps /app/node_modules ./node_modules
COPY server/package.json ./
COPY server/src ./src
COPY --from=site /app/dist ./public
USER node
EXPOSE 8080
CMD ["node", "src/main.ts"]
