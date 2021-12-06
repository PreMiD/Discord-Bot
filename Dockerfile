FROM node:current-alpine

COPY package.json package.json
RUN yarn

COPY . .

RUN yarn build

FROM node:current-alpine

ENV NODE_ENV=production

COPY package.json package.json
RUN yarn

COPY --from=0 dist .

CMD ["node", "index"]