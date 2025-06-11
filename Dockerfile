
FROM node:22.12.0-alpine AS build 
WORKDIR /app 

COPY package*.json ./
COPY .env  ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22.12.0-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json 

EXPOSE 3000

CMD ["node", "dist/main.js"]