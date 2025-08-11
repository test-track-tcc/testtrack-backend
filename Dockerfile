FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    git \
    sudo \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 20 e npm mais recente
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Criar usuário com permissões sudo (opcional)
RUN useradd -m -s /bin/bash node && \
    echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

WORKDIR /app

# Copiar arquivos de dependência primeiro para cache do Docker
COPY package*.json ./

# Instalar dependências do projeto e NestJS CLI global ignorando conflitos de peerDependencies
RUN npm install -g @nestjs/cli --legacy-peer-deps && npm install --legacy-peer-deps

# Copiar o restante do código
COPY . .

# Garantir permissões totais na pasta
RUN chmod -R 777 /app

# Porta do NestJS
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "start:dev"]
