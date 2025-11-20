# Deployment Playbook

Comprehensive guidance for every deployment path the project supports.

## Table of Contents

1. [Modular Scripts (manual deploys)](#modular-scripts-manual-deploys)
2. [CI/CD with GitHub Actions + GCP](#cicd-with-github-actions--gcp)
3. [SSL / HTTPS](#ssl--https)
4. [cPanel Shared Hosting](#cpanel-shared-hosting)

---

## Modular Scripts (manual deploys)

Use the scripts in `scripts/deploy` when you need fine-grained control (local machines, staging VM, one-off prod hotfixes).

### Related Files

- [`scripts/deploy/deploy.sh`](../scripts/deploy/deploy.sh) – orchestrator
- [`scripts/deploy/lib/*.sh`](../scripts/deploy/lib) – specific logic per environment

### Quick Start

```bash
./scripts/deploy/deploy.sh local   # Local Sail stack
./scripts/deploy/deploy.sh dev     # Remote dev/staging server
./scripts/deploy/deploy.sh prod    # Production server
```

> Tip: The scripts now hide most Docker build/install noise. Export `DEPLOY_VERBOSE=1` if you need to troubleshoot and want the raw command output.

### Behavior Overview

| Mode | Highlights |
| :--- | :--- |
| `local` | Creates `.env` from `.env.example` when missing, rebuilds containers, runs `migrate:fresh` + seeders, starts Vite HMR (no nginx). |
| `dev` | Uses the existing `.env` (falls back to `.env.prod.example` if needed), starts DB first, runs migrations + seeders, builds static assets (no Vite server), switches nginx to the production config. |
| `prod` | Reuses `.env`, validates `APP_ENV/APP_DEBUG`, installs dependencies, runs migrations without seeding, builds assets, caches config/routes/views, and starts nginx only. |

> The dev/prod scripts reference `docker-compose.prod.yml` for overrides. Add that file to the repo (or adjust the scripts) before relying on these flows in a new environment.

---

## CI/CD with GitHub Actions + GCP

Automated deployments rely on the same modular scripts but run remotely through GitHub-hosted runners and Google Compute Engine VMs.

### Related File

- [`docs/deploy/github-actions-setup.md`](./deploy/github-actions-setup.md)

### Current Workflows

| Workflow | Trigger | Notes |
| :--- | :--- | :--- |
| `tests.yml` | Push/PR to `develop` or `main` | PHP 8.4 + Node 22 build, `npm run build`, Pest tests. |
| `lint.yml` | Push/PR to `develop` or `main` | Pint, Prettier, ESLint. |
| `deploy-dev.yml` | Push to `dev` or manual dispatch | Deploys to the dev VM using environment `INFOR`. |
| `deploy-prod.yml` | Push to `main` or manual dispatch | Deploys to the prod VM using environment `INFOR-PROD` (requires manual approval). |

Secrets/variables needed by the workflows (project IDs, VM info, deploy key, etc.) are listed in `docs/deploy/github-actions-setup.md`.

---

## SSL / HTTPS

Let’s Encrypt certificates are handled via Certbot containers.

### Related Files

- [`docs/deploy/ssl-setup.md`](./deploy/ssl-setup.md) – how to obtain the first certificate.
- [`docs/deploy/ssl-auto-renewal.md`](./deploy/ssl-auto-renewal.md) – how to renew automatically.
- [`scripts/ssl-init.sh`](../scripts/ssl-init.sh) – initialization helper (runs from repo root).
- [`scripts/ssl-renew.sh`](../scripts/ssl-renew.sh) – manual renewal helper.

### Quick Start

- `bash scripts/deploy/deploy.sh dev` or `bash scripts/deploy/deploy.sh prod` automatically issues the certificate if `/etc/letsencrypt/live/$SSL_DOMAIN/fullchain.pem` is missing.
- Those same deploys install/replace a cron job that runs daily at 03:00 (override via `SSL_RENEW_CRON_SCHEDULE`) to run `scripts/ssl-renew.sh` and log to `logs/ssl-renewal.log`. Check it with `crontab -l | grep ssl-renew` and `tail -f logs/ssl-renewal.log`.
- Set `CERTBOT_USE_STAGING=1` only when testing to avoid rate limits; the variable defaults to `0`, which requests production certificates.
- Manual helper (optional):

  ```bash
  chmod +x scripts/ssl-init.sh
  ./scripts/ssl-init.sh
  ```

Auto-renewal uses cron:

```bash
chmod +x scripts/setup-ssl-renewal-cron.sh
./scripts/setup-ssl-renewal-cron.sh
```

> The old systemd helper mentioned in older docs no longer ships with the repo. Use the cron-based script or add your own systemd unit files if desired.

### Verifying Certificates

```bash
# Show managed certs
docker compose run --rm certbot certificates

# Check expiry date remotely
echo | openssl s_client -servername infor.solidcore.cl \
  -connect infor.solidcore.cl:443 2>/dev/null | openssl x509 -noout -dates
```

---

## cPanel Shared Hosting

Shared hosting has strict memory limits, so we compile locally (Docker), ship a ZIP, and only run lightweight commands on the server.

### Why Local Builds?

- Tailwind CSS 4 + Vite + React need >2 GB RAM.
- cPanel processes are capped at ~512 MB–1 GB.
- WASM tooling (`@tailwindcss/oxide`, `lightningcss`) crashes with `WebAssembly.instantiate(): Out of memory` on cPanel.

Therefore the pipeline is: **build locally → zip → upload → extract → run `bash scripts/task init-cpanel`**.

### Directory Layout (on the hosting account)

```
/home/controld/
├── controlmantencion/          # Project root
│   ├── app/
│   ├── public/
│   │   ├── build/              # Vite assets
│   │   └── index.php
│   ├── vendor/
│   ├── .env                    # With MySQL credentials
│   └── htaccess                # Template copied to public/.htaccess
└── public_html/
    └── controlmantencion -> /home/controld/controlmantencion/public
```

### URL Mapping

| URL | Resolves to |
| :--- | :--- |
| `https://controlmaderainfor.cl/controlmantencion` | `/home/controld/controlmantencion/public/index.php` |
| `https://controlmaderainfor.cl/controlmantencion/build/` | `/home/controld/controlmantencion/public/build/` |

### SSH Setup (run once per developer)

1. Download `id_rsa_controlmantencion` and place it in the repo root.
2. Run `bash scripts/task setup-cpanel-ssh` (passphrase: `controlmantencion`).
3. The target is stored in `.env` variables (`CPANEL_*`).

### Automated Flow (recommended)

```bash
cp .env.cpanel .env               # Update credentials manually
bash scripts/task deploy-to-cpanel
```

That helper performs:

1. `bash scripts/task ready-to-cpanel` – Builds Composer/NPM deps, Vite assets, clears caches.
2. `bash scripts/task zip-to-cpanel` – Creates `controlmantencion.zip` without dev artefacts.
3. Upload via `scp`.
4. Remote `bash scripts/task init-cpanel` – Copies `.htaccess`, clears caches.

### Manual Flow

```bash
cp .env.cpanel .env
bash scripts/task ready-to-cpanel
bash scripts/task zip-to-cpanel

# Upload (choose either file manager or SSH)
scp -i ~/.ssh/id_rsa_controlmantencion -P 2200 \
  controlmantencion.zip controld@cp012.servidoresph.com:/home/controld/controlmantencion/

# SSH into the server
ssh -i ~/.ssh/id_rsa_controlmantencion -p 2200 controld@cp012.servidoresph.com <<'REMOTE'
cd ~/controlmantencion
unzip -o controlmantencion.zip
bash scripts/task init-cpanel
REMOTE
```

### Inertia + Subdirectories

Because the app lives at `/controlmantencion`, every Inertia route must be prefixed. This is achieved at runtime inside `resources/js/app.tsx` by reading `import.meta.env.VITE_HTTP_BASE` and mutating all URLs before they leave the router. Never remove the interceptor or the forms will POST to `/login` instead of `/controlmantencion/login`.

### Vite Base Path

`vite.config.ts` loads `VITE_ASSET_BASE` and ensures assets are emitted with `/controlmantencion/build/…`. Without it, Apache would look for `/public_html/build/` and return 404s.

### Apache `.htaccess`

The template stored as `htaccess` in the repo root enforces PHP 8.2, index rewrites, and ensures Laravel routes everything under `/controlmantencion/`. `bash scripts/task init-cpanel` copies it to `public/.htaccess` on the remote server every time you deploy.

### Required `.env.cpanel` Overrides

- `APP_URL` / `ASSET_URL` must include `/controlmantencion`.
- `SESSION_PATH=/controlmantencion` and `SESSION_COOKIE=controlmantencion_session` prevent clashes.
- `FILESYSTEM_DISK=public`, `CACHE_STORE=file`, `CACHE_PREFIX=controlmantencion_` keep IO localized.
- `VITE_HTTP_BASE` and `VITE_ASSET_BASE` must match the subdirectory prefixes.
- Replace PostgreSQL placeholders with the actual **MySQL** credentials before running `bash scripts/task ready-to-cpanel`.

### Troubleshooting

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `WebAssembly.instantiate(): Out of memory` | Attempting to run `npm run build` on cPanel. | Always build locally with Docker. |
| 404 on CSS/JS | Wrong `VITE_ASSET_BASE` or missing `public/build/`. | Rebuild locally, redeploy ZIP. |
| Inertia forms hit `/login` | Missing `VITE_HTTP_BASE` or interceptor. | Re-add env vars / JS snippet. |
| Sessions reset on every request | Wrong cookie path/domain or storage permissions. | Match `.env.cpanel` values; run `chmod -R 775 storage bootstrap/cache`. |
| `id_rsa_controlmantencion not found` | SSH key missing. | Place it in repo root and rerun `bash scripts/task setup-cpanel-ssh`. |

---

_Last updated: January 2025_
