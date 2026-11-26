#!/usr/bin/env bash
set -u
directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
if [[ -f /.flatpak-info ]]; then
  exec flatpak-spawn --host bash "$directory/check.sh"
fi
export PATH="$HOME/.local/bin:$PATH"
status=0
for tool in git go gopls dlv uv python3.11 node npm docker kubectl minikube helm terraform tofu ansible flux make gcc; do
  if ! command -v "$tool"; then
    printf 'Missing: %s\n' "$tool" >&2
    status=1
  fi
done
docker compose version || status=1
kubectl version --client || status=1
helm version --short || status=1
terraform version || status=1
tofu version || status=1
ansible --version | head -1
flux --version || status=1
exit "$status"
