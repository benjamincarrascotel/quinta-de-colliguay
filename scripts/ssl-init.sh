#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

extract_domain() {
    if [ -n "${SSL_DOMAIN:-}" ]; then
        echo "$SSL_DOMAIN"
    elif [ -n "${APP_URL:-}" ]; then
        echo "$APP_URL" | sed -E 's#https?://([^/]+)/?.*#\1#'
    fi
}

DOMAIN="$(extract_domain)"
if [ -z "$DOMAIN" ]; then
    echo "❌ SSL_DOMAIN or APP_URL must be set in .env before running this script."
    exit 1
fi

EMAIL="${SSL_EMAIL:-admin@solidcore.cl}"
NGINX_DIR="nginx"
NGINX_RUNTIME_DIR="$NGINX_DIR/runtime"
NGINX_CONF="$NGINX_RUNTIME_DIR/nginx.conf"
NGINX_HTTP_ONLY="$NGINX_DIR/nginx-http-only.conf"
NGINX_PROD="$NGINX_DIR/nginx-prod.conf"

mkdir -p "$NGINX_RUNTIME_DIR"

echo "🔐 SSL Certificate Setup for $DOMAIN"
echo "======================================"
echo ""
echo "⚠️  IMPORTANT: Before running this script:"
echo "   1. Ensure the DNS for domain $DOMAIN points to this machine"
echo "   2. Ports 80 and 443 must be open in the firewall"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "📋 Step 1: Backing up current nginx config and switching to HTTP-only mode..."

# Check if current config is already HTTP-only (avoid backing up the wrong config)
CURRENT_IS_HTTP_ONLY=false
if [ -f "$NGINX_CONF" ] && [ -f "$NGINX_HTTP_ONLY" ]; then
    if cmp -s "$NGINX_CONF" "$NGINX_HTTP_ONLY"; then
        CURRENT_IS_HTTP_ONLY=true
        echo "ℹ️  Current config is already HTTP-only, skipping backup"
    fi
fi

# Backup current config only if it's not HTTP-only
if [ -f "$NGINX_CONF" ] && [ "$CURRENT_IS_HTTP_ONLY" = false ]; then
    cp "$NGINX_CONF" "$NGINX_DIR/nginx.conf.backup"
    echo "✅ Backed up current config to nginx.conf.backup"
fi

# Copy HTTP-only config if not already set
if [ "$CURRENT_IS_HTTP_ONLY" = false ]; then
    if [ ! -f "$NGINX_HTTP_ONLY" ]; then
        echo "❌ Error: $NGINX_HTTP_ONLY not found!"
        exit 1
    fi
    cp "$NGINX_HTTP_ONLY" "$NGINX_CONF"
    echo "✅ Switched to HTTP-only configuration"
else
    echo "✅ Already using HTTP-only configuration"
fi

echo ""
echo "📋 Step 2: Stopping nginx and restarting with HTTP-only config..."
docker compose stop nginx
docker compose up -d nginx
echo "⏳ Waiting 5 seconds for nginx to start..."
sleep 5

echo ""
echo "📋 Step 3: Checking if domain responds..."
if ! curl -I http://$DOMAIN 2>/dev/null | head -n 1 | grep -q "HTTP"; then
    echo "❌ Domain $DOMAIN is not responding"
    echo "   Verify:"
    echo "   - DNS points to this machine"
    echo "   - Nginx is running"
    echo "   - Port 80 is open"
    exit 1
fi
echo "✅ Domain responds correctly"

echo ""
echo "📋 Step 4: Obtaining SSL certificate with certbot..."
echo "   This may take a few minutes..."
docker compose run --rm certbot certonly \
    ${CERTBOT_USE_STAGING:+--staging} \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --keep-until-expiring \
    --non-interactive \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificate obtained successfully!"
    echo ""
    echo "📋 Step 5: Switching back to production nginx config with SSL..."

    # Copy production config with HTTPS
    if [ ! -f "$NGINX_PROD" ]; then
        echo "❌ Error: $NGINX_PROD not found!"
        exit 1
    fi
    cp "$NGINX_PROD" "$NGINX_CONF"
    echo "✅ Switched to production configuration with SSL"

    echo ""
    echo "📋 Step 6: Restarting nginx with SSL..."
    docker compose restart nginx
    echo ""
    echo "🎉 Setup completed!"
    echo ""
    echo "📊 Verify everything works:"
    echo "   https://$DOMAIN"
    echo ""
    echo "📝 Important notes:"
    echo "   - Certificate will auto-renew every 60 days"
    echo "   - To renew manually: docker compose run --rm certbot renew"
    echo "   - Certificates are stored in 'letsencrypt' volume"
    echo "   - Nginx config backup saved as: nginx.conf.backup"
else
    echo ""
    echo "❌ Error obtaining certificate"
    echo "   Check the logs above for more details"
    echo ""
    echo "⚠️  Restoring original nginx config..."
    if [ -f "$NGINX_DIR/nginx.conf.backup" ]; then
        cp "$NGINX_DIR/nginx.conf.backup" "$NGINX_CONF"
        docker compose restart nginx
        echo "✅ Original config restored"
    fi
    exit 1
fi
