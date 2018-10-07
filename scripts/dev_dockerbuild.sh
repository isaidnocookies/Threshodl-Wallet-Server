#!/bin/bash

docker build -t wallet-docker-dev .
docker run -d -p 8080:3333 --name wallet-server  wallet-docker-dev
