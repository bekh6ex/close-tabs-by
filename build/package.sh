#!/bin/bash

NAME="close-tabs-by"

VERSION=$(sed -nr 's/^.*"version".*([0-9]+\.[0-9]+\.[0-9]).*$/\1/p' manifest.json)

zip ../${NAME}-v${VERSION}.xpi * popup/*
