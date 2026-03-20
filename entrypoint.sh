#!/bin/sh
set -e

echo "[INIT] Injecting Theme Loader"

rm -rf /data/gogs/templates/inject/* /data/gogs/public/themes/*

##########################################################
# Recreate structure
##########################################################

mkdir -p /data/gogs/templates/inject
mkdir -p /data/gogs/public/themes
cp -r ./themes/* /data/gogs/public/themes/

##########################################################
# Inject Loader
##########################################################

INJECT_FILE="/data/gogs/templates/inject/head.tmpl"
echo "<script src=\"/themes/theme_loader.js?v=1\"></script>" >> "$INJECT_FILE"

##########################################################
# Fix permissions
##########################################################

echo "[INIT] Fixing permissions..."
chown -R git:git /data

##########################################################
# Start Gogs
##########################################################
exec /app/gogs/docker/start.sh