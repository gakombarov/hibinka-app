COMPOSE = docker-compose.local.yml
VENV = .venv

.PHONY: setup start stop migrate create-admin logs

setup:
	@echo "--- Подготовка локальных зависимостей ---"
	test -d $(VENV) || python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r hibinka51-server/requirements.txt
	cd hibinka51-client && npm install
	@echo "--- Сборка Docker образов ---"
	docker compose -f $(COMPOSE) build


start:
	@echo "--- Запуск Hibinka51 в Docker ---"
	docker compose -f $(COMPOSE) up -d
	@echo "Проект запущен!"
	@echo "Backend: http://localhost:8000/docs"
	@echo "Frontend: http://localhost:5173"

makemigrations:
	@echo "--- Генерация новой миграции ---"
	docker compose -f $(COMPOSE) run --rm server alembic revision --autogenerate -m "$(msg)"

migrate:
	@echo "--- Применение миграций ---"
	docker compose -f $(COMPOSE) run --rm server alembic upgrade head

create-admin:
	@echo "--- Создание администратора ---"
	docker compose -f $(COMPOSE) run --rm server python create_user.py

logs:
	docker compose -f $(COMPOSE) logs -f

stop:
	docker compose -f $(COMPOSE) down

deep-clean:
	docker compose -f docker-compose.local.yml down -v --remove-orphans
	docker system prune -f
	sudo fuser -k 8000/tcp || true
	sudo fuser -k 5173/tcp || true
	sudo fuser -k 5445/tcp || true
	docker compose -f docker-compose.local.yml up --build -d