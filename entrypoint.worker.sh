#!/bin/sh
set -e

echo "🚀 Starting Worker..."
echo "ℹ️  Migrations are handled by the API service"

exec "$@"
