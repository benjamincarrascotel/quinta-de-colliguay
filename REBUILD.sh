#!/bin/bash

# Script para reconstruir y levantar el proyecto
# Quinta de Colliguay

echo "🛑 Deteniendo contenedores..."
docker-compose down

echo "🔨 Reconstruyendo frontend (sin caché)..."
docker-compose build --no-cache frontend

echo "🔨 Reconstruyendo backend (sin caché)..."
docker-compose build --no-cache backend

echo "🚀 Levantando todos los servicios..."
docker-compose up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo "✅ Verificando estado de los contenedores..."
docker-compose ps

echo ""
echo "🎉 ¡Listo! Accede a:"
echo "   http://localhost"
echo ""
echo "📊 Ver logs:"
echo "   docker-compose logs -f"
