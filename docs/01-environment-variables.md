# Environment Variables

Configuration is driven through `.env` files so every developer/server can keep its own secrets. Three templates ship with the repo:

- **`.env.example`** – Reference file for local development.
- **`.env.prod.example`** – Baseline for Linux servers or CI/CD.
- **`.env.cpanel`** – Special preset used only while building artifacts for the shared hosting flow.

> Never commit `.env` files. Copy the template you need and fill in the secrets locally or inside your deployment target.

---

## 1. Application Environment

| Variable | Description | Dev Example | Prod Example |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | Visible name across notifications/UI. | `SolidBaseTemplate` | `Infor` |
| `APP_ENV` | `local`, `production`, `staging`, etc. | `local` | `production` |
| `APP_KEY` | Laravel encryption key (`php artisan key:generate`). | _(empty)_ | _(empty)_ |
| `APP_DEBUG` | Detailed stack traces. Must be `false` in production. | `true` | `false` |
| `APP_URL` | Public base URL. | `http://localhost` | `https://infor.solidcore.cl` |
| `APP_PORT` | Host port that maps to the Laravel container. | `8080` | `8080` |

## 2. Internationalization & Localization

| Variable | Description | Dev | Prod |
| :--- | :--- | :--- | :--- |
| `APP_TIMEZONE` | PHP timezone. | `America/Santiago` | `America/Santiago` |
| `APP_LOCALE` | Default locale. | `es` | `es` |
| `APP_FALLBACK_LOCALE` | Fallback when translation is missing. | `es` | `es` |
| `APP_FAKER_LOCALE` | Locale for factories/seeders. | `es_ES` | `es_ES` |

## 3. Maintenance Mode

| Variable | Description | Dev |
| :--- | :--- | :--- |
| `APP_MAINTENANCE_DRIVER` | `file` or `database`. | `file` |
| `APP_MAINTENANCE_STORE` | Optional cache store when using the DB driver. | _(commented)_ |

## 4. PHP CLI Server

| Variable | Description | Dev |
| :--- | :--- | :--- |
| `PHP_CLI_SERVER_WORKERS` | Worker count for the built-in PHP server. | `4` |

## 5. Hashing

| Variable | Description | Dev |
| :--- | :--- | :--- |
| `BCRYPT_ROUNDS` | Higher = slower but safer. | `12` |

## 6. Logging

| Variable | Description | Dev | Prod |
| :--- | :--- | :--- | :--- |
| `LOG_CHANNEL` | `stack`, `single`, `daily`, `pretty-daily`, etc. | `pretty-daily` | `pretty-daily` |
| `LOG_STACK` | Channels used by `stack`. | `single` | - |
| `LOG_DEPRECATIONS_CHANNEL` | Deprecation warnings. | `null` | `null` |
| `LOG_LEVEL` | `debug`/`info`/`warning`/`error`. | `debug` | `error` |

## 7. Database

Local Docker uses PostgreSQL, but cPanel hosting falls back to MySQL. Populate these variables with the values of the target environment.

| Variable | Dev | Prod |
| :--- | :--- | :--- |
| `DB_CONNECTION` | `pgsql` | `pgsql` (or `mysql` in cPanel) |
| `DB_HOST` | `pgsql` | `pgsql` / `127.0.0.1` |
| `DB_PORT` | `5432` | `5432` / `3306` |
| `DB_DATABASE` | `infor_dev` | `infor_production` |
| `DB_USERNAME` | `infor_dev` | `production_db_user` |
| `DB_PASSWORD` | `passworddev` | `your_strong_password` |

> **Important:** The Bash task helper does **not** rewrite `.env.cpanel`. Replace the placeholders manually with the credentials provided by the hosting provider before running `bash scripts/task ready-to-cpanel`.

## 8. Session

| Variable | Description | Dev | Prod |
| :--- | :--- | :--- | :--- |
| `SESSION_DRIVER` | `file`, `database`, etc. | `database` | `database` |
| `SESSION_LIFETIME` | Minutes. | `120` | `120` |
| `SESSION_ENCRYPT` | Encrypt session payloads. | `false` | `true` |
| `SESSION_PATH` | Cookie path. | `/` | `/` / `/controlmantencion` (cPanel) |
| `SESSION_DOMAIN` | Cookie domain. | `null` | _(empty)_ |
| `SESSION_SECURE_COOKIE` | HTTPS-only cookies. | `false` | `true` |

