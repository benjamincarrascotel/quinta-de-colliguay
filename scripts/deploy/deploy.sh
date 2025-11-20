#!/bin/bash
# Main deployment orchestrator
# Usage: ./deploy.sh [local|dev|prod]

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env file
if [ -f .env ]; then
    set -a  # automatically export all variables
    source .env
    set +a
fi

# Default to local if no environment specified
ENVIRONMENT=${1:-local}

# Validate environment
case $ENVIRONMENT in
    local|dev|prod)
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Usage: $0 [local|dev|prod]"
        echo ""
        echo "Environments:"
        echo "  local - For local development (no nginx, vite HMR)"
        echo "  dev   - For development server (with nginx, SSL)"
        echo "  prod  - For production server (safety checks, no seeding)"
        exit 1
        ;;
esac

# Source common functions
source "$SCRIPT_DIR/lib/common.sh"

# Source environment-specific deployment logic
source "$SCRIPT_DIR/lib/deploy-${ENVIRONMENT}.sh"

# Run the deployment
deploy_${ENVIRONMENT}
