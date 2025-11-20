#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR=${APP_DIR:-/var/www/html}
TMP_DIR=${COMPOSER_TMP_DIR:-/tmp/composer-tmp}
CACHE_DIR=${COMPOSER_CACHE_DIR:-/tmp/composer-cache}
COMPOSER_HOME=${COMPOSER_HOME:-/tmp/composer-home}
LOCK_DIR=${COMPOSER_INSTALL_LOCK_DIR:-/tmp/composer-install.lock}
LOCK_TIMEOUT=${COMPOSER_INSTALL_LOCK_TIMEOUT:-600}
LOCK_SLEEP=${COMPOSER_INSTALL_LOCK_SLEEP:-2}

unlock() {
    rm -rf "$LOCK_DIR"
}

acquire_lock() {
    local waited=0
    while ! mkdir "$LOCK_DIR" 2>/dev/null; do
        # Remove stale locks if the owning process no longer exists
        if [[ -f "$LOCK_DIR/pid" ]]; then
            local holder
            holder=$(cat "$LOCK_DIR/pid" 2>/dev/null || true)
            if [[ -n "$holder" ]] && ! kill -0 "$holder" 2>/dev/null; then
                echo "[composer-install] removing stale lock held by PID $holder" >&2
                rm -rf "$LOCK_DIR"
                continue
            fi
        fi

        if (( waited >= LOCK_TIMEOUT )); then
            echo "[composer-install] timed out after ${LOCK_TIMEOUT}s waiting for composer lock" >&2
            exit 1
        fi

        if (( waited == 0 )); then
            echo "[composer-install] another composer install is running, waiting for lock..." >&2
        elif (( waited % 30 == 0 )); then
            echo "[composer-install] still waiting for composer lock..." >&2
        fi

        sleep "$LOCK_SLEEP"
        waited=$(( waited + LOCK_SLEEP ))
    done

    echo $$ > "$LOCK_DIR/pid"
    trap unlock EXIT
}

acquire_lock

echo "[composer-install] starting: PWD=$(pwd) APP_DIR=$APP_DIR TMP_DIR=$TMP_DIR CACHE_DIR=$CACHE_DIR" >&2
env | grep COMPOSER >&2 || true

NO_DEV=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --no-dev)
            NO_DEV=true
            shift
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

if [[ ! -f "$APP_DIR/composer.json" ]]; then
    echo "composer.json not found in $APP_DIR" >&2
    exit 1
fi

export COMPOSER_ALLOW_SUPERUSER=1
export COMPOSER_HOME
export COMPOSER_CACHE_DIR="$CACHE_DIR"
export COMPOSER_TMP_DIR="$TMP_DIR"

COMPOSER_FLAGS=(--no-interaction --prefer-dist --no-progress --optimize-autoloader -vvv)
if $NO_DEV; then
    COMPOSER_FLAGS+=(--no-dev)
fi

attempt=1
while true; do
    rm -rf "$TMP_DIR" "$CACHE_DIR" "$COMPOSER_HOME"
    mkdir -p "$TMP_DIR" "$CACHE_DIR" "$COMPOSER_HOME"

    cd "$APP_DIR"
    echo "[composer-install] now in $(pwd)" >&2

    echo "[composer-install] attempt $attempt running composer install…" >&2
    if composer install "${COMPOSER_FLAGS[@]}"; then
        break
    fi

    if (( attempt >= 3 )); then
        echo "[composer-install] composer install failed after $attempt attempts" >&2
        exit 1
    fi

    echo "[composer-install] composer failed, cleaning cache/tmp and retrying…" >&2
    ((attempt++))
done
