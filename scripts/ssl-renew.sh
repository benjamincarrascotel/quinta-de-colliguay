#!/bin/bash
set -Eeuo pipefail

log() {
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$timestamp] $*"
}

trap 'log "❌ SSL renewal script aborted unexpectedly."' ERR

log "🔄 Checking Let’s Encrypt certificates..."

certbot_flags=()
if [ "${CERTBOT_USE_STAGING:-0}" = "1" ]; then
    log "🔧 Using Let's Encrypt staging environment for renewal"
    certbot_flags+=(--staging)
fi

if docker compose run --rm certbot renew "${certbot_flags[@]}"; then
    log "✅ Certbot finished (certificates renewed if expiring soon)"
    log "📋 Restarting nginx to apply any changes..."
    docker compose restart nginx
    log "🎉 SSL renewal cycle completed!"
else
    log "⚠️  Certbot reported an issue (certificates may not need renewal yet)"
fi
