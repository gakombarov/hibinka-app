.PHONY: install start-server start-client

install:
	echo "Устанавливаем зависимости..."
	cd hibinka51-client && npm install

start-server:
	fuser -k 8000/tcp || true
	cd hibinka51-server && . ../.venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

start-client:
	fuser -k 5173/tcp || true
	cd hibinka51-client && npm run dev -- --host