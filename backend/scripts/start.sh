#!/bin/bash

# Script para iniciar el servidor Mai de forma limpia
PORT=${PORT:-3001}

echo "🚀 Iniciando servidor Mai en puerto $PORT..."

# Verificar si hay un proceso en el puerto
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Proceso encontrado en puerto $PORT. Matando proceso..."
    lsof -ti:$PORT | xargs kill -9
    sleep 2
    echo "✅ Proceso anterior terminado."
else
    echo "✅ Puerto $PORT libre."
fi

# Verificar si el archivo compilado existe
if [ ! -f "dist/index.js" ]; then
    echo "📦 Compilando proyecto..."
    npm run build
fi

# Iniciar el servidor
echo "🚀 Iniciando servidor Mai..."
node dist/index.js 