WORKING_DIR="$(realpath "$(dirname "$0")")"

mkdir -p "$WORKING_DIR/bin" >/dev/null

echo "Publishing mv3 extension.."
pushd "$WORKING_DIR/mv3" >/dev/null && zip -r "$WORKING_DIR/bin/mv3.zip" >/dev/null ./ && popd >/dev/null
gh release upload stable "$WORKING_DIR/bin/mv3.zip" --clobber

echo "Done."
