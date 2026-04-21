# Deployment

O HackBurger pode ser implantado de três formas, em ordem crescente de complexidade: Docker Compose em um único host, cluster Kubernetes e provisionamento automatizado via Vagrant para ambientes de homologação. Esta seção cobre as três.

## Secrets necessárias

Antes de acionar a pipeline de deploy, configure as secrets no repositório (Settings → Secrets and variables → Actions):

| Nome | Uso |
|---|---|
| `DOCKER_HUB_USERNAME` | Login no Docker Hub |
| `DOCKER_HUB_TOKEN` | Token de acesso do Docker Hub |
| `KUBECONFIG` | Conteúdo base64 do kubeconfig do cluster |
| `JWT_SECRET` | Segredo JWT de produção |

## Docker Compose

O arquivo `docker-compose.yml` na raiz sobe backend, frontend, Prometheus e Grafana. É o caminho mais simples para um deploy em VPS.

```bash
docker-compose pull
docker-compose up -d
docker-compose logs -f backend
```

Variáveis de ambiente são lidas do `.env` da raiz. Para um deploy mais robusto, use `--profile production` e inclua certificados TLS via reverse proxy (nginx ou Traefik) na frente dos contêineres.

## Kubernetes

Os manifestos ficam em `infra/k8s/` e estão divididos por recurso:

```
infra/k8s/
  namespace.yaml
  configmap.yaml
  secret.yaml         editar antes de aplicar
  backend.yaml        Deployment + Service
  frontend.yaml       Deployment + Service
  ingress.yaml
```

Sequência de aplicação:

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secret.yaml
kubectl apply -f infra/k8s/backend.yaml
kubectl apply -f infra/k8s/frontend.yaml
kubectl apply -f infra/k8s/ingress.yaml
```

Para rollout de uma nova versão:

```bash
kubectl set image deployment/hackburger-backend \
  backend=docker.io/usuario/hackburger-backend:v1.2.0 -n hackburger

kubectl rollout status deployment/hackburger-backend -n hackburger
```

Em caso de falha:

```bash
kubectl rollout undo deployment/hackburger-backend -n hackburger
```

## Pipeline de CI/CD

A pipeline em `.github/workflows/deploy.yml` é disparada em push para `main`. O fluxo tem quatro estágios:

1. **Lint + testes unitários** em backend e frontend.
2. **Build das imagens** Docker para backend e frontend.
3. **Push para o Docker Hub** com tag `sha-<commit>` e `latest`.
4. **Deploy no cluster** via `kubectl apply` e `rollout status`.

Se qualquer etapa falha, a pipeline para e nenhuma imagem antiga é substituída.

## Ambiente de homologação com Vagrant

Para reproduzir o ambiente de produção localmente em uma VM Linux, use o `Vagrantfile` em `infra/vagrant/`:

```bash
cd infra/vagrant
vagrant up
vagrant ssh
```

A máquina vem com Docker, Docker Compose e o repositório clonado em `/opt/hackburger`. Útil para testar pipelines de deploy sem mexer no cluster real.

## Checklist de produção

- Definir `JWT_SECRET` forte e único.
- Ajustar `CORS_ORIGIN` para o domínio oficial.
- Trocar as senhas dos usuários de seed.
- Configurar backup do arquivo SQLite (ou migrar para PostgreSQL).
- Habilitar HTTPS no Ingress com cert-manager + Let's Encrypt.
- Configurar scraping do Prometheus no cluster, não apenas local.
- Definir limites de CPU e memória nos Deployments.
- Configurar HorizontalPodAutoscaler se a carga justificar.
