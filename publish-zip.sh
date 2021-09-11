#!/bin/bash

PUBLIC_BUCKET_NAME="stg-minimeet-public"
EXTENSION_APP_ID="inlcnegncobjeadgjlacjhkgdmoikncb"

echo "Packaging extension.."
TMP_ZIP_FILE="$(mktemp -d)/latest.zip"
zip -r "$TMP_ZIP_FILE" src/

echo "Uploading latest files.."
gsutil cp "$TMP_ZIP_FILE" "gs://$PUBLIC_BUCKET_NAME/$EXTENSION_APP_ID/latest.zip"

echo "Done."
