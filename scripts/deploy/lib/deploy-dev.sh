#!/bin/bash
# Dev deployment logic - for development server
# Features: With nginx, SSL, auto-seed, uses .env.dev

deploy_dev() {
    info "🛠️  Development server deployment"

    # Copy environment-specific .env file
    if [ -f ".env" ]; then
        info "📝 Using .env"
    else
        cp ".env.prod.example" .env
        chmod 666 .env
        info "Using .env.prod.example"
        
    fi
    reload_env_file

    # Show git info
    show_git_info

    # Ensure base image exists
    ensure_base_image

    # Stop existing containers
    stop_containers

    # Start database first
    start_database_only

    # Ensure database user and permissions are configured
    ensure_database_user

    # Install dependencies before starting the app container
    install_composer_deps_prod

    # Now start app
    start_app_only

    # Discover packages
    discover_packages

    # Ensure APP_KEY is set
    ensure_app_key

    # Clear caches
    clear_caches

    # Generate routes
    generate_routes

    # Generate TypeScript types
    generate_types

    # Run migrations (non-destructive)
    run_migrations

    # Seed database (for dev environment)
    seed_database

    # Build frontend assets (DEV uses built assets, not dev server)
    build_assets_with_vite

    # Ensure SSL certificate exists before enabling HTTPS config
    ensure_ssl_certificate

    # Switch to production nginx config (no Vite dev server)
    use_production_nginx_config

    # Start Nginx only (assets are pre-built)
    start_nginx_dev

    # Configure automatic SSL renewals
    setup_ssl_auto_renewal

    # Show status
    show_status

    local nginx_domain=$(_detect_ssl_domain)
    if [ -z "$nginx_domain" ]; then
        nginx_domain="your-domain"
    fi

    info "🎉 Dev deployment complete!"
    echo "📊 App: http://localhost:8000"
    echo "🌐 Nginx: https://$nginx_domain"
    echo "📦 Assets: Pre-built (public/build/)"
}
