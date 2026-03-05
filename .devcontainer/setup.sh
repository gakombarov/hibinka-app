#!/bin/bash

# Останавливаем выполнение при любой ошибке
set -e

sudo chown -R vscode:vscode /workspace

# 2. Зеркала
export PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/
npm config set registry https://registry.npmmirror.com

# 3. Python Venv
if [ ! -d ".venv" ]; then
    python -m venv .venv
else
    echo "ℹОкружение .venv уже существует, пропускаю создание."
fi

source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
echo "Backend готов."

cd frontend
npm install --no-audit
echo "Frontend готов."

echo "Все этапы настройки Hibinka51 завершены успешно!"