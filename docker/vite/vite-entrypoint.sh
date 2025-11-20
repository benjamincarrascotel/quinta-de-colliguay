#!/usr/bin/env sh
set -e
VENDOR_CACHE_DIR="/var/vendor-cache"
mkdir -p "$VENDOR_CACHE_DIR"
ln -sfn "$VENDOR_CACHE_DIR" /app/vendor
cd /app
export PATH="/app/node_modules/.bin:$PATH"

echo ">> Starting Vite entrypoint"

# 1) Wait for vendor (populated by 'app' container in shared volume)
max_wait_seconds=120
elapsed_seconds=0
echo ">> Waiting for vendor/autoload.php ..."
while [ ! -f vendor/autoload.php ]; do
  if [ "$elapsed_seconds" -ge "$max_wait_seconds" ]; then
    echo "ERROR: vendor directory not found"
    exit 1
  fi
  sleep 1
  elapsed_seconds=$((elapsed_seconds+1))
done
echo ">> vendor ready."

# 2) Decide if we need to (re)install Node dependencies
lockfile="/app/package-lock.json"
lockhash_file="/app/.package-lock.sha256"
need_install="no"

# 2.1 If node_modules doesn't exist, need to install
if [ ! -d node_modules ]; then
  need_install="yes"
fi

# 2.2 If 'sonner' is missing from node_modules, need to install
if [ "$need_install" = "no" ] && [ ! -d node_modules/sonner ]; then
  echo ">> Missing 'sonner' in node_modules."
  need_install="yes"
fi

# 2.3 If lockfile changed vs last saved hash, need to install
if [ "$need_install" = "no" ] && [ -f "$lockfile" ]; then
  current_hash="$(sha256sum "$lockfile" | awk '{print $1}')"
  if [ ! -f "$lockhash_file" ]; then
    need_install="yes"
  else
    saved_hash="$(cat "$lockhash_file" 2>/dev/null || true)"
    [ "$current_hash" != "$saved_hash" ] && need_install="yes"
  fi
fi

# 2.4 Install if needed (prioritize npm ci when lockfile exists)
if [ "$need_install" = "yes" ]; then
  if [ -f package-lock.json ]; then
    echo ">> npm ci"
    npm ci
    # Save hash for next container start
    sha256sum "$lockfile" | awk '{print $1}' > "$lockhash_file" 2>/dev/null || true
  elif [ -f package.json ]; then
    echo ">> npm install"
    npm install
  else
    echo "WARNING: No package.json found, skipping Node installation."
  fi
else
  echo ">> node_modules OK (sonner present and/or lockfile unchanged)."
fi

# 3) Ensure vite is available
[ -x node_modules/.bin/vite ] || npm i -D vite@^7

# 4) Decide whether to run dev server or build based on APP_ENV
APP_ENV="${APP_ENV:-local}"

if [ "$APP_ENV" = "local" ]; then
  echo ">> APP_ENV=local: Starting Vite dev server with HMR..."
  echo ">> Starting command: $@"
  exec "$@"
else
  echo ">> APP_ENV=$APP_ENV: Building client assets (no SSR)..."
  npm run build
  echo ">> Build completed. Assets generated at:"
  echo "   - public/build/manifest.json"
  echo ">> Vite container finishing (build mode)."
  exit 0
fi
