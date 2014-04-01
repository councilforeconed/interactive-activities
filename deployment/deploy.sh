#!/bin/bash -e

source ~/node_env.sh

BUILT_DIR=$PROJECT_DIR/out
LIVE_DIR=$PROJECT_DIR/out-live

cd $PROJECT_DIR

# Download the latest source code
git fetch origin
git checkout origin/master

# Download the latest dependencies (and ensure that bower does not run in
# "interactive" mode)
CI=true npm install

# Build the project
grunt build

# Kill the active server (this command may fail if the server has just been
# rebooted)
forever stop $LIVE_DIR || true

# Swap in the latest build
rm -rf $LIVE_DIR
cp -r $BUILT_DIR $LIVE_DIR

# Re-start the server
cd $LIVE_DIR
NODE_ENV=production authbind --deep forever start $LIVE_DIR --port 80
