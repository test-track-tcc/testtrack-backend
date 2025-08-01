RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
BLUE=\033[0;34m
RESET=\033[0m

.PHONY: install up down bash logs

install:
	@echo "$(YELLOW)Iniciando a instalação do projeto Nest.js...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(GREEN)Arquivo .env não encontrado. Criando a partir de .env.example...$(RESET)"; \
		cp .env.example .env; \
	else \
		echo "$(GREEN)Arquivo .env encontrado.$(RESET)"; \
	fi
	@echo "$(YELLOW)Instalando dependências do Node (NPM)...$(RESET)"
	docker compose exec backend npm install
	@echo "$(YELLOW)Fazendo o build do projeto...$(RESET)"
	docker compose exec backend npm run build
	@echo "$(GREEN)Instalação concluída com sucesso! ✔️$(RESET)"
	@echo "Agora você pode subir os serviços com o comando 'make up'"

up:
	@echo "$(GREEN)Iniciando a API e o Banco de Dados...$(RESET)"
	docker compose up -d

down:
	@echo "$(RED)Parando os contêineres e removendo volumes...$(RESET)"
	docker compose down -v

bash:
	@printf "\n$(BLUE)Escolha o usuário para acessar o contêiner:$(RESET)\n"
	@printf "  1) root\n"
	@printf "  2) node (usuário não-root)\n"
	@read -p "Opção [1-2]: " opt; \
	case $$opt in \
	  1) USER=root ;; \
	  2) USER=node ;; \
	  *) echo "$(RED)Opção inválida!$(RESET)"; exit 1 ;; \
	esac; \
	echo "$(GREEN)Acessando o contêiner 'backend' como usuário '$$USER'...$(RESET)"; \
	docker compose exec -u $$USER backend bash

logs:
	@echo "$(YELLOW)Exibindo logs... (Pressione Ctrl+C para sair)$(RESET)"
	docker compose logs -f