## 9. Broadcasting / Filesystem / Queue

| Variable | Default |
| :--- | :--- |
| `BROADCAST_CONNECTION` | `log`
| `FILESYSTEM_DISK` | `local` (or `public` for cPanel) |
| `QUEUE_CONNECTION` | `sync`

## 10. Cache

| Variable | Default |
| :--- | :--- |
| `CACHE_STORE` | `database` (or `file` in cPanel) |
| `CACHE_PREFIX` | `controlmantencion_`

## 11. Redis

| Variable | Default |
| :--- | :--- |
| `REDIS_CLIENT` | `phpredis` |
| `REDIS_HOST` | `127.0.0.1` |
| `REDIS_PASSWORD` | `null` |
| `REDIS_PORT` | `6379` |

## 12. Mail

| Variable | Example |
| :--- | :--- |
| `MAIL_MAILER` | `smtp`
| `MAIL_HOST` | `smtp.gmail.com`
| `MAIL_PORT` | `587`
| `MAIL_USERNAME` | `email_sender@example.com`
| `MAIL_PASSWORD` | `password`
| `MAIL_ENCRYPTION` | `tls`
| `MAIL_FROM_ADDRESS` | `email_sender@example.com`
| `MAIL_FROM_NAME` | `${APP_NAME}` |

## 13. AWS S3

Leave blank unless you actually push files to S3.

| Variable |
| :--- |
| `AWS_ACCESS_KEY_ID`
| `AWS_SECRET_ACCESS_KEY`
| `AWS_DEFAULT_REGION`
| `AWS_BUCKET`
| `AWS_USE_PATH_STYLE_ENDPOINT`

## 14. Vite / Frontend

| Variable | Description |
| :--- | :--- |
| `VITE_APP_NAME` | Mirrors `APP_NAME`.
| `VITE_HMR_HOST` | Custom host for dev HMR (leave empty unless reverse proxying).
| `VITE_CORS_ALLOW_ALL` | Enable permissive CORS in dev (empty in prod).
| `VITE_HTTP_BASE` | Required when deploying to a subdirectory (`/controlmantencion`).
| `VITE_ASSET_BASE` | Same prefix plus `/build/`, e.g. `/controlmantencion/build/`.

## 15. Docker / Sail helpers

| Variable | Description |
| :--- | :--- |
| `DOCKER_LARAVEL_SERVICE_NAME` | Container name used by the Makefile (`app`).
| `WWWGROUP` / `WWWUSER` | Host UID/GID for file permissions (defaults to `1000`).
| `SUPERVISOR_VITE_AUTOSTART` | `false` in production so Vite never launches in the container.

## 16. cPanel Deployment (SSH configuration)

The `.env.example` file also ships the variables required by the cPanel automation targets:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `CPANEL_SSH_KEY` | `~/.ssh/id_rsa_controlmantencion` | Path to the private key. |
| `CPANEL_USER` | `controld` | SSH user provided by the hosting company. |
| `CPANEL_HOST` | `cp012.servidoresph.com` | SSH host. |
| `CPANEL_PORT` | `2200` | SSH port. |
| `CPANEL_REMOTE_PATH` | `/home/controld/controlmantencion` | Target directory. |

### SSH Key Setup Workflow

1. [Download the private key from Google Drive](https://drive.google.com/file/d/1_1lMeGTOm1Me-sH4VkR-9-XEHkNTbNVF/view?usp=drive_link).
2. Place `id_rsa_controlmantencion` in the **project root** (already ignored by Git).
3. Run `bash scripts/task setup-cpanel-ssh` to copy it to `~/.ssh`, fix permissions, and test the connection.
4. If prompted, use the passphrase `controlmantencion`.

### Deploying to cPanel

1. Copy `.env.cpanel` to `.env` and update every credential manually.
2. Run `bash scripts/task ready-to-cpanel && bash scripts/task zip-to-cpanel`.
3. Execute `bash scripts/task deploy-to-cpanel` for the fully automated flow or follow the manual steps documented in `docs/04-deployment.md`.

---

## Security Checklist

1. `.env` files must never be committed.
2. `APP_DEBUG=false` and `SESSION_SECURE_COOKIE=true` in production.
3. Replace every placeholder password before deploying.
4. Regenerate `APP_KEY` whenever a new environment is provisioned.

For a complete walkthrough of each environment (development VM, cPanel, CI/CD) read `docs/04-deployment.md`.
