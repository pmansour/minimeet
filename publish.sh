#!/bin/bash

PRIVATE_BUCKET_NAME="stg-minimeet-private"
PUBLIC_BUCKET_NAME="stg-minimeet-public"
EXTENSION_APP_ID="inlcnegncobjeadgjlacjhkgdmoikncb"

CHROME_BIN="google-chrome" # For linux
# CHROME_BIN="/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" # For WSL

echo "Downloading signing key.."
SIGNING_KEY=$(gsutil cat "gs://$PRIVATE_BUCKET_NAME/minimeet.pem")

echo "Packaging extension.."
"$CHROME_BIN" --disable-gpu --pack-extension=src/ --pack-extension-key=<(echo "$SIGNING_KEY")

echo "Uploading latest files.."
gsutil cp updates.xml "gs://$PUBLIC_BUCKET_NAME/$EXTENSION_APP_ID/updates.xml"
gsutil cp src.crx "gs://$PUBLIC_BUCKET_NAME/$EXTENSION_APP_ID/latest.crx"

echo "Done."
