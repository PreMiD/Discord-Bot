FROM node:current-alpine

COPY . .

RUN yarn build
RUN npm prune --production

FROM node:current-alpine

ENV NODE_ENV=production

COPY --from=0 dist .
COPY --from=0 node_modules node_modules


CMD ["node", "index"]