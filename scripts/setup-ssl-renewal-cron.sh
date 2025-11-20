#!/bin/bash
# Setup automatic SSL certificate renewal using cron
# This script should be run ONCE on the server after initial deployment

set -e

echo "🔧 Setting up automatic SSL certificate renewal"
echo "==============================================="
echo ""

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RENEW_SCRIPT="$PROJECT_DIR/scripts/ssl-renew.sh"

# Check if ssl-renew.sh exists
if [ ! -f "$RENEW_SCRIPT" ]; then
    echo "❌ Error: ssl-renew.sh not found at $RENEW_SCRIPT"
    exit 1
fi

# Make sure ssl-renew.sh is executable
chmod +x "$RENEW_SCRIPT"

echo "📋 Project directory: $PROJECT_DIR"
echo "📋 Renewal script: $RENEW_SCRIPT"
echo ""

# Cron job entry
# Default: daily at 03:00 unless SSL_RENEW_CRON_SCHEDULE is set
SCHEDULE="${SSL_RENEW_CRON_SCHEDULE:-0 3 * * *}"
CRON_JOB="$SCHEDULE cd '$PROJECT_DIR' && '$RENEW_SCRIPT' >> '$PROJECT_DIR/logs/ssl-renewal.log' 2>&1"

echo "📋 The following cron job will be added:"
echo ""
echo "   $CRON_JOB"
echo ""
echo "   This will:"
echo "   - Run according to: $SCHEDULE"
echo "   - Check if certificates need renewal (30 days before expiry)"
echo "   - Automatically renew and reload nginx if needed"
echo "   - Log output to logs/ssl-renewal.log"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "ssl-renew.sh"; then
    echo "⚠️  A similar cron job already exists:"
    echo ""
    crontab -l | grep "ssl-renew.sh"
    echo ""
    read -p "Replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
    # Remove existing ssl-renew cron jobs
    crontab -l | grep -v "ssl-renew.sh" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo ""
echo "✅ Cron job added successfully!"
echo ""
echo "📋 Current cron jobs:"
crontab -l
echo ""
echo "📝 To manually trigger renewal: $RENEW_SCRIPT"
echo "📝 To view renewal logs: tail -f $PROJECT_DIR/logs/ssl-renewal.log"
echo "📝 To edit cron jobs: crontab -e"
echo "📝 To remove cron jobs: crontab -r"
echo ""
echo "🎉 Setup complete!"
