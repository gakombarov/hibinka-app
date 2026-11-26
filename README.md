# Hibinka51 — Система автоматизации и управления

Full-stack веб-приложение, объединяющее бэкенд-сервис на FastAPI и современный клиентский интерфейс на React (Vite).
Проект полностью контейнеризирован и готов к локальной разработке.

## 🛠 Технологический стек

* **Backend:** Python 3, FastAPI, Uvicorn, SQLAlchemy (Async), Alembic, Pydantic
* **Frontend:** React, TypeScript, Vite
* **Database:** PostgreSQL 15 (Alpine)
* **DevOps & Инструменты:** Docker, Docker Compose, Makefile

---

## 🚀 Быстрый старт (Локальное развертывание)

Для удобства управления локальным окружением все основные команды обернуты в `Makefile`.

### Требования

* Установленный Docker и Docker Compose
* Установленный Python 3 и `pip`
* Node.js и менеджер пакетов `npm`

### Шаги для запуска:

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/gakombarov/hibinka-app.git
   cd hibinka-app

2. **Настройте переменные окружения:**
   Создайте локальный файл .env в корне проекта, скопировав настройки из примера:
    ```Bash
    cp .env.example .env```

При необходимости отредактируйте параметры подключения к БД, секретный ключ (SECRET_KEY) или CORS-настройки внутри .env.

3. **Разверните окружение (Первичная настройка):**
   Эта команда создаст виртуальное окружение Python, установит зависимости для сервера и клиента, а также соберет
   Docker-образы:

    ```Bash
    make setup```

4. **Запустите проект:**
   Запуск всех сервисов (база данных, бэкенд, фронтенд) в фоновом режиме:

   ```Bash
    make start```

5. Примените миграции базы данных:
   Создайте структуру таблиц в базе данных с помощью Alembic:

    ```Bash
    make migrate```

6. Создайте администратора (Опционально):
   Для генерации учетной записи администратора в системе выполните:

    ```Bash
    make create-admin```

## 🔗 Доступ к сервисам локально

После успешного выполнения make start приложения доступны по следующим адресам:

- 💻 Frontend (React + Vite): http://localhost:5173

- ⚙️ Backend API Docs (Swagger): http://localhost:8000/docs

- 🗄 PostgreSQL Database: доступна на хосте через порт 5445 (внутри контейнера — 5432).

## 📂 Архитектура контейнеров (docker-compose.local.yml)

Проект разбит на три изолированных сервиса:

- db (hibinka-db-local): База данных PostgreSQL 15 с настроенным хелсчеком (pg_isready), гарантирующим, что сервер не
  запустится раньше готовности БД. Данные сохраняются в именованный вольюм pg_data_local.

- server (hibinka-server-local): FastAPI-приложение, работающее в dev-режиме (--reload) с пробросом кода через volumes
  для мгновенного обновления при изменении файлов.

- client (hibinka-client-local): Фронтенд на Vite, проксирующий запросы к бэкенду по адресу http://localhost:8000.

## 🔒 Переменные окружения (.env)

Проект использует файл конфигурации для изоляции чувствительных данных. Основные блоки настроек включают в себя:

- Параметры авторизации PostgreSQL (DB_USER, DB_PASSWORD, DB_NAME).

- Настройки JWT безопасности (SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES).

- Белый список адресов для CORS (CORS_ORIGINS) для разграничения прав доступа браузера к API.

## Деплой на VPS через GHCR

При push в `main` GitHub Actions собирает и публикует образы
`ghcr.io/gakombarov/hibinka-server` и `ghcr.io/gakombarov/hibinka-client`.
Деплой использует тег SHA коммита, который был собран в этом запуске.

Workflow передаёт на VPS актуальный `docker-compose.prod.yml`, скачивает образы,
применяет миграции из образа сервера и обновляет только `server` и `client`.
PostgreSQL и Nginx Proxy Manager должны быть уже запущены; рабочий каталог
`~/hibinka-app` и production-файл `.env` должны существовать на VPS.

Для SSH нужны прежние secrets `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`.
Для публикации и скачивания используется встроенный `GITHUB_TOKEN` с правами
`packages: write` в сборке и `packages: read` в деплое. Добавлять PAT или делать
пакеты публичными не требуется. Авторизация на VPS хранится во временном
каталоге Docker и удаляется при завершении SSH-скрипта.

Изменения должны попасть в `main`, чтобы запустился новый workflow. Повторный
запуск старого workflow продолжит использовать Docker Hub.

Если скачивание снова прервётся, проверьте журнал на VPS:

```bash
sudo journalctl -u docker --since '30 minutes ago' --no-pager -n 100
```
