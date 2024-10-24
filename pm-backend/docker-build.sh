#!/usr/bin/env bash

echo pm-backend version: ${VERSION}

pushd ${PROJECT_FOLDER}/pm-backend

if mvn clean package; then
  docker build \
    --build-arg PLATFORM=${PLATFORM}  \
    --build-arg JAR_FILE=./target/pm-backend-${VERSION}.jar \
    -t rimvanvliet/pm-backend:${VERSION} .
else
  echo mvn clean package FAILED!!!
fi

popd