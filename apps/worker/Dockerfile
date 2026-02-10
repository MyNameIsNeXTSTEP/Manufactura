FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* .yarnrc.yml* ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages ./packages
COPY tsconfig.json ./tsconfig.json

RUN corepack enable && yarn install

WORKDIR /app/apps/worker

CMD ["yarn", "dev"]
