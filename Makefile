.PHONY: install start-backend start-landing start-shared

install:
	echo "Устанавливаем зависимости..."
	cd frontend/landing && npm install
	cd frontend/shared && npm install

start-backend:
	fuser -k 8000/tcp || true
	cd backend && . ../.venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

start-landing:
	fuser -k 5173/tcp || true
	cd frontend/landing && npm run dev -- --host

start-shared:
	fuser -k 5174/tcp || true
	cd frontend/shared && npm run dev -- --host --port 5174