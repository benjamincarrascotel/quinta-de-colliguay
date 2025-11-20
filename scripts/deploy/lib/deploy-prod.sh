#!/bin/bash
# Production deployment logic - for production server
# Features: With nginx, SSL, NO auto-seed, NO vite, uses .env.prod

deploy_prod() {
    info "🚀 PRODUCTION DEPLOYMENT"

    # Copy environment-specific .env file
    if [ -f ".env" ]; then
        info "📝 Using .env"
    else
        error "Environment file .env not found!"
    fi
    reload_env_file

    # Pre-deployment safety checks
    info "🔍 Running pre-deployment checks..."

    # Check if .env has required production settings
    if grep -q "APP_DEBUG=true" .env; then
        error "APP_DEBUG is enabled in production! Set APP_DEBUG=false"
    fi

    if grep -q "APP_ENV=local" .env; then
        error "APP_ENV is set to local! Set APP_ENV=production"
    fi

    # Show git info
    show_git_info

    # Ensure base image exists
    ensure_base_image

    # TODO: Backup database before deployment
    # This will be implemented in future tickets
    warn "⚠️  Database backup not yet implemented (see .tickets)"

    # Stop existing containers
    stop_containers

    # Start database first
    start_database_only

    # Ensure database user and permissions are configured
    ensure_database_user

    # Install dependencies (production mode) before app boot
    install_composer_deps_prod

    # Now start app with production mode
    start_app_only_production

    # Discover packages
    discover_packages

    # Ensure APP_KEY is set
    ensure_app_key

    # Run migrations non-interactively
    run_migrations

    # Clear caches
    clear_caches

    # Generate routes
    generate_routes

    # Generate TypeScript types
    generate_types

    # Build frontend assets using vite container
    build_assets_with_vite

    # Ensure SSL certificate exists before enabling HTTPS config
    ensure_ssl_certificate

    # Switch to production nginx config (no Vite dev server)
    use_production_nginx_config

    # Cache configurations for performance
    info "⚡ Caching configurations..."
    docker compose exec -T app php artisan config:cache
    docker compose exec -T app php artisan route:cache
    docker compose exec -T app php artisan view:cache

    # NO DATABASE SEEDING IN PRODUCTION!
    warn "⚠️  Skipping database seeding (production safety)"

    # Start Nginx only (no Vite in production)
    start_nginx_only

    # Configure automatic SSL renewals
    setup_ssl_auto_renewal

    # Show status
    info "✅ Deployment verification..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

    info "🎉 Production deployment complete!"
    warn "⚠️  Remember to:"
    echo "   - Verify the application is working correctly"
    echo "   - Check logs for any errors"
    echo "   - Monitor performance"
}
