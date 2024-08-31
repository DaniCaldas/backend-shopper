ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/backend-shopper

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production
ENV DATABASE_URL "mysql://root@host.docker.internal:3306/db"

WORKDIR /usr/src/backend-shopper

COPY package*.json ./

RUN npm install --only=production

COPY --from=build /usr/src/backend-shopper/dist ./dist
COPY --from=build /usr/src/backend-shopper/prisma ./prisma

RUN npx prisma generate

RUN npm run migrate

EXPOSE 8000

CMD ["node", "dist/server.js"]
