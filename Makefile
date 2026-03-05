.PHONY: install start-backend start-landing start-dashboard

# Команда 1: Первичная установка 
install:
	echo "Устанавливаем зависимости для интерфейсов..."
	cd frontend/landing && npm install
	cd frontend/dashboard && npm install

# Команды 2: Запуск сервисов с автоматической зачисткой портов
start-backend:
	fuser -k 8000/tcp || true
	cd backend && . ../.venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

start-landing:
	fuser -k 5173/tcp || true
	cd frontend/landing && npm run dev -- --host

start-dashboard:
	fuser -k 5175/tcp || true
	cd frontend/dashboard && npm run dev -- --host --port 5175