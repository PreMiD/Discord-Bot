FROM node:current-alpine as base
WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml .
RUN pnpm fetch

FROM base as builder

COPY . .

RUN pnpm i --offline
RUN pnpm build

FROM base

ENV NODE_ENV=production

COPY --from=builder /app/dist .
RUN pnpm i --offline --prod

CMD ["node", "index"]