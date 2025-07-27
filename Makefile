API_DEV   = api-dev
DB        = mysql

.PHONY: dev-up dev-down rebuild api-bash db-bash logs ps prune

dev-up:
	docker compose up $(DB) $(API_DEV)

dev-down:
	docker compose down

rebuild:
	docker compose build --no-cache $(DB) $(API_DEV)

api-bash:
	docker compose exec $(API_DEV) sh

db-bash:
	docker compose exec $(DB) bash

logs:
	docker compose logs -f

ps:
	docker compose ps

prune:
	docker system prune -af --volumes
