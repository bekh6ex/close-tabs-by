#!/bin/bash

NAME="close-tabs-by"

VERSION=$(sed -nE 's/^.*"version"[[:space:]]*:[[:space:]]*"([^"]*).*$/\1/p' src/manifest.json)

mkdir -p dist
cd src
zip ../dist/${NAME}-v${VERSION}.xpi * popup/*
