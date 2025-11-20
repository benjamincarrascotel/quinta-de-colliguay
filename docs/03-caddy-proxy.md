# Reverse Proxy (Caddy)

In production, Caddy is the single entry point. It terminates TLS and forwards traffic to the Laravel container.

### Recommended `Caddyfile`

```caddy
infor.solidcore.cl {
    reverse_proxy http://localhost:8080
}
```

## Applying the Configuration

1. **Edit the `Caddyfile`:**
   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```
2. **Restart Caddy:**
   ```bash
   sudo systemctl restart caddy
   ```

That’s it—Caddy fetches/renews certificates automatically via ACME, so no extra Certbot integration is required on this server.
