FROM node:current-alpine

COPY . .

RUN yarn build

CMD ["yarn", "start"]