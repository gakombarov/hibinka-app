COMPOSE = docker-compose.local.yml
VENV = .venv
# VS Code from Flatpak needs Docker from the host system.
DOCKER ?= $(if $(wildcard /.flatpak-info),flatpak-spawn --host docker,docker)

.PHONY: setup start stop migrate create-admin logs

setup:
	@echo "--- Подготовка локальных зависимостей ---"
	test -d $(VENV) || python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r hibinka51-server/requirements.txt
	cd hibinka51-client && npm install
	@echo "--- Сборка Docker образов ---"
	$(DOCKER) compose -f $(COMPOSE) build


start:
	@echo "--- Запуск Hibinka51 в Docker ---"
	$(DOCKER) compose -f $(COMPOSE) up -d
	@echo "Проект запущен!"
	@echo "Backend: http://localhost:8000/docs"
	@echo "Frontend: http://localhost:5173"

makemigrations:
	@echo "--- Генерация новой миграции ---"
	$(DOCKER) compose -f $(COMPOSE) run --rm server alembic revision --autogenerate -m "$(msg)"

migrate:
	@echo "--- Применение миграций ---"
	$(DOCKER) compose -f $(COMPOSE) run --rm server alembic upgrade head

create-admin:
	@echo "--- Создание администратора ---"
	$(DOCKER) compose -f $(COMPOSE) run --rm server python create_user.py

logs:
	$(DOCKER) compose -f $(COMPOSE) logs -f

stop:
	$(DOCKER) compose -f $(COMPOSE) down

deep-clean:
	$(DOCKER) compose -f $(COMPOSE) down -v --remove-orphans
	$(DOCKER) system prune -f
	sudo fuser -k 8000/tcp || true
	sudo fuser -k 5173/tcp || true
	sudo fuser -k 5445/tcp || true
	$(DOCKER) compose -f $(COMPOSE) up --build -d
