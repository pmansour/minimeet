#!/bin/bash

PRIVATE_BUCKET_NAME="stg-minimeet-private"
PUBLIC_BUCKET_NAME="stg-minimeet-public"
EXTENSION_APP_ID="inlcnegncobjeadgjlacjhkgdmoikncb"

echo "Downloading signing key.."
SIGNING_KEY=$(gsutil cat "gs://$PRIVATE_BUCKET_NAME/minimeet.pem")

echo "Packaging extension.."
google-chrome --disable-gpu --pack-extension=src/ --pack-extension-key=<(echo "$SIGNING_KEY")

echo "Uploading latest files.."
gsutil cp updates.xml "gs://$PUBLIC_BUCKET_NAME/$EXTENSION_APP_ID/updates.xml"
gsutil cp src.crx "gs://$PUBLIC_BUCKET_NAME/$EXTENSION_APP_ID/latest.crx"

echo "Done."
