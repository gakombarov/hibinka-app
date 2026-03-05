#!/bin/bash
set -e
sudo chown -R vscode:vscode /workspace

# 1. Python Venv
if [ ! -d ".venv" ]; then
    python -m venv .venv
fi

source .venv/bin/activate
pip install -r backend/requirements.txt

# 2. Установка Frontend
echo "Устанавливаем зависимости Landing..."
cd /workspace/frontend/landing && npm install --no-audit

echo "Устанавливаем зависимости Shared..."
cd /workspace/frontend/shared && npm install --no-audit

echo "Настройка завершена!"