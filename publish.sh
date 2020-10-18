#!/bin/bash

SIGNING_KEY=$(gsutil cat gs://stg-minimeet-private/minimeet.pem)
google-chrome --disable-gpu --pack-extension=src/ --pack-extension-key=<(echo "$SIGNING_KEY")

gsutil cp src.crx gs://stg-minimeet-public/inlcnegncobjeadgjlacjhkgdmoikncb/latest.crx
