#!/bin/bash

# Get commandline parameters
ENV=${1:-dev}        # dev / prod
SERVICE_SET=${2:-db} # db or all

IMAGE_NAME="imonet"

# Assert SERVICE_SET is all or db
if [ $SERVICE_SET == 'all' ]; then
   SERVICES="db mongo mongo-express api web"
elif [ $SERVICE_SET == 'db' ]; then
   SERVICES="db adminer mongo mongo-express"
elif [ $SERVICE_SET == 'web-built' ]; then
   SERVICES="web-built"
elif [ $SERVICE_SET == 'build-web' ]; then
   SERVICES="build"
else
   echo SERVICE_SET ${SERVICE_SET} not defined
   echo 'usage: run-docker-services.sh ENV(dev|prod) OPS(up|down) SERVICE_SET(all|db|web-built)'
   exit 0
fi

echo "Stop and remove "
if [[ $SERVICES == *"api"* ]]; then
   docker stop ${IMAGE_NAME}-${ENV}_api_1
   docker rm ${IMAGE_NAME}-${ENV}_api_1
fi

if [[ $SERVICES == *"web"* ]]; then
   docker stop ${IMAGE_NAME}-${ENV}_web_1
   docker rm ${IMAGE_NAME}-${ENV}_web_1
fi

if [[ $SERVICES == *"build"* ]]; then
   docker stop ${IMAGE_NAME}-${ENV}_build_1
   docker rm ${IMAGE_NAME}-${ENV}_build_1
fi

if [[ $SERVICES == *"db"* ]]; then
   docker stop ${IMAGE_NAME}-${ENV}_db_1
   docker rm ${IMAGE_NAME}-${ENV}_db_1
fi

if [[ $SERVICES == *"adminer"* ]]; then
   docker stop ${IMAGE_NAME}-${ENV}_adminer_1
   docker rm ${IMAGE_NAME}-${ENV}_adminer_1
fi

if [[ $SERVICES == *"mongo"* ]]; then
   docker stop ${IMAGE_NAME}-${ENV}_mongo_1
   docker rm ${IMAGE_NAME}-${ENV}_mongo_1

   docker stop ${IMAGE_NAME}-${ENV}_mongo-express_1
   docker rm ${IMAGE_NAME}-${ENV}_mongo-express_1
fi
