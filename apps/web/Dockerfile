FROM node:22-alpine AS build

WORKDIR /app

COPY package.json yarn.lock* .yarnrc.yml* ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages ./packages
COPY tsconfig.json ./tsconfig.json

RUN corepack enable && yarn install

WORKDIR /app/apps/web
RUN yarn build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
