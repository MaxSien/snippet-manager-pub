FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Budujemy kod TS do czystego JS
RUN npm run build

EXPOSE 5001

CMD ["node", "dist/index.js"]