ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production
ENV DATABASE_URL "mysql://root@host.docker.internal:3306/db"


WORKDIR /src/backend-shopper

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon 

# RUN --mount=type=bind,source=package.json,target=package.json \
# --mount=type=bind,source=package-lock.json,target=package-lock.json \
# --mount=type=cache,target=/root/.npm \
# npm ci --omit=dev

USER root

COPY . .

RUN npx prisma generate

RUN npm run migrate

EXPOSE 8000

CMD ["npm", "start"]
