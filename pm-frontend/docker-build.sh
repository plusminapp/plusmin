#!/usr/bin/env bash

echo pm-frontend version: ${VERSION}
echo platform: ${PLATFORM}

pushd ${PROJECT_FOLDER}/pm-frontend

docker build \
     --platform=$PLATFORM \
     -t rimvanvliet/pm-frontend:${VERSION} .

popd