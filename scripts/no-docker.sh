#!/bin/bash

# Get commandline parameters
ENV=${1:-dev}             # dev / prod
OPS=${2:-run}          # run / debug (only api) / test / build
SERVICE=${3:-api}         # api or web


if [ $ENV == 'help' ]; then
   echo 'usage: ${0} ENV(dev|prod) OPS(run|debug(api only)|test|build(web only)) SERVICE(api|web) '
   exit 0
fi


# START IMPORT
printf "Loading environment variables from\n"

set -o allexport

printf "\t.env-${ENV}\n"
source ./.env-${ENV}

set +o allexport
# END IMPORT

export ENV
if [ $ENV == 'dev' ]; then
   export NODE_ENV=development
else
   export NODE_ENV=production
fi
export DEPLOYMENT=no-docker
export API_HOST_SCHEME=localhost # Allows WebApp to derive correct API url

# Calculate and set specific values to run with docker-compose with mapped ports
export API_SERVER_PORT=`expr $PORT_RANGE_START + 60`                                   # Cannot be changed because docker-compose maps port 3000 to API-SERVER_PUBLIC_PORT
export API_DB_PORT=$DB_PORT

export WEBAPP_PORT=`expr $PORT_RANGE_START + 61`
export DB_HOST=localhost
export DB_PORT_SERVICE=`expr $PORT_RANGE_START + 21`
# UI env variables
export VUE_APP_API_URL=$API_SERVER_PROTOCOL://localhost:$API_SERVER_PORT/api

# ---------------------------------------------------------------------------------------------------
# up/down for dev environment
# ---------------------------------------------------------------------------------------------------

if [ $SERVICE == 'api' ]; then
   echo ------------------------------------------------------------------------------------------
   echo Starting imonet api for environment=${ENV} in no-docker mode

   cd ../api/
   if [ $OPS == 'run' ]; then
    echo api: $API_SERVER_PROTOCOL://localhost:$API_SERVER_PORT using
    echo db: localhost:$DB_PORT_SERVICE
    yarn start  
   fi
    
   if [ $OPS == 'debug' ]; then
    echo api: $API_SERVER_PROTOCOL://localhost:$API_SERVER_PORT using
    echo db: localhost:$DB_PORT_SERVICE
    yarn debug  
   fi

   if [ $OPS == 'test' ]; then
    echo run api tests
    yarn test  
   fi
   echo ------------------------------------------------------------------------------------------ 

 elif [ $SERVICE == 'web' ]; then
    cd ../ui-vuetify/
   if [ $OPS == 'run' ]; then
     yarn serve --port ${WEBAPP_PORT}
   fi
    
    if [ $OPS == 'build' ]; then
     rm -r dist
     yarn build
   fi

   if [ $OPS == 'test' ]; then
    yarn test  
   fi
   
   echo ------------------------------------------------------------------------------------------ 

 fi
