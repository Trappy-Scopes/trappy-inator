#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Download the official OpenSCAD WebAssembly build for the Playground (gitignored; fetched by CI on every build).
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION="2026.11-RC1"
SHA256="fc9ffeed7e48dcd8aed3b0de89f93a7a1b375c22387b6dfeac8987aa73a8f387"
ZIP="OpenSCAD-${VERSION}-WebAssembly-web.zip"
DEST=docs/assets/playground/openscad
mkdir -p build "$DEST"
[ -f "build/$ZIP" ] || curl -sSfL "https://files.openscad.org/rc/$ZIP" -o "build/$ZIP"
echo "$SHA256  build/$ZIP" | shasum -a 256 -c -
unzip -o -q "build/$ZIP" -d "$DEST"
echo "OpenSCAD $VERSION (WebAssembly) in $DEST"
