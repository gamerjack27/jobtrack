FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma7.config.ts ./
COPY prisma ./prisma
RUN DATABASE_URL="postgresql://build:build@localhost:5433/build" npx --no-install prisma generate

COPY src ./src
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV PORT=5000
EXPOSE 5000

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/index.js"]