#!/bin/bash
which -s brew
if [[ $? != 0 ]] ; then
    # Install Homebrew
    arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
fi
if brew ls --versions jq > /dev/null; then
  echo "JQ package is installed. Moving on."
else
  echo "JQ package not installed. Would you like to install it? y/n"
  read RESPONSE
  if [ $RESPONSE == "y" ]
  then
  arch -x86_64 brew install jq
  fi
  exit
fi
PORT=$(jq '.port' package.json)
if [ "$PORT" == null ]
then
      echo "Could not find root port in /package.json. Make sure port is declared."
      exit
fi
DIRECTORYPORTPAIRS="--directory / --httpPort $PORT --watch true"
if [[ -f "serverless.yml" ]]
      then
            echo "Found root service /. Starting offline on port ${PORT}"
      else
            echo "No root service. Exiting."
            exit 1
fi

for i in controllers/*/
    do
      if [[ -f "$i/serverless.yml" ]]
      then
            SERVICE_PORT=$(jq '.port' "$i/package.json")
            if [ "$SERVICE_PORT" == null ]
            then
                  echo "Could not find port in ${i}package.json. Make sure port is declared."
                  exit
            else
                  echo "Found service $i. Starting offline on port ${SERVICE_PORT}"
                  DIRECTORYPORTPAIRS="${DIRECTORYPORTPAIRS} --directory $i --httpPort $SERVICE_PORT --watch true"
            fi
      fi
      done || exit 1

printf "\n%s\n" "Using command: ${DIRECTORYPORTPAIRS}"

npx serverless-offline-multi $DIRECTORYPORTPAIRS