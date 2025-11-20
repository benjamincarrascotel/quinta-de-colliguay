# Environment Setup

## Local Development

Everything runs inside Docker (Laravel Sail profile). Use the Bash helper script (`bash scripts/task …`) to avoid remembering long commands.

### Requirements

Install these tools on your workstation before cloning the project:

- **Git** – <https://git-scm.com/downloads>
- **Docker Desktop** (macOS/Windows) or **Docker Engine** (Linux) – <https://docs.docker.com/get-docker/>
- **Node.js 20.x + npm 10.x** – <https://nodejs.org/en/download/prebuilt-installer>  
  > macOS/Linux users can also install Node via [nvm](https://github.com/nvm-sh/nvm); Windows can use [nvm-windows](https://github.com/coreybutler/nvm-windows).
- **Composer 2.x** – <https://getcomposer.org/download/>
Verify everything is available:

```bash
git --version
docker --version
node -v && npm -v
composer -V
```

> On Linux remember to add your user to the `docker` group so you can run `docker compose` without `sudo`.

### First-time Installation

```bash
# 1. Clone the repo
git clone https://github.com/SolidCoreSolutionsSpa/infor_backend.git
cd infor_backend

# 2. Copy the env template
cp .env.example .env

# 3. Bootstrap containers, database and assets
make initialize
```

Once the command finishes you can browse the panel at `http://localhost:8080` (or whatever port you set in `APP_PORT`).

### Bash Command Helper

Most of the daily workflows that used to live in the Makefile are now available through `scripts/task`. Start by printing the built-in help:

```bash
bash scripts/task usage
```

Common commands:

| Command | Description |
| :--- | :--- |
| `bash scripts/task usage` | Prints the full command reference and exits. |
| `bash scripts/task deploy <local|dev|prod>` | Invokes `scripts/deploy/deploy.sh` with the selected environment. |
| `bash scripts/task ready-to-cpanel` | Builds Composer/NPM dependencies, assets, and clears caches for the cPanel ZIP. |
| `bash scripts/task zip-to-cpanel` | Packages the repository into `controlmantencion.zip` without dev artefacts. |
| `bash scripts/task upload-zip-to-cpanel` | Uploads the prepared ZIP over SSH and runs the remote init routine. |
| `bash scripts/task deploy-to-cpanel` | Executes `ready-to-cpanel`, `zip-to-cpanel`, and `upload-zip-to-cpanel` sequentially. |
| `bash scripts/task setup-cpanel-ssh` | Copies the cPanel SSH key to `~/.ssh`, fixes permissions, and tests the connection. |
| `bash scripts/task init-cpanel` | Runs the remote initialization script on the hosting account (execute via SSH). |
| `bash scripts/task down` | Runs `docker compose down` for the local stack. |
| `bash scripts/task up-detached` | Starts all services in the background. |
| `bash scripts/task fresh-detached` | Runs `destroy` followed by `deploy local` for a clean rebuild. |
| `bash scripts/task artisan <args>` | Runs `php artisan …` inside the Laravel container. |
| `bash scripts/task clear-cache` | Clears Laravel’s config, route, and view caches in the container. |
| `bash scripts/task migrate` | Executes database migrations inside the container. |
| `bash scripts/task migrate-fresh` | Runs the destructive `php artisan migrate:fresh`. |
| `bash scripts/task run-seeder` | Runs `php artisan db:seed` inside the container. |
| `bash scripts/task php-linter` | Executes Pint (`./vendor/bin/pint`) inside the container. |
| `bash scripts/task js-linter` | Runs ESLint locally with `--fix`. |
| `bash scripts/task destroy` | Stops containers, removes images/volumes, and deletes `vendor/` + `node_modules/`. |

### Composer / Node dependencies

### Dev local installs (linters, IDE tooling)

To get `vendor/` and `node_modules/` locally, install the dependencies exactly as in any Laravel + Vite project:

```bash
# PHP 8.2 + Composer 2.x required on your machine
composer install

# Node 20.x + npm 10.x required on your machine
npm install
```

Re-run those commands whenever you delete the folders or update `composer.lock`/`package-lock.json`. This local installation is optional—the containers remain the source of truth for deployments—but it lets your editor/lint tooling resolve classes and packages without needing remote extensions.

## Production Server

These steps apply to a VM (GCP, AWS, bare metal, etc.).

1. **Environment file** – Copy `.env.prod.example` to `.env` and replace every credential. Confirm `APP_ENV=production` and `APP_DEBUG=false`.
2. **Deploy** – Use the Bash orchestration scripts (`bash scripts/deploy/deploy.sh prod`) over SSH. GitHub Actions also calls these scripts remotely (see `docs/deploy/github-actions-setup.md`).
3. **Reverse proxy** – Point Caddy or Nginx to the Laravel container. The simplest Caddy snippet is documented in `docs/03-caddy-proxy.md`.
4. **SSL** – Follow the Certbot instructions in `docs/deploy/ssl-setup.md` and then enable auto-renewal (`docs/deploy/ssl-auto-renewal.md`).

For cPanel-specific constraints (subdirectory deployments, asset compilation, ZIP packaging) refer directly to `docs/04-deployment.md`.
