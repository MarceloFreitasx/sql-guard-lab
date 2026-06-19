#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="${1:-dist/client}"

if [[ ! -d "$OUTPUT_DIR" ]]; then
  echo "Output directory not found: $OUTPUT_DIR" >&2
  exit 1
fi

touch "$OUTPUT_DIR/.nojekyll"

if [[ -f "$OUTPUT_DIR/_shell.html" ]]; then
  cp "$OUTPUT_DIR/_shell.html" "$OUTPUT_DIR/404.html"
elif [[ -f "$OUTPUT_DIR/index.html" ]]; then
  cp "$OUTPUT_DIR/index.html" "$OUTPUT_DIR/404.html"
else
  echo "No shell or index HTML found in $OUTPUT_DIR" >&2
  exit 1
fi

echo "GitHub Pages artifacts prepared in $OUTPUT_DIR"
