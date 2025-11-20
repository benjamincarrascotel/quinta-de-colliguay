#!/bin/sh
set -eu

resolve_domain() {
  if [ -n "${NGINX_SERVER_NAME:-}" ]; then
    echo "$NGINX_SERVER_NAME"
  elif [ -n "${SSL_DOMAIN:-}" ]; then
    echo "$SSL_DOMAIN"
  elif [ -n "${APP_URL:-}" ]; then
    echo "$APP_URL" | sed -E 's#https?://([^/]+)/?.*#\1#'
  else
    echo "localhost"
  fi
}

SERVER_DOMAIN="$(resolve_domain)"
export NGINX_SERVER_NAME="$SERVER_DOMAIN"
export NGINX_SSL_CERT="${NGINX_SSL_CERT:-/etc/letsencrypt/live/${SERVER_DOMAIN}/fullchain.pem}"
export NGINX_SSL_CERT_KEY="${NGINX_SSL_CERT_KEY:-/etc/letsencrypt/live/${SERVER_DOMAIN}/privkey.pem}"
export NGINX_SSL_TRUSTED_CERT="${NGINX_SSL_TRUSTED_CERT:-/etc/letsencrypt/live/${SERVER_DOMAIN}/chain.pem}"

TEMPLATE_PATH="${NGINX_TEMPLATE_PATH:-/etc/nginx/nginx.conf}"
RENDERED_PATH="${NGINX_RENDERED_PATH:-/tmp/nginx.conf}"

mkdir -p "$(dirname "$RENDERED_PATH")"

envsubst '$NGINX_SERVER_NAME $NGINX_SSL_CERT $NGINX_SSL_CERT_KEY $NGINX_SSL_TRUSTED_CERT' \
  < "$TEMPLATE_PATH" > "$RENDERED_PATH"

exec nginx -c "$RENDERED_PATH" -g "daemon off;"
