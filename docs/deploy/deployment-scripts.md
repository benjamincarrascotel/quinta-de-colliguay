# Deployment Scripts

Modular Bash scripts that encapsulate the manual deployment flows.

## Directory Structure

```
scripts/deploy/
├── deploy.sh              # Main orchestrator
├── lib/
│   ├── common.sh          # Shared helpers (docker, artisan, etc.)
│   ├── deploy-local.sh    # Local developer workflow
│   ├── deploy-dev.sh      # Dev/staging workflow
│   └── deploy-prod.sh     # Production workflow
```

> The older `README.md` inside this folder was removed—the logic is now fully documented here.

## Usage

```bash
./scripts/deploy/deploy.sh local   # Local Sail stack
./scripts/deploy/deploy.sh dev     # Dev/staging VM
./scripts/deploy/deploy.sh prod    # Production VM
```

## Environment Details

### Local (`local`)

- Creates `.env` from `.env.example` when missing and fixes permissions.
- Ensures the base Docker image is built, restarts containers, and runs `migrate:fresh` + seeders.
- Generates Ziggy routes + Wayfinder types.
- Starts only the app + database containers plus the Vite HMR container (no nginx).
- Keeps Composer/NPM dependencies inside Docker-managed volumes (`vendor_shared`, `vite_node_modules`), so there is nothing to copy back to the host.

### Dev (`dev`)

- Reuses the existing `.env` (falls back to `.env.prod.example` if absent).
- Starts the database first, guarantees the DB user exists, then launches the app container.
- Runs migrations (`migrate:fresh`) followed by seeders.
- Builds assets with the dedicated Vite container; nginx serves the static build (no Vite dev server).
- Copies `nginx/nginx-prod.conf` into place for a proxy-only setup.

### Prod (`prod`)

- Requires a fully configured `.env` with `APP_ENV=production` and `APP_DEBUG=false`.
- Performs safety checks, installs Composer deps with optimized autoloaders, and runs non-interactive migrations.
- Builds assets exactly like the dev flow but **does not seed** the database.
- Caches config/route/view files for better performance.

## Known Requirements

- The scripts call `docker compose -f docker-compose.yml -f docker-compose.prod.yml …`. Create the override file (with nginx prod config, scaling rules, etc.) before relying on the dev/prod targets.
- `nginx/nginx-prod.conf` must exist because `use_production_nginx_config` copies it into the generated `nginx/runtime/nginx.conf` that containers mount.
- The host running the script needs Docker, Bash and GNU coreutils.

## Extending the System

1. Put shared helpers in `lib/common.sh`.
2. Add environment-specific logic inside `lib/deploy-<env>.sh`.
3. Register new environments in `deploy.sh` (case statement + function).

The scripts intentionally mirror what GitHub Actions executes remotely, so keeping them updated ensures both manual and automated deployments behave identically.
