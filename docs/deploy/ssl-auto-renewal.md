# Automatic SSL Certificate Renewal

Let's Encrypt certificates expire every **90 days**. Automating renewals ensures nginx always serves a valid certificate.

## Quick Start

- Running `bash scripts/deploy/deploy.sh dev` or `prod` installs a cron job that runs every day at **03:00** (override via `SSL_RENEW_CRON_SCHEDULE`, e.g. `SSL_RENEW_CRON_SCHEDULE="*/15 * * * *"` during testing).  
- The first execution is triggered right after the deploy finishes and its output is stored in `logs/ssl-renewal.log`.
- Use `CERTBOT_USE_STAGING=1` only when you explicitly want the Let's Encrypt staging CA. Leave it unset/`0` to renew the production certificate.

For manual installations (or if you need to recreate the cron entry independently):

```bash
chmod +x scripts/setup-ssl-renewal-cron.sh
./scripts/setup-ssl-renewal-cron.sh
```

This helper:

1. Detects the project path.
2. Ensures `scripts/ssl-renew.sh` is executable.
3. Adds the cron entry and redirects the output to `logs/ssl-renewal.log`.

## How the Cron Entry Looks

```cron
0 3 * * * cd /path/to/infor_backend && /path/to/infor_backend/scripts/ssl-renew.sh >> /path/to/infor_backend/logs/ssl-renewal.log 2>&1
```

> Adjust the cron schedule via `SSL_RENEW_CRON_SCHEDULE` if you need a different cadence.

## Manual Setup (if the script fails)

```bash
crontab -e
# Paste the cron line above (adjust paths)
```

## Verification

```bash
crontab -l | grep ssl-renew          # Confirm the entry exists
tail -f logs/ssl-renewal.log        # Monitor executions in real time
./scripts/ssl-renew.sh              # Trigger a manual cycle (same logging)
```

## Monitoring Certificate Expiry

```bash
docker compose run --rm certbot certificates

echo | openssl s_client -servername infor.solidcore.cl \
  -connect infor.solidcore.cl:443 2>/dev/null | openssl x509 -noout -dates
```

## Troubleshooting

| Issue | Fix |
| :--- | :--- |
| Cron job not running | Ensure the cron service is active (`sudo systemctl status cron`) and the entry exists (`crontab -l`). |
| Renewal fails | Check Docker containers (`docker compose ps`), run `./scripts/ssl-renew.sh` manually, and inspect `docker compose logs certbot`. |
| nginx not reloaded | The renewal script restarts nginx automatically. If it fails, restart manually: `docker compose restart nginx`. |

## Security Notes

- The cron job runs as your user; no root privileges required.
- Logs stay inside the repository (`logs/ssl-renewal.log`).
- If you prefer systemd timers, create your own unit files that call `scripts/ssl-renew.sh`; the project no longer ships a helper for that approach.
