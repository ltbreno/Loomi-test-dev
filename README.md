# Loomi Banking Microservices

Sistema bancário inovador construído com arquitetura de microsserviços usando Node.js, NestJS, PostgreSQL, Redis e Apache Kafka.

## 🏗️ Arquitetura

O sistema é composto por 3 microsserviços principais:

- **API Gateway**: Ponto de entrada centralizado com autenticação JWT e rate limiting
- **Users Service**: Gerenciamento de usuários e dados bancários com cache Redis
- **Transactions Service**: Processamento de transferências entre usuários

### Tecnologias Utilizadas

- **Framework**: NestJS (Node.js)
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Mensageria**: Apache Kafka
- **Autenticação**: JWT (Access + Refresh Tokens)
- **Documentação**: Swagger/OpenAPI
- **Containerização**: Docker & Docker Compose
- **Cloud**: AWS ECS, RDS, ElastiCache, MSK
- **CI/CD**: GitHub Actions

## 📦 Estrutura do Projeto

```
loomi/
├── services/
│   ├── gateway/          # API Gateway com autenticação
│   ├── users/            # Serviço de usuários
│   └── transactions/     # Serviço de transações
├── shared/               # Tipos e interfaces compartilhadas
├── infrastructure/       # Configurações Docker e AWS
├── docs/                 # Documentação adicional
└── docker-compose.yml    # Orquestração local dos serviços
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js >= 20.0.0
- Docker & Docker Compose
- npm >= 10.0.0

### Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/your-org/loomi.git
cd loomi
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp services/users/.env.example services/users/.env
cp services/transactions/.env.example services/transactions/.env
cp services/gateway/.env.example services/gateway/.env
```

4. Inicie os serviços com Docker Compose:
```bash
docker-compose up -d
```

5. Acesse a documentação Swagger:
- Gateway: http://localhost:3000/api/docs
- Users Service: http://localhost:3001/api/docs
- Transactions Service: http://localhost:3002/api/docs

## 🧪 Testes

Execute os testes unitários:
```bash
npm run test
```

Execute os testes com cobertura:
```bash
npm run test:cov
```

Execute os testes E2E:
```bash
npm run test:e2e
```

## 📚 Documentação

- [Deployment Guide](docs/DEPLOYMENT.md) - Guia completo de deploy na AWS
- [Progress Report](docs/PROGRESS.md) - Relatório de progresso do projeto
- [AI Usage](docs/AI_USAGE.md) - Documentação do uso de ferramentas de IA
- [Architecture](docs/ARCHITECTURE.md) - Detalhes da arquitetura

## 🔐 Endpoints Principais

### Autenticação (Gateway)

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login e obtenção de tokens
- `POST /auth/refresh` - Renovar access token

### Usuários

- `GET /users/:userId` - Obter detalhes do usuário
- `PATCH /users/:userId` - Atualizar dados do usuário
- `PATCH /users/:userId/profile-picture` - Upload de foto de perfil
- `GET /users/:userId/balance` - Consultar saldo

### Transações

- `POST /transactions` - Criar nova transação
- `GET /transactions/:transactionId` - Detalhes da transação
- `GET /transactions/user/:userId` - Histórico de transações (paginado)
- `POST /transactions/:id/reverse` - Estornar transação

## 🔧 Desenvolvimento

### Executar serviço individual

```bash
cd services/users
npm run start:dev
```

### Lint e formatação

```bash
npm run lint
npm run format
```

### Build para produção

```bash
npm run build
```

## 🌐 Deploy na AWS

Consulte o [Deployment Guide](docs/DEPLOYMENT.md) para instruções detalhadas de deploy na AWS ECS.

Resumo rápido:
```bash
# 1. Configure credenciais AWS
aws configure

# 2. Execute o script de deploy
cd infrastructure/aws
chmod +x deploy.sh
./deploy.sh
```

## 📊 Monitoramento

- **Health Checks**: `/health` em cada serviço
- **Métricas**: `/metrics` no Gateway
- **Logs**: Estruturados em JSON com correlation IDs

## 🔒 Segurança

- Autenticação JWT com access e refresh tokens
- Rate limiting (100 req/min por IP)
- Helmet para security headers
- CORS configurado
- Validação de inputs com class-validator
- Secrets gerenciados via AWS Secrets Manager

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `test:` Adição ou correção de testes
- `refactor:` Refatoração de código
- `chore:` Mudanças em ferramentas, configurações

## 📝 Licença

Este projeto foi desenvolvido como parte de um desafio técnico para a Loomi.

## 👥 Contato

Para dúvidas ou sugestões, entre em contato através de: processoseletivo@loomi.com.br

