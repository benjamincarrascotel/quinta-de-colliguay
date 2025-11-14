# 🚀 Quick Start - Docker

## Levantar el proyecto completo con Docker

### 1. Asegúrate de tener Docker y Docker Compose instalados

```bash
docker --version
docker-compose --version
```

### 2. Configura las variables de entorno (opcional)

```bash
# Si no existe, se creará automáticamente desde .env.example
# Puedes editar .env para personalizar (SMTP, JWT_SECRET, etc.)
cp .env.example .env
nano .env  # o tu editor favorito
```

### 3. Levanta todos los servicios

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto levantará:
- ✅ **PostgreSQL** (base de datos) - puerto 5432
- ✅ **Backend** (Node.js + Express + Prisma) - puerto 8000
- ✅ **Frontend** (React build estático + Nginx) - puerto 3000 (interno)
- ✅ **Caddy** (reverse proxy) - puerto 80

### 4. Accede a la aplicación

```
http://localhost
```

**Rutas disponibles:**
- `http://localhost` - Página principal (reservas públicas)
- `http://localhost/login` - Login de administrador
- `http://localhost/admin` - Panel de administración
- `http://localhost/api/v1/*` - API REST

### 5. Credenciales por defecto

**Admin:**
- Email: `admin@quintacolliguay.cl`
- Password: `admin123`

⚠️ **IMPORTANTE:** Cambia estas credenciales en producción.

---

## Comandos útiles

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f caddy
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (resetear base de datos)
```bash
docker-compose down -v
```

### Reconstruir las imágenes (después de cambios en el código)
```bash
docker-compose build
docker-compose up -d
```

### Reconstruir sin caché
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ver el estado de los contenedores
```bash
docker-compose ps
```

### Ejecutar comandos dentro de un contenedor

**Backend (ejemplo: ejecutar seed manualmente):**
```bash
docker-compose exec backend npx prisma db seed
```

**Ver la base de datos con Prisma Studio:**
```bash
docker-compose exec backend npx prisma studio
# Accede en: http://localhost:5555
```

---

## Troubleshooting

### El frontend no carga o muestra errores
```bash
# Reconstruye el frontend
docker-compose build frontend
docker-compose up -d frontend
```

### El backend no se conecta a la base de datos
```bash
# Verifica que PostgreSQL esté saludable
docker-compose ps postgres

# Revisa los logs
docker-compose logs postgres
docker-compose logs backend
```

### Errores de CORS
Verifica que `ALLOWED_ORIGINS` en docker-compose.yml incluya tu origen.

### Resetear todo y empezar de cero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## Desarrollo local (sin Docker)

Si prefieres desarrollar sin Docker, consulta el archivo `README.md` sección "Desarrollo Local".

---

## Arquitectura

```
┌─────────────┐
│   Browser   │
│ localhost   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Caddy    │ :80
│ Reverse     │
│   Proxy     │
└──┬───────┬──┘
   │       │
   │       └──────────────┐
   │                      │
   ▼                      ▼
┌──────────┐      ┌──────────────┐
│ Frontend │ :80  │   Backend    │ :8000
│  (Nginx) │      │   (Node.js)  │
│  Static  │      │   + Prisma   │
└──────────┘      └───────┬──────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │ :5432
                  └───────────────┘
```

**Flujo de requests:**
1. Browser → `http://localhost/` → Caddy
2. Caddy → Frontend (archivos estáticos)
3. Browser → `http://localhost/api/v1/...` → Caddy
4. Caddy → Backend → PostgreSQL

---

¡Listo! 🎉
