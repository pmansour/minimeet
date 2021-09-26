WORKING_DIR="$(realpath "$(dirname "$0")")"

echo "Publishing mv3 extension.."
pushd "$WORKING_DIR/mv3" >/dev/null && zip -r "$WORKING_DIR/bin/mv3.zip" >/dev/null ./ && popd >/dev/null
gh release upload stable "$WORKING_DIR/bin/mv3.zip" --clobber

echo "Publishing mv2 extension.."
pushd "$WORKING_DIR/mv2" >/dev/null && zip -r "$WORKING_DIR/bin/mv2.zip" >/dev/null ./ && popd >/dev/null
gh release upload stable "$WORKING_DIR/bin/mv2.zip" --clobber

echo "Done."
