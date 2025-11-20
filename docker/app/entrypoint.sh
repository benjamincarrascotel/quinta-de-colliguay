#!/usr/bin/env sh
set -e
cd /var/www/html

VENDOR_CACHE_DIR="/var/vendor-cache"
mkdir -p "$VENDOR_CACHE_DIR"
if [ ! -L vendor ] || [ "$(readlink vendor 2>/dev/null || true)" != "$VENDOR_CACHE_DIR" ]; then
  rm -rf vendor 2>/dev/null || true
  ln -s "$VENDOR_CACHE_DIR" vendor
fi

# Fix git ownership issue for safe directory
git config --global --add safe.directory /var/www/html 2>/dev/null || true

# Configure Xdebug based on APP_ENV
XDEBUG_INI="/usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini"
if [ -n "$APP_ENV" ] && [ "$APP_ENV" != "production" ]; then
  # Enable Xdebug for non-production environments
  if [ ! -f "$XDEBUG_INI" ]; then
    echo ">> Enabling Xdebug (APP_ENV=$APP_ENV)"
    docker-php-ext-enable xdebug
  else
    echo ">> Xdebug already enabled (APP_ENV=$APP_ENV)"
  fi
else
  # Disable Xdebug for production
  if [ -f "$XDEBUG_INI" ]; then
    echo ">> Disabling Xdebug (APP_ENV=$APP_ENV)"
    rm -f "$XDEBUG_INI"
  else
    echo ">> Xdebug already disabled (APP_ENV=$APP_ENV)"
  fi
fi

exec "$@"
