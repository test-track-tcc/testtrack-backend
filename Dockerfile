FROM node:22

WORKDIR /app

RUN npm install -g @nestjs/cli && \
    apt-get update && apt-get install -y sudo && \
    echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
