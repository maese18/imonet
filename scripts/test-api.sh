#!/bin/bash

export ENV=test
export NODE_ENV=test

# START IMPORT
printf "Loading environment variables from\n"

set -o allexport

printf "\t.env-${ENV}\n"
source ./.env-${ENV}

set +o allexport
# END IMPORT

export DEPLOYMENT=run-docker-services
export API_HOST_SCHEME=localhost # Allows WebApp to derive correct API url

# Calculate and set specific values to run with docker-compose with mapped ports
export API_SERVER_PORT=3000                                   # Cannot be changed because docker-compose maps port 3000 to API-SERVER_PUBLIC_PORT
export API_SERVER_PUBLIC_PORT=`expr $PORT_RANGE_START + 60`   # Each customer has a specific port range
export API_DB_PORT=$DB_PORT

export WEBAPP_PORT=`expr $PORT_RANGE_START + 20`
export DB_PORT=`expr $PORT_RANGE_START + 21`
export DB_ADMIN_PORT=`expr $PORT_RANGE_START + 22`
export DB_PORT_SERVICE=`3306`
# UI env variables

cd api
yarn test