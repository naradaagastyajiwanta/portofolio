#!/bin/bash
RESTART_FLAG="/home/naradaagastya/PortofolioWebsite/.restart"
cd /home/naradaagastya/PortofolioWebsite

if [ -f "$RESTART_FLAG" ]; then
    echo "[startup] Restart flag detected — restarting backend..."
    sudo docker restart portfolio-backend
    rm -f "$RESTART_FLAG"
    echo "[startup] Backend restarted, flag removed"
fi

COMPOSE_HTTP_TIMEOUT=600 exec sudo docker-compose up --build
