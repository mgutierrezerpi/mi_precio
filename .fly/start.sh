#!/usr/bin/env bash
set -euo pipefail

export DATABASE_PATH="${DATABASE_PATH:-/litefs/mi_precio.db}"
export HUEY_DB_PATH="${HUEY_DB_PATH:-/litefs/huey.db}"
mkdir -p "$(dirname "$DATABASE_PATH")"
mkdir -p "$(dirname "$HUEY_DB_PATH")"

api_pid=""
worker_pid=""
nginx_pid=""

cleanup() {
  status="${1:-0}"
  trap - INT TERM
  for pid in "$api_pid" "$worker_pid" "$nginx_pid"; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait || true
  exit "$status"
}

trap 'cleanup 0' INT TERM

cd /app/api
python - <<'PY'
from models import create_tables, db

db.connect(reuse_if_open=True)
try:
    create_tables()
    print("Database schema ready")
finally:
    if not db.is_closed():
        db.close()
PY

uvicorn app:app --host 127.0.0.1 --port 8000 &
api_pid=$!

huey_consumer --workers "${HUEY_WORKERS:-1}" --worker-type thread tasks.huey &
worker_pid=$!

nginx -g "daemon off;" &
nginx_pid=$!

wait -n "$api_pid" "$worker_pid" "$nginx_pid"
status=$?

cleanup "$status"
