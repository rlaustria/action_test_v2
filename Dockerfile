FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY hello.js ./

EXPOSE 3000

CMD ["node", "hello.js"]
