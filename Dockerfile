FROM node:22-bookworm as base
WORKDIR /app

# Instala sudo e adiciona permissões para o usuário node existente
RUN apt-get update && apt-get install -y sudo && \
    echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Copia e instala dependências
COPY --chown=node:node package*.json ./
RUN npm install

# Copia restante do código
COPY --chown=node:node . .

# Troca para o usuário não-root já existente
USER node

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
