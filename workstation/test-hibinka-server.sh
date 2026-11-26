#!/usr/bin/env bash
set -euo pipefail
directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
if [[ -f /.flatpak-info ]]; then
  exec flatpak-spawn --host bash "$directory/test-hibinka-server.sh"
fi
cd "$directory/.."
python="$PWD/.venv/bin/python"
"$python" -m pytest --version
scratch=$(mktemp -d)
git archive HEAD hibinka51-server | tar -x -C "$scratch"
export SECRET_KEY=local_test_only
export DB_USER=local_test DB_PASSWORD=local_test DB_NAME=local_test DB_HOST=127.0.0.1 DB_PORT=1
cd "$scratch/hibinka51-server"
"$python" - <<'RUN_TESTS'
import asyncio
import sys

import pytest

result = pytest.main(["-q", "--tb=short"])
# The SQLite fixture owns a module-level engine whose worker can outlive pytest.
for name in ("tests.conftest", "conftest"):
    fixtures = sys.modules.get(name)
    engine = getattr(fixtures, "engine_test", None)
    if engine is not None:
        asyncio.run(engine.dispose())
        break
raise SystemExit(result)
RUN_TESTS
