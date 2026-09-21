#!/usr/bin/env bash

declare -A RESERVED_PORTS=()

port_is_available() {
  local port="$1"
  [[ -z "${RESERVED_PORTS[$port]:-}" ]] || return 1
  python3 - "$port" <<'PY'
import socket
import sys

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    try:
        sock.bind(("0.0.0.0", int(sys.argv[1])))
    except OSError:
        raise SystemExit(1)
PY
}

reserve_available_port() {
  local variable="$1"
  local requested="$2"
  local label="$3"
  local port="$requested"

  while ! port_is_available "$port"; do
    port=$((port + 1))
    if ((port > 65535)); then
      echo "No available port found for $label starting at $requested" >&2
      return 1
    fi
  done

  RESERVED_PORTS[$port]=1
  if [[ "$port" != "$requested" ]]; then
    echo "$label port $requested is busy; using $port" >&2
  fi
  printf -v "$variable" '%s' "$port"
  export "$variable"
}

reuse_compose_port() {
  local variable="$1"
  local service="$2"
  local container_port="$3"
  local published

  published="$(docker compose port "$service" "$container_port" 2>/dev/null | head -n 1)"
  [[ -n "$published" ]] || return 1
  published="${published##*:}"
  [[ "$published" =~ ^[0-9]+$ ]] || return 1

  RESERVED_PORTS[$published]=1
  printf -v "$variable" '%s' "$published"
  export "$variable"
}
