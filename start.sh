#!/bin/bash

echo "==================================================="
echo "   TASK MANAGER KANBAN - LAUNCHER (Linux/Mac)"
echo "==================================================="
echo ""
echo "Escolha como deseja rodar a aplicacao:"
echo ""
echo "1) Rodar via DOCKER (Recomendado)"
echo "2) Rodar em modo DESENVOLVIMENTO (Requer Java/Node)"
echo "3) Instalar dependencias"
echo "4) Sair"
echo ""

read -p "Digite sua opcao [1-4]: " choice

case $choice in
  1)
    docker-compose up --build
    ;;
  2)
    (cd tm-api && mvn spring-boot:run) & (cd tm-ui && npm run dev)
    ;;
  3)
    cd tm-ui && npm install
    ;;
  4)
    exit 0
    ;;
  *)
    echo "Opcao invalida"
    ;;
esac
