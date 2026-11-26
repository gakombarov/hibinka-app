#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
mkdir -p "$HOME/.local/bin"

install_release() (
  tool=$1 base=$2 archive=$3 checksums=$4 member=$5
  command -v "$tool" >/dev/null && return 0
  cd "$(mktemp -d)"
  curl -fsSLO --retry 2 --max-time 360 "$base/$archive"
  curl -fsSLO --retry 2 --max-time 60 "$base/$checksums"
  if [[ $tool == helm ]]; then
    printf '%s  %s\n' "$(cut -d ' ' -f1 "$checksums")" "$archive" | sha256sum -c -
  else
    awk -v name="$archive" '$2==name || $2=="*" name {print}' "$checksums" | sha256sum -c -
  fi
  case "$archive" in
    *.zip) python3 -m zipfile -e "$archive" . ;;
    *.tar.gz) tar -xzf "$archive" "$member" ;;
  esac
  install -m 0755 "$member" "$HOME/.local/bin/$tool"
)

install_release helm https://get.helm.sh helm-v3.22.1-linux-amd64.tar.gz helm-v3.22.1-linux-amd64.tar.gz.sha256sum linux-amd64/helm
install_release terraform https://releases.hashicorp.com/terraform/1.17.2 terraform_1.17.2_linux_amd64.zip terraform_1.17.2_SHA256SUMS terraform
install_release tofu https://github.com/opentofu/opentofu/releases/download/v1.13.10 tofu_1.13.10_linux_amd64.tar.gz tofu_1.13.10_SHA256SUMS tofu
install_release flux https://github.com/fluxcd/flux2/releases/download/v2.10.1 flux_2.10.1_linux_amd64.tar.gz flux_2.10.1_checksums.txt flux
command -v ansible >/dev/null || uv tool install ansible-core==2.19.15
