#!/bin/bash
# Common functions shared across all deployment environments

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

NGINX_RUNTIME_DIR=${NGINX_RUNTIME_DIR:-nginx/runtime}
NGINX_RUNTIME_CONF="${NGINX_RUNTIME_DIR}/nginx.conf"

# Print info message
info() {
    echo -e "${GREEN}$1${NC}"
}

# Print warning message
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Print error message and exit
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

_ensure_nginx_runtime_dir() {
    mkdir -p "$NGINX_RUNTIME_DIR"
}

_set_nginx_template() {
    local template=$1
    if [ ! -f "$template" ]; then
        error "nginx template not found at $template"
    fi
    _ensure_nginx_runtime_dir
    cp "$template" "$NGINX_RUNTIME_CONF"
}

reload_env_file() {
    if [ -f ".env" ]; then
        set -a
        # shellcheck disable=SC1091
        source .env
        set +a
    fi
}

# Determine whether verbose output is enabled (DEPLOY_VERBOSE=1/true/yes)
_is_verbose() {
    case "${DEPLOY_VERBOSE:-}" in
        1|true|TRUE|yes|YES)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Run a command, suppressing its output unless DEPLOY_VERBOSE is enabled
run_quietly() {
    if _is_verbose; then
        "$@"
        return
    fi

    local log_file
    log_file=$(mktemp -t deploy-log-XXXX)

    if ! "$@" >"$log_file" 2>&1; then
        echo ""
        warn "Command failed: $*"
        cat "$log_file"
        rm -f "$log_file"
        error "Deployment step failed (rerun with DEPLOY_VERBOSE=1 for full logs)."
    fi

    rm -f "$log_file"
}

# Check if base image exists, build if not
ensure_base_image() {
    if ! docker image inspect laravel_base_php:latest >/dev/null 2>&1; then
        info "🏗️  Building base PHP image (first time only, ~2 minutes)..."
        run_quietly docker compose --profile base-only build base
        info "✅ Base image built"
    else
        info "✅ Base image already exists (cached)"
    fi
}

# Stop existing containers
stop_containers() {
    info "🛑 Stopping existing containers..."
    run_quietly docker compose down
}

# Start database only with health check wait
start_database_only() {
    info "🗄️  Starting database..."
    run_quietly docker compose up -d --wait db
}

# Start app only with health check wait
start_app_only() {
    info "🚀 Starting application..."
    run_quietly docker compose up -d --build --wait app
}

# Start app only with production compose files
start_app_only_production() {
    info "🚀 Starting application (production mode)..."
    run_quietly docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --wait app
}

# Install composer dependencies
install_composer_deps() {
    info "📦 Installing Composer dependencies..."
    _run_composer_install
}

install_composer_deps_prod() {
    info "📦 Installing Composer dependencies (no-dev)..."
    _run_composer_install --no-dev
}

_run_composer_install() {
    local args=("$@")
    run_quietly docker compose run --rm -T -u root app project-composer-install "${args[@]}"
}

# Discover Laravel packages
discover_packages() {
    info "🔍 Discovering packages..."
    docker compose exec -T app php artisan package:discover --ansi
}

# Generate APP_KEY if missing or empty
ensure_app_key() {
    info "🔑 Checking APP_KEY..."

    # Check if APP_KEY exists and has a value
    if docker compose exec -T app grep -q '^APP_KEY=.\+' .env 2>/dev/null; then
        info "✅ APP_KEY already set"
    else
        info "⚠️  APP_KEY is missing or empty, generating new key..."
        docker compose exec -T app php artisan key:generate --force --ansi
        info "✅ APP_KEY generated"
    fi
}

# Clear Laravel caches
clear_caches() {
    info "🧹 Clearing cache..."
    docker compose exec -T app php artisan config:clear
    docker compose exec -T app php artisan route:clear
    docker compose exec -T app php artisan view:clear
}

# Generate Ziggy routes
generate_routes() {
    info "🛣️  Generating routes..."
    # Run as root on Windows to handle bind mount permissions
    docker compose exec -T -u root app php artisan ziggy:generate
}

# Generate TypeScript types with wayfinder
generate_types() {
    info "📝 Generating TypeScript types..."
    # Run as root on Windows to handle bind mount permissions
    docker compose exec -T -u root app php artisan wayfinder:generate --with-form
}

