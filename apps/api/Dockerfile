FROM node:22-alpine

WORKDIR /app

COPY . .
RUN corepack enable && yarn install && yarn workspace @manufactura/api build

EXPOSE 3001

CMD ["yarn", "workspace", "@manufactura/api", "start"]
