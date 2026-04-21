# Deployment Guide

Certifique-se de configurar as secrets do GitHub antes de acionar a Action de Deploy:

1. `DOCKER_HUB_USERNAME`
2. `DOCKER_HUB_TOKEN`
3. `KUBECONFIG`

Os deploys usam imagens Docker geradas nos Actions nos workers Ubuntu.
