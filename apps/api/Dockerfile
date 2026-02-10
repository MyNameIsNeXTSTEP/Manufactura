FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* .yarnrc.yml* ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages
COPY tsconfig.json ./tsconfig.json

RUN corepack enable && yarn install

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["yarn", "dev"]
