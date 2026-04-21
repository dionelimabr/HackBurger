# HackBurger Platform

Bem-vindo ao projeto HackBurger. Este repositório contém o código-fonte de uma plataforma de e-commerce totalmente funcional, desenvolvida propositalmente com falhas estruturais e de código (vulnerabilidades) para fins de treinamento avançado em Application Security (AppSec) e eventos do tipo Capture The Flag (CTF), inspirada puramente na arquitetura do OWASP Juice Shop.

## Visão Geral do Projeto

O HackBurger simula uma aplicação web corporativa real utilizando um stack tecnológico moderno e muito comum no mercado. O principal objetivo deste projeto é fornecer um ambiente estruturado, previsível e configurável para que pesquisadores de segurança, engenheiros e desenvolvedores possam praticar a exploração de falhas e a implementação de mitigações de forma controlada.

**Aviso Legal:** Este software contém falhas intencionais de design e vulnerabilidades críticas de software. Sob nenhuma circunstância esta aplicação deve ser hospedada em um ambiente de produção real ou exposta à internet pública sem fortes salvaguardas de isolamento virtual.

## Arquitetura e Stack Tecnológico

A plataforma está estritamente separada em seis camadas arquitetônicas para espelhar ambientes corporativos clássicos:

1. **Camada de Banco de Dados**: Banco relacional SQLite3 gerenciado através de scripts manuais de migrations sequenciais e seeds pré-populados.
2. **Backend API**: Construído em Node.js, Express e TypeScript. Implementa o padrão de organização modular em camadas (Routes -> Controllers -> Services -> Models) contando com middlewares integrados para Injeção de Headers, Rate Limiting, Validação de Payloads (Joi) e autenticação/autorização via JWT.
3. **Frontend (SPA)**: Aplicação de página única (Single Page Application) construída em Angular e estilizada do zero com SCSS. Possui services reativos centrais e interceptors HTTP.
4. **Infraestrutura de Testes**: Cobertura pontual estabelecida através de testes unitários (Jest), testes de integração de API (Frisby.js) e testes end-to-end simulando o comportamento de clientes (Cypress).
5. **Monitoramento e Observabilidade**: O Node expõe rotas de métricas brutas formatadas para ingestão do Prometheus, com visibilidade e alertas refletidos em dashboards customizados e persistentes do Grafana.
6. **Deploy e DevOps**: Integralmente empacotado através do Docker em builds multi-stage. O repositório abriga também manifestos de kubernetes para deploy distribuído, automatizador Vagrant e pipelines CI/CD do GitHub Actions.

## Pré-requisitos de Execução

Para hospedar o projeto localmente, garanta que os dependências abaixo estejam rodando na sua máquina:

- Git
- Node.js (versão 20.x ou mais recente)
- Ambiente de containers Docker e o Docker Compose

## Inicializando o Ambiente Local

1. **Faça o clone do repositório:**
   ```bash
   git clone https://github.com/dionelimabr/HackBurger.git
   cd HackBurger
   ```

2. **Configuração de Ambiente:**
   Copie o manifesto de variáveis globais e efetue simulações ou edições se necessário:
   ```bash
   cp .env.example .env
   ```

3. **Subindo a Infraestrutura Principal:**
   O método primário recomendado para inicializar todas as camadas com o devido isolamento sistêmico é utilizando o compose-up empacotado nos scripts do repositório:
   ```bash
   npm run start
   ```
   *(Caso não possua o Node configurado globalmente, você pode executar o `docker-compose up -d` nativo direto do root).*

### Disponibilidade dos Serviços

Finalizada a estapa de build das imagens e com os containers operantes, os clusters responderão nestas portas por padrão:

- **Frontend UI (Aplicação Principal)**: `http://localhost:4200`
- **Backend API**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Prometheus Metrics**: `http://localhost:9090`
- **Grafana Dashboards**: `http://localhost:3001` (Usuário: `admin`, acesse as dashboards na aba General)

Para desligar o ambiente efetuando o clean-up do daemon, rode: `npm run stop`

## Documentação Técnica Adicional

Detalhes precisos dos fluxos de arquitetura residem no diretório `docs/`:
- `docs/architecture.md`: Diagramas e definições sobre as escolhas corporativas.
- `docs/api-reference.md`: Endpoints mapeados e exemplos de requests REST.
- `docs/deployment.md`: Guidelines sobre as aprovações de pipeline via Action e deploy em Minikube/K8S.
- `docs/contributing.md`: Guidelines sobre os padrões de nomenclatura de commit e Pull Requests.

## Licenciamento e Responsabilidade

Todo dado, código e informação disponibilizado serve exclusivamente propósitos acadêmicos de segurança da informação.
