# SSL Setup with Let's Encrypt + Certbot

Steps to obtain the first TLS certificate for `infor.solidcore.cl`.

## Automatic issuance during deploy

Running `bash scripts/deploy/deploy.sh dev` or `bash scripts/deploy/deploy.sh prod` now verifies the presence of `/etc/letsencrypt/live/$SSL_DOMAIN/fullchain.pem`. If the certificate is missing (e.g. volumes were deleted), the deploy flow automatically:

1. Switches nginx to the HTTP-only config.
2. Runs `certbot certonly --webroot ... -d $SSL_DOMAIN`.
3. Restores `nginx-prod.conf` and restarts nginx.

Set the following variables in `.env` (already present in the example files):

```
SSL_DOMAIN=infor.solidcore.cl
SSL_EMAIL=admin@solidcore.cl
CERTBOT_WEBROOT=/var/www/certbot
```

You only need the manual instructions below if you prefer to run the process explicitly or for troubleshooting. When testing, export `CERTBOT_USE_STAGING=1` to avoid Let's Encrypt production rate limits; it defaults to `0` (live certificates).

## Prerequisites

1. DNS for `infor.solidcore.cl` points to the server.
2. Ports 80/443 are open.
3. Docker + docker compose installed.

## Initial Provisioning (run once)

### 1. Verify DNS

```bash
nslookup infor.solidcore.cl
```

### 2. Switch nginx to HTTP-only mode

If the automated flow is unavailable and you need to force HTTP-only mode manually, copy the template into the runtime file used by Docker:

```bash
cp nginx/nginx.conf nginx/runtime/nginx.conf.backup
cp nginx/nginx-http-only.conf nginx/runtime/nginx.conf
```

### 3. Deploy the stack

```bash
./scripts/deploy/deploy.sh dev   # Ensure nginx is running without SSL
```

### 4. Request the certificate

```bash
chmod +x scripts/ssl-init.sh
./scripts/ssl-init.sh
```

The script backs up nginx config, starts the HTTP variant, validates the domain, runs Certbot (webroot) and then restores the production config once the certificate is issued. Enter a valid email when prompted.

### 5. Restore the HTTPS config

If you skipped the automated script for some reason:

```bash
cp nginx/nginx-prod.conf nginx/runtime/nginx.conf
docker compose restart nginx
```

### 6. Validate in the browser

Visit `https://infor.solidcore.cl` and confirm:

- Padlock icon present.
- Issuer: Let's Encrypt.
- Laravel app loads correctly.

## Renewals

Certificates last 90 days. Renew every 60 days (or automate it).

### Manual Renewal

```bash
chmod +x scripts/ssl-renew.sh
./scripts/ssl-renew.sh
```

### Automatic Renewal (cron)

```bash
chmod +x scripts/setup-ssl-renewal-cron.sh
./scripts/setup-ssl-renewal-cron.sh
```

## Useful Commands

```bash
# List certificates
docker compose run --rm certbot certificates

# View certbot logs
docker compose logs certbot

# Force renewal (staging)
docker compose run --rm certbot renew --force-renewal --dry-run
```

## Troubleshooting

| Error | Cause | Fix |
| :--- | :--- | :--- |
| `Failed authorization procedure` | Domain not reachable. | Confirm DNS, nginx status, firewall ports. |
| `Unable to find certificate files` | nginx still points to SSL config before certs exist. | Use `nginx-http-only.conf` until Certbot finishes. |
| Rate limit exceeded | Too many attempts. | Wait a week or use the staging flag for tests. |

## Production Notes

- Update `.env`/nginx hosts/domains before running the script.
- Certificates live in the `letsencrypt` Docker volume.
- The repo no longer ships a systemd-based renewal helper; cron is the supported method.