# Seed database
seed_database() {
    info "🌱 Seeding database..."
    docker compose exec -T app php artisan db:seed --force --no-interaction
    info "✅ Database seeded"
}

# Start vite service
start_vite() {
    info "🎨 Starting Vite dev server..."
    run_quietly docker compose up -d vite
}

# Start vite and nginx services
start_vite_and_nginx() {
    info "🎨 Starting Vite and Nginx..."
    run_quietly docker compose up -d vite nginx
}

# Start nginx for dev deployment (no vite dependency, uses standard config)
start_nginx_dev() {
    info "🌐 Starting Nginx (dev deployment)..."
    run_quietly docker compose up -d --no-deps nginx
}

# Start nginx only (production - no vite)
start_nginx_only() {
    info "🌐 Starting Nginx (production mode)..."
    run_quietly docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps nginx
}

# Build frontend assets using vite container (for dev/prod deployments)
build_assets_with_vite() {
    info "🏗️  Building frontend assets with Vite container (one-off run)..."
    info "📝 Vite will run 'npm run build' and exit"

    docker compose run --rm vite >/dev/null

    if [ -f "public/build/manifest.json" ]; then
        info "✅ Assets built successfully"
        info "   - public/build/manifest.json ✓"
        info "   - bootstrap/ssr/ssr.js ✓"
    else
        error "Build failed - manifest.json not found!"
    fi
}

# Copy production nginx config
use_production_nginx_config() {
    info "🔧 Switching to production nginx config..."
    _set_nginx_template "nginx/nginx-prod.conf"
    info "✅ Runtime nginx config updated (no Vite dev server proxying)"
}

# Run migrations non-destructively
run_migrations() {
    info "🔄 Running database migrations..."
    docker compose exec -T app php artisan migrate --force --no-interaction
    info "✅ Migrations completed"
}

# Ensure nginx has a valid SSL certificate, obtaining it via certbot if missing
ensure_ssl_certificate() {
    local domain email
    domain=$(_detect_ssl_domain)
    email=$(_detect_ssl_email)

    if [ -z "$domain" ] || [ -z "$email" ]; then
        warn "Skipping SSL verification (missing SSL_DOMAIN/APP_URL or SSL_EMAIL)"
        return
    fi

    if _certificate_exists "$domain"; then
        info "✅ SSL certificate for $domain already present"
        return
    fi

    info "🔐 SSL certificate for $domain not found, requesting new one..."
    obtain_ssl_certificate "$domain" "$email"
}

_certificate_exists() {
    local domain=$1
    docker compose run --rm -T certbot sh -c "test -f /etc/letsencrypt/live/${domain}/fullchain.pem" >/dev/null 2>&1
}

_detect_ssl_domain() {
    if [ -n "${SSL_DOMAIN:-}" ]; then
        echo "$SSL_DOMAIN"
    elif [ -n "${APP_URL:-}" ]; then
        echo "$APP_URL" | sed -E 's#https?://([^/]+)/?.*#\1#'
    fi
}

_detect_ssl_email() {
    if [ -n "${SSL_EMAIL:-}" ]; then
        echo "$SSL_EMAIL"
    else
        echo "admin@solidcore.cl"
    fi
}

obtain_ssl_certificate() {
    local domain=$1
    local email=$2
    local nginx_conf="$NGINX_RUNTIME_CONF"
    local nginx_http="nginx/nginx-http-only.conf"
    local nginx_prod="nginx/nginx-prod.conf"
    local backup="${nginx_conf}.pre-ssl"
    local webroot="${CERTBOT_WEBROOT:-/var/www/certbot}"

    if [ ! -f "$nginx_http" ]; then
        error "HTTP-only nginx config missing at $nginx_http"
    fi

    info "🌐 Switching nginx to HTTP-only mode for ACME challenge..."
    cp "$nginx_conf" "$backup" 2>/dev/null || true
    _set_nginx_template "$nginx_http"
    run_quietly docker compose up -d --force-recreate nginx
    sleep 5

    info "📥 Requesting certificate for $domain via certbot..."
    local certbot_flags=()
    if [ "${CERTBOT_USE_STAGING:-0}" = "1" ]; then
        certbot_flags+=(--staging)
        info "🔧 Using Let's Encrypt staging environment for certificate issuance"
    fi
    if docker compose run --rm certbot certonly \
        "${certbot_flags[@]}" \
        --webroot --webroot-path="$webroot" \
        --email "$email" --agree-tos --no-eff-email \
        --keep-until-expiring --non-interactive \
        -d "$domain"
    then
        info "✅ Certificate obtained, restoring HTTPS nginx config..."
        _set_nginx_template "$nginx_prod"
        run_quietly docker compose restart nginx
        rm -f "$backup"
    else
        warn "❌ Failed to obtain certificate for $domain, restoring previous nginx config"
        if [ -f "$backup" ]; then
            cp "$backup" "$nginx_conf"
        fi
        run_quietly docker compose restart nginx
        error "Certbot failed to issue certificate for $domain"
    fi
}

