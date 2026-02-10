FROM node:22-alpine

WORKDIR /app

COPY . .
RUN corepack enable && yarn install && yarn workspace @manufactura/worker build

CMD ["yarn", "workspace", "@manufactura/worker", "start"]
