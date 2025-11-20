# INFOR - Maintenance Management System

## 1. Project Overview

Infor is a comprehensive platform for managing heavy machinery and its components. This repository contains the **backend API and the administration panel**, which act as the central intelligence of the ecosystem. Field operators interact through a dedicated mobile app that consumes this backend.

### Key Features

- **Asset Management**: Full inventory of machines, components and cutting elements.
- **Maintenance Lifecycle**: Issue work orders, log replacements and track progress.
- **Centralized Administration**: Role-based access for users, permissions and teams.
- **Dashboards & Reporting**: KPI dashboards plus exportable reports.

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | [**PHP 8.2+**](https://www.php.net/), [**Laravel 12**](https://laravel.com/) | API + business logic |
| **Frontend** | [**React 19**](https://react.dev/), [**TypeScript**](https://www.typescriptlang.org/), [**Vite**](https://vitejs.dev/) | SPA admin panel |
| **Database** | [**PostgreSQL**](https://www.postgresql.org/) | Relational data store |
| **Styles** | [**Tailwind CSS**](https://tailwindcss.com/) | Utility-first CSS |
| **Dev Env** | [**Docker**](https://www.docker.com/), [**Laravel Sail**](https://laravel.com/docs/sail) | Containerized local setup |

## 3. Architecture & Documentation

- **[📄 1. Environment Variables](./docs/01-environment-variables.md)** – Source of truth for every `.env` file (local, prod and cPanel extras).
- **[📄 2. Environment Setup](./docs/02-environment-setup.md)** – End-to-end onboarding for both local development and Linux production servers.
- **[📄 3. Reverse Proxy (Caddy)](./docs/03-caddy-proxy.md)** – Minimal configuration used in production to expose the containers via HTTPS.
- **[📄 4. Deployment Guide](./docs/04-deployment.md)** – Unified playbook that aggregates manual scripts, GitHub Actions pipelines, SSL automation and the cPanel flow.

## 4. Task Commands

Daily operations now live in a Bash dispatcher so you don’t need GNU Make installed. Execute everything through `bash scripts/task`, for example `bash scripts/task usage`.

| Group | Command | Description |
| :--- | :--- | :--- |
| **Helper** | `usage` | Prints the full task reference and exits. |
| **Deployments** | `deploy <env>` | Invokes `scripts/deploy/deploy.sh` (`env`: `local`, `dev`, or `prod`). |
| **cPanel** | `deploy-to-cpanel` | Runs ready + zip + upload in sequence (recommended flow). |
|  | `ready-to-cpanel` | Builds Composer/NPM deps, Vite assets, and clears caches using `.env.cpanel`. |
|  | `zip-to-cpanel` | Creates `controlmantencion.zip` ready for upload. |
|  | `upload-zip-to-cpanel` | Uploads the ZIP via SSH and runs the remote init routine. |
|  | `setup-cpanel-ssh` | Copies the shared SSH key to `~/.ssh`, fixes permissions, and tests the connection. |
|  | `init-cpanel` | Executes the remote initialization script on the hosting account. |
| **Daily use** | `up-detached` | Starts the containers in the background (`docker compose up -d`). |
|  | `fresh-detached` | Runs `destroy` and then `deploy local` for a clean rebuild. |
|  | `down` | Stops all Docker services (`docker compose down`). |
|  | `artisan <cmd>` | Runs `php artisan …` inside the Laravel container. |
| **Database** | `migrate` | Runs migrations inside the container. |
|  | `migrate-fresh` | Executes the destructive `php artisan migrate:fresh`. |
|  | `run-seeder` | Runs `php artisan db:seed`. |
| **Utilities** | `clear-cache` | Clears config, route, and view caches. |
| **Code Quality** | `php-linter` | Runs Pint inside the container. |
|  | `js-linter` | Runs ESLint locally with `--fix`. |
| **Destructive** | `destroy` | Stops containers, removes images/volumes, deletes `vendor/` + `node_modules/`. |

## 5. Debugging (VS Code + Xdebug)

Laravel debugging is preconfigured through `.vscode/launch.json`. Copy the snippet below into your workspace (create `.vscode/launch.json` if it does not exist) and restart the VS Code debug session. Xdebug turns on automatically whenever your `.env` sets `APP_ENV` to anything other than `production` (the default is `local`) and `XDEBUG_MODE=debug`.

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "hostname": "0.0.0.0",
            "pathMappings": {
                "/var/www/html": "${workspaceFolder}"
            },
            "log": true,
            "xdebugSettings": {
                "max_data": 65535,
                "show_hidden": 1,
                "max_children": 100,
                "max_depth": 5
            }
        }
    ]
}
```

### Usage

1. Ensure your `.vscode/launch.json` matches the snippet above.
2. Install the **PHP Debug** extension in VS Code (by Xdebug).
3. Start the containers via your normal workflow (e.g., `bash scripts/deploy/deploy.sh local` or `docker compose up`).
4. Run the **Listen for Xdebug** configuration (`Run and Debug → Listen for Xdebug`).
5. Set breakpoints in your Laravel code; each request hitting the breakpoint pauses execution in VS Code.
