#!/usr/bin/env bash
# Per-boot initialization: bring up the Docker daemon so `docker compose`
# can serve the static site. Safe to run repeatedly.
set -euo pipefail

if ! sudo docker info >/dev/null 2>&1; then
  sudo rm -f /var/run/docker.pid
  sudo dockerd >/tmp/dockerd.log 2>&1 &
fi

# Wait for the daemon to accept connections.
for _ in $(seq 1 30); do
  if sudo docker info >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! sudo docker info >/dev/null 2>&1; then
  echo "Docker daemon failed to start; see /tmp/dockerd.log" >&2
  exit 1
fi

# Make the socket usable without sudo for the current session.
sudo chmod 666 /var/run/docker.sock

echo "start.sh complete: Docker daemon is ready"
