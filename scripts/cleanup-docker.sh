#!/bin/bash

# cleanup-docker.sh - Clean up all Docker resources for this project
# Usage: ./cleanup-docker.sh [--force]

set -e

PROJECT_NAME="infor_backend"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧹 Docker Cleanup Script for $PROJECT_NAME"
echo "================================================"

# Check if force flag is provided
FORCE_MODE=false
if [[ "$1" == "--force" ]]; then
    FORCE_MODE=true
    echo "⚠️  FORCE MODE: Will skip confirmations"
fi

# Function to ask for confirmation
confirm() {
    if [[ "$FORCE_MODE" == "true" ]]; then
        return 0
    fi

    while true; do
        read -p "$1 (y/N): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* | "" ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Navigate to project directory
cd "$SCRIPT_DIR"

echo "📍 Working in directory: $(pwd)"

# 1. Stop and remove containers
echo ""
echo "🛑 Step 1: Stopping and removing containers..."
if confirm "Stop and remove project containers?"; then
    echo "   Stopping containers..."
    docker compose down -v --remove-orphans 2>/dev/null || true

    echo "   Removing any leftover containers..."
    docker stop laravel_app vite_dev postgres_db laravel_base_build 2>/dev/null || true
    docker rm laravel_app vite_dev postgres_db laravel_base_build 2>/dev/null || true

    echo "   ✅ Containers cleaned"
else
    echo "   ⏭️  Skipped container cleanup"
fi

# 2. Remove project images
echo ""
echo "🖼️  Step 2: Removing project images..."
if confirm "Remove project Docker images?"; then
    echo "   Listing project images..."
    IMAGES=$(docker images --filter="reference=laravel*" --filter="reference=${PROJECT_NAME}*" --filter="reference=solid_base_template*" -q 2>/dev/null || true)

    if [[ -n "$IMAGES" ]]; then
        echo "   Removing images: $IMAGES"
        docker rmi -f $IMAGES 2>/dev/null || true
        echo "   ✅ Project images removed"
    else
        echo "   ✅ No project images found"
    fi
else
    echo "   ⏭️  Skipped image cleanup"
fi

# 3. Remove project volumes
echo ""
echo "💾 Step 3: Removing project volumes..."
if confirm "Remove project Docker volumes? (This will delete database data)"; then
    echo "   Listing project volumes..."
    VOLUMES=$(docker volume ls --filter="name=${PROJECT_NAME}" -q 2>/dev/null || true)

    if [[ -n "$VOLUMES" ]]; then
        echo "   Removing volumes: $VOLUMES"
        docker volume rm $VOLUMES 2>/dev/null || true
        echo "   ✅ Project volumes removed"
    else
        echo "   ✅ No project volumes found"
    fi
else
    echo "   ⏭️  Skipped volume cleanup"
fi

# 4. Remove project networks
echo ""
echo "🌐 Step 4: Removing project networks..."
if confirm "Remove project Docker networks?"; then
    echo "   Listing project networks..."
    NETWORKS=$(docker network ls --filter="name=${PROJECT_NAME}" -q 2>/dev/null || true)

    if [[ -n "$NETWORKS" ]]; then
        echo "   Removing networks: $NETWORKS"
        docker network rm $NETWORKS 2>/dev/null || true
        echo "   ✅ Project networks removed"
    else
        echo "   ✅ No project networks found"
    fi
else
    echo "   ⏭️  Skipped network cleanup"
fi

# 5. System cleanup (optional)
echo ""
echo "🗑️  Step 5: System cleanup..."
if confirm "Run Docker system cleanup? (Removes unused images, build cache, etc.)"; then
    echo "   Running system prune..."
    docker system prune -f
    echo "   ✅ System cleanup completed"
else
    echo "   ⏭️  Skipped system cleanup"
fi

# 6. Build cache cleanup (optional)
echo ""
echo "🏗️  Step 6: Build cache cleanup..."
if confirm "Remove Docker build cache? (Frees up space but slows next builds)"; then
    echo "   Removing build cache..."
    docker builder prune -af 2>/dev/null || true
    echo "   ✅ Build cache removed"
else
    echo "   ⏭️  Skipped build cache cleanup"
fi

echo ""
echo "🎉 Cleanup completed!"
echo ""
echo "📊 Summary:"
echo "   - Containers: Stopped and removed"
echo "   - Images: Cleaned based on your selections"
echo "   - Volumes: Cleaned based on your selections"
echo "   - Networks: Cleaned based on your selections"
echo ""
echo "💡 To rebuild everything fresh:"
echo "   ./deploy.sh dev"
echo ""
echo "🚀 Or use optimized build:"
if command -v make >/dev/null 2>&1; then
    echo "   make fresh-optimized"
else
    echo "   docker compose --profile base-only build base"
    echo "   docker compose build app"
    echo "   docker compose up -d --wait"
fi