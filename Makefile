build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

restart:
	docker compose down && docker compose up -d

bash: # Root
	docker exec -it --user root nest_backend /bin/bash

bash-mysql:
	docker exec -it mysql_db bash

prune:
	docker compose down -v --remove-orphans
	docker system prune -af

