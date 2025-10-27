FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* tsconfig.json ./
COPY prisma ./prisma
RUN npm install

COPY src ./src

RUN npm run build

EXPOSE 4000
CMD ["npm", "run", "start"]
