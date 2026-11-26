"""Configure the existing Flatpak VS Code user settings, with a backup."""
from datetime import datetime
import json
from pathlib import Path
import shutil
import tempfile

home = Path.home()
settings_path = home / ".var/app/com.visualstudio.code/config/Code/User/settings.json"
original = settings_path.read_text() if settings_path.exists() else "{}\n"
settings = json.loads(original)
wrappers = home / ".local/libexec/vscode-host"
wrappers.mkdir(parents=True, exist_ok=True)
for source in (Path(__file__).parent / "host-bin").iterdir():
    target = wrappers / source.name
    if target.exists() and source.read_bytes() != target.read_bytes():
        raise SystemExit(f"Refusing to overwrite an existing wrapper: {target}")
    if not target.exists():
        shutil.copy2(source, target)

profiles = settings.setdefault("terminal.integrated.profiles.linux", {})
profiles.setdefault("System Zsh", {
    "path": "/usr/bin/flatpak-spawn",
    "args": ["--host", "/usr/bin/zsh"],
    "icon": "terminal-bash",
})
settings.setdefault("terminal.integrated.defaultProfile.linux", "System Zsh")

kubernetes = settings.setdefault("vs-kubernetes", {})
for name in ("kubectl", "helm", "minikube"):
    kubernetes[f"vscode-kubernetes.{name}-path-linux"] = str(wrappers / name)
settings["containers.containerCommand"] = str(wrappers / "docker")
settings["containers.composeCommand"] = str(wrappers / "docker-compose")
settings["ansible.ansible.path"] = str(wrappers / "ansible")
settings["terraform.languageServer.terraform.path"] = str(wrappers / "terraform")
settings["vitest.nodeExecutable"] = str(home / ".local/bin/node")
updated = json.dumps(settings, ensure_ascii=False, indent=4) + "\n"
if original != updated:
    stamp = datetime.now().strftime("%Y%m%dT%H%M%S%f")
    backup = settings_path.with_name(f"settings.json.before-workstation-{stamp}")
    settings_path.parent.mkdir(parents=True, exist_ok=True)
    if settings_path.exists():
        shutil.copy2(settings_path, backup)
        print(f"Backup: {backup}")
    with tempfile.NamedTemporaryFile(
        mode="w", dir=settings_path.parent, delete=False
    ) as stream:
        stream.write(updated)
        replacement = Path(stream.name)
    if settings_path.exists():
        shutil.copymode(settings_path, replacement)
    replacement.replace(settings_path)
