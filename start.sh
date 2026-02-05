#!/bin/bash

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE_DIR" || exit 1

echo "==================================================="
echo "   TASK MANAGER KANBAN - LAUNCHER"
echo "==================================================="
echo ""

read -p "Deseja iniciar a aplicação usando Docker Compose? [y/n]: " choice

if [[ "$choice" =~ ^[Yy]$ ]]; then
    # Detectar comando do Compose (v1 vs v2)
    if docker compose version >/dev/null 2>&1; then
        DCMD="docker compose"
    elif docker-compose version >/dev/null 2>&1; then
        DCMD="docker-compose"
    else
        echo "Erro: Docker Compose não encontrado. Por favor, instale o Docker."
        exit 1
    fi

    echo "Iniciando com: $DCMD..."
    $DCMD up -d --build
    echo "==================================================="
    echo "   SISTEMA INICIADO COM SUCESSO"
    echo "   Acesse: http://localhost"
    echo "==================================================="
else
    echo "Operação cancelada."
    exit 0
fi