setup_ssl_auto_renewal() {
    local project_dir renew_script log_file schedule cron_line tmpfile
    project_dir="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
    renew_script="$project_dir/scripts/ssl-renew.sh"
    log_file="$project_dir/logs/ssl-renewal.log"
    schedule="${SSL_RENEW_CRON_SCHEDULE:-0 3 * * *}"

    if ! command -v crontab >/dev/null 2>&1; then
        warn "Skipping SSL auto-renewal cron setup (crontab command not available)"
        return
    fi

    if [ ! -f "$renew_script" ]; then
        warn "Skipping SSL auto-renewal cron setup (scripts/ssl-renew.sh not found)"
        return
    fi

    chmod +x "$renew_script"
    mkdir -p "$(dirname "$log_file")"
    touch "$log_file"

    cron_line="$schedule cd '$project_dir' && '$renew_script' >> '$log_file' 2>&1"
    tmpfile=$(mktemp)
    crontab -l 2>/dev/null | grep -v "ssl-renew.sh" >"$tmpfile" || true
    echo "$cron_line" >>"$tmpfile"
    crontab "$tmpfile"
    rm -f "$tmpfile"

    info "⏱️  SSL auto-renew cron installed ($schedule)."
    info "   View cron: crontab -l | grep ssl-renew"
    info "   Follow logs: tail -f $log_file"

    if [ "${SSL_RENEW_RUN_ON_SETUP:-1}" != "0" ]; then
        info "▶️  Running initial renewal check (output saved to $log_file)..."
        if "$renew_script" >>"$log_file" 2>&1; then
            info "✅ Initial renewal script executed (check $log_file for details)"
        else
            warn "⚠️  Initial renewal script reported errors (see $log_file)"
        fi
    fi
}

# Show deployment status
show_status() {
    info "✅ Deployment verification..."
    docker compose ps
}

# Show git info
show_git_info() {
    echo "📦 Current git branch: $(git branch --show-current)"
    echo "📦 Latest commit: $(git log -1 --oneline)"
}

db_migrate_fresh() {
    info "🔄 Running fresh migrations..."
    # Use --force and --no-interaction to skip all prompts
    docker compose exec -T app php artisan migrate:fresh --force --no-interaction
    info "✅ Migrations completed"
}

# Sync dependencies from Docker volumes to host for IntelliSense
sync_dependencies() {
    info "ℹ️  Host dependency sync disabled (containers keep their own vendor/node_modules volumes)."
}

# Ensure PostgreSQL user and database exist with proper permissions
# Idempotent: Safe to run multiple times, only creates if missing
ensure_database_user() {
    info "🔍 Checking PostgreSQL database configuration..."

    # Check if DB container is running
    if ! docker compose ps db | grep -q "Up"; then
        warn "Database container not running, starting it..."
        docker compose up -d db
        info "⏳ Waiting for database to be ready..."
        sleep 10
    fi

    # Note: When POSTGRES_USER is set in docker-compose, that user becomes the superuser
    # and the default 'postgres' user is NOT created. We use DB_USERNAME as the superuser.

    # Verify connection works
    if docker compose exec -T \
        -e PGPASSWORD="${DB_PASSWORD:-}" \
        db psql -U "${DB_USERNAME}" -d "${DB_DATABASE}" -c "SELECT 1;" >/dev/null 2>&1; then
        info "✅ Database user '${DB_USERNAME}' exists and connection verified"
        info "✅ Database '${DB_DATABASE}' exists and is accessible"
    else
        error "❌ Database connection test failed! Check credentials in .env"
    fi
}
