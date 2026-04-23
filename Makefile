COMPOSE = docker-compose.local.yml
VENV = .venv

.PHONY: setup start stop migrate create-admin logs

# 1. Полная настройка с нуля
setup:
	@echo "--- Подготовка локальных зависимостей (для PyCharm) ---"
	test -d $(VENV) || python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r hibinka51-server/requirements.txt
	cd hibinka51-client && npm install
	@echo "--- Сборка Docker образов ---"
	docker compose -f $(COMPOSE) build

# 2. Запуск всего проекта
start:
	@echo "--- Запуск Hibinka51 в Docker ---"
	docker compose -f $(COMPOSE) up -d
	@echo "Проект запущен!"
	@echo "Backend: http://localhost:8000/docs"
	@echo "Frontend: http://localhost:5173"

# 3. Миграции 
migrate:
	@echo "--- Применение миграций ---"
	docker compose -f $(COMPOSE) run --rm server alembic upgrade head

# 4. Создание пользователя
create-admin:
	@echo "--- Создание администратора ---"
	docker compose -f $(COMPOSE) run --rm server python create_user.py

# 5. Просмотр логов
logs:
	docker compose -f $(COMPOSE) logs -f

# 6. Остановка
stop:
	docker compose -f $(COMPOSE) down