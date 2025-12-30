#!/bin/sh
set -e

echo "🔍 DEBUG: DATABASE_URL is set to: ${DATABASE_URL}"

echo "⏳ Waiting for database..."
# Pequeño hack para esperar a postgres (o usa wait-for-it)
sleep 5

echo "🔄 Running migrations..."
# Forzamos la variable explícitamente al comando
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo "🚀 Starting server..."
exec "$@"