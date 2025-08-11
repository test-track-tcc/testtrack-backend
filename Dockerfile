FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    git \
    sudo \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

RUN useradd -m -s /bin/bash node && \
    echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

WORKDIR /app

COPY package*.json ./

RUN npm install -g @nestjs/cli --legacy-peer-deps && npm install --legacy-peer-deps

COPY . .

RUN chmod -R 777 /app

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
