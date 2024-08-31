ARG NODE_VERSION=20.17.0

# Etapa 1: Build da aplicação
FROM node:${NODE_VERSION}-alpine AS build

# Diretório de trabalho dentro do contêiner
WORKDIR /usr/src/backend-shopper

# Copiar arquivos de configuração do npm
COPY package*.json ./

# Instalar dependências de desenvolvimento e produção
RUN npm install

# Copiar o restante do código-fonte
COPY . .

# Compilar o código TypeScript
RUN npm run build

# Etapa 2: Imagem final de produção
FROM node:${NODE_VERSION}-alpine

# Definir variáveis de ambiente
ENV NODE_ENV production
ENV DATABASE_URL "mysql://root@host.docker.internal:3306/db"

# Diretório de trabalho dentro do contêiner
WORKDIR /usr/src/backend-shopper

# Copiar apenas os arquivos de configuração do npm
COPY package*.json ./

# Instalar apenas as dependências de produção
RUN npm install --only=production

# Copiar os arquivos compilados da etapa anterior
COPY --from=build /usr/src/backend-shopper/dist ./dist
COPY --from=build /usr/src/backend-shopper/prisma ./prisma

# Gerar cliente Prisma
RUN npx prisma generate

# Executar migrações Prisma
RUN npm run migrate

EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
