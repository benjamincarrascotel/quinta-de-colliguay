#!/bin/bash
# Local deployment logic - for developers
# Features: No nginx, Vite HMR, auto-seed, uses existing .env

deploy_local() {
    info "🏡 Local deployment for developers"

    # Use existing .env file (no copy)
    if [ ! -f ".env" ]; then
        info "📝 Creating .env from .env.example"
        cp ".env.example" .env

        # Fix permissions on Mac/Linux to allow Docker to write
        if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
            chmod 666 .env
            info "✅ Fixed .env permissions for Docker"
        fi
    fi

    info "📝 Using existing .env file for local environment"

    # Show git info
    show_git_info

    # Ensure base image exists
    ensure_base_image

    # Stop existing containers
    stop_containers

    # Start database first
    start_database_only

    # Install dependencies before booting app
    install_composer_deps

    # Start application (db already running)
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

    # Recreate all migrations
    db_migrate_fresh

    # Seed database (always for local)
    seed_database

    # Start Vite only (no nginx for local development)
    start_vite

    # Sync dependencies to host for VS Code IntelliSense
    sync_dependencies

    # Show status
    show_status

    info "🎉 Local deployment complete!"
    echo "📊 App: http://localhost:8000"
    echo "🎨 Vite: http://localhost:5173"
}
