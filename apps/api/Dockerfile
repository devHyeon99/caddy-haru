# NestJS API → Render 무료 (ADR-0002, ADR-0007)
# 빌드 컨텍스트 = 저장소 루트 (packages/shared 포함): docker build -f apps/api/Dockerfile .
FROM node:24-slim AS build
WORKDIR /repo
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @caddy-haru/api...
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @caddy-haru/api... run build \
 && pnpm deploy --filter @caddy-haru/api --prod --legacy /out

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /out .
USER node
EXPOSE 3000
# 시작할 때 DB 연결·마이그레이션을 하지 않는다 (CLAUDE.md §7)
CMD ["node", "dist/main.js"]
