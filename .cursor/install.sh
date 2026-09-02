#!/usr/bin/env bash
# Idempotent repository bootstrap for the Cloud Agent environment.
# Installs the system tools the validation scripts and local dev server need.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends \
  poppler-utils \
  tidy \
  libxml2-utils \
  docker.io \
  docker-compose-v2

# The nested VM cannot use the overlay2 storage driver, so pin Docker to vfs.
sudo mkdir -p /etc/docker
echo '{ "storage-driver": "vfs" }' | sudo tee /etc/docker/daemon.json >/dev/null

# Allow the agent user to talk to the Docker socket without sudo.
sudo groupadd -f docker
sudo usermod -aG docker "$(id -un)"

echo "install.sh complete"
