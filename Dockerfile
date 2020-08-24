FROM node:current-slim

COPY . .

RUN yarn compile


CMD ["yarn", "start"]