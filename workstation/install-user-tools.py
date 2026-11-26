"""Install user-local uv and Node from their official release archives."""
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.request import urlopen
from zipfile import ZipFile


def download(url):
    with urlopen(url, timeout=60) as response:
        return response.read()


def verified_download(url, sha256):
    data = download(url)
    if hashlib.sha256(data).hexdigest() != sha256:
        raise ValueError(f"SHA-256 mismatch for {url}")
    return data


def install_uv(bin_dir):
    release = json.loads(download("https://pypi.org/pypi/uv/json"))
    wheel = next(
        file for file in release["urls"]
        if "manylinux" in file["filename"] and "x86_64" in file["filename"]
    )
    data = verified_download(wheel["url"], wheel["digests"]["sha256"])
    with ZipFile(io.BytesIO(data)) as archive:
        member = next(name for name in archive.namelist() if name.endswith("/scripts/uv"))
        destination = bin_dir / "uv"
        destination.write_bytes(archive.read(member))
        destination.chmod(0o755)


def install_node(bin_dir):
    base = "https://nodejs.org/dist/"
    index = json.loads(download(base + "index.json"))
    version = next(item["version"] for item in index if item["version"].startswith("v22."))
    name = f"node-{version}-linux-x64"
    filename = name + ".tar.xz"
    url = f"{base}{version}/"
    checksums = dict(
        (filename, checksum)
        for checksum, filename in map(str.split, download(url + "SHASUMS256.txt").decode().splitlines())
    )
    data = verified_download(url + filename, checksums[filename])
    root = Path.home() / ".local/share/node"
    root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as directory:
        archive = Path(directory) / filename
        archive.write_bytes(data)
        subprocess.run(["tar", "-xJf", archive, "-C", root], check=True)
    for tool in ("node", "npm", "npx"):
        link = bin_dir / tool
        if not link.exists():
            link.symlink_to(root / name / "bin" / tool)


if __name__ == "__main__":
    import platform

    if platform.machine() != "x86_64":
        raise SystemExit("This bootstrap supports Fedora x86_64.")
    bin_dir = Path.home() / ".local/bin"
    bin_dir.mkdir(parents=True, exist_ok=True)
    if not shutil.which("uv"):
        install_uv(bin_dir)
    if not shutil.which("node"):
        install_node(bin_dir)
