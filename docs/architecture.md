# Architecture Guide

O HackBurger é composto por:
- **Frontend**: SPA Angular
- **Backend API**: Node.js, Express, TypeScript
- **Banco de Dados**: SQLite
- **Monitoramento**: Prometheus, Grafana
- **Infraestrutura**: Docker, Kubernetes, Vagrant

A modelagem segue arquitetura em camadas no Node: Route -> Controller -> Service -> Model.
