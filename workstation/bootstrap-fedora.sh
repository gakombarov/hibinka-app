#!/usr/bin/env bash
set -euo pipefail
directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
export PATH="$HOME/.local/bin:$PATH"
export GOBIN="$HOME/.local/bin"
if [[ -f /.flatpak-info ]]; then
  exec flatpak-spawn --host bash "$directory/bootstrap-fedora.sh"
fi
mkdir -p "$GOBIN"
python3 "$directory/install-user-tools.py"
uv python install 3.11
command -v gopls >/dev/null || go install golang.org/x/tools/gopls@v0.24.0
command -v dlv >/dev/null || go install github.com/go-delve/delve/cmd/dlv@v1.27.2
bash "$directory/install-devops.sh"
if command -v code >/dev/null; then
  editor=(code)
else
  editor=(flatpak run com.visualstudio.code)
  python3 "$directory/configure-vscode.py"
fi
while IFS= read -r extension; do
  "${editor[@]}" --install-extension "$extension"
done < "$directory/extensions.txt"
