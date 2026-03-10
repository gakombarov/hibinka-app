#!/bin/bash
set -e
sudo chown -R vscode:vscode /workspace

# 1. Python Venv
if [ ! -d ".venv" ]; then
    python -m venv .venv
fi

source .venv/bin/activate
pip install -r hibinka51-server/requirements.txt

# 2. Установка Frontend
echo "Устанавливаем зависимости Client..."
cd /workspace/hibinka51-client && npm install --no-audit

echo "Настройка завершена!"