# 🚀 Guia de Início Rápido - Loomi Banking

Este guia permite que você execute o sistema completo em menos de 5 minutos.

## Pré-requisitos

Certifique-se de ter instalado:
- ✅ Docker Desktop (v24+)
- ✅ Docker Compose (v2+)
- ✅ Node.js (v20+) - opcional, apenas para desenvolvimento
- ✅ Git

## Passo 1: Clone o Repositório

```bash
git clone https://github.com/your-org/loomi.git
cd loomi
```

## Passo 2: Inicie os Serviços

```bash
# Suba todos os serviços em modo detached
docker-compose up -d

# Acompanhe os logs
docker-compose logs -f
```

⏱️ **Aguarde ~2 minutos** para todos os serviços iniciarem completamente.

## Passo 3: Verifique o Status

```bash
# Verifique se todos os containers estão rodando
docker-compose ps

# Deve mostrar 8 containers: gateway, users, transactions, kafka, zookeeper, redis, users-db, transactions-db
```

Alternativamente, acesse os health checks:
- Gateway: http://localhost:3000/health
- Users: http://localhost:3001/health
- Transactions: http://localhost:3002/health

## Passo 4: Acesse a Documentação Swagger

Abra no navegador:

- **API Gateway**: http://localhost:3000/api/docs
- **Users Service**: http://localhost:3001/api/docs
- **Transactions Service**: http://localhost:3002/api/docs

## Passo 5: Teste a API

### 5.1 Registre um Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha12345",
    "address": "Rua das Flores, 123",
    "bankingDetails": {
      "agency": "0001",
      "accountNumber": "12345678",
      "accountType": "CHECKING"
    }
  }'
```

### 5.2 Faça Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha12345"
  }'
```

**Salve o `accessToken` retornado!**

### 5.3 Consulte Dados do Usuário

```bash
# Substitua USER_ID e ACCESS_TOKEN
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### 5.4 Crie uma Segunda Conta (para transferência)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "password": "senha12345",
    "bankingDetails": {
      "agency": "0001",
      "accountNumber": "87654321",
      "accountType": "SAVINGS"
    }
  }'
```

### 5.5 Faça uma Transferência

Primeiro, adicione saldo na conta do João:

```bash
curl -X PATCH http://localhost:3001/api/users/JOAO_USER_ID/balance \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "reason": "Initial deposit"
  }'
```

Depois, faça a transferência:

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderUserId": "JOAO_USER_ID",
    "receiverUserId": "MARIA_USER_ID",
    "amount": 100.50,
    "description": "Pagamento de almoço"
  }'
```

### 5.6 Consulte Histórico de Transações

```bash
curl -X GET "http://localhost:3000/transactions/user/JOAO_USER_ID?page=1&limit=10" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## Comandos Úteis

### Ver Logs de um Serviço Específico

```bash
docker-compose logs -f gateway
docker-compose logs -f users-service
docker-compose logs -f transactions-service
```

### Reiniciar um Serviço

```bash
docker-compose restart gateway
```

### Parar Todos os Serviços

```bash
docker-compose down
```

### Parar e Limpar Volumes (dados)

```bash
docker-compose down -v
```

### Reconstruir Imagens

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Acessar Ferramentas de Monitoramento

### Kafka UI

Acesse: http://localhost:8080

- Ver topics
- Ver mensagens
- Ver consumer groups
- Monitorar lag

### Métricas da Aplicação

Acesse: http://localhost:3000/metrics

Retorna métricas em JSON:
```json
{
  "timestamp": "2024-12-14T10:30:00.000Z",
  "metrics": {
    "http_requests_POST_/transactions_total": 150,
    "http_requests_POST_/transactions_success": 145,
    "http_requests_POST_/transactions_error": 5,
    "http_requests_POST_/transactions_duration_avg": "245.50",
    "http_requests_POST_/transactions_duration_p95": "450"
  }
}
```

## Troubleshooting

### Problema: Container não inicia

```bash
# Verificar logs do container
docker-compose logs CONTAINER_NAME

# Verificar se as portas não estão em uso
lsof -i :3000
lsof -i :5432
```

### Problema: Kafka não conecta

```bash
# Reiniciar Kafka e Zookeeper
docker-compose restart zookeeper kafka

# Aguardar 30 segundos e reiniciar services
docker-compose restart users-service transactions-service
```

### Problema: Database connection failed

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps users-db transactions-db

# Verificar logs do database
docker-compose logs users-db
docker-compose logs transactions-db
```

### Problema: Redis connection failed

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Reiniciar Redis
docker-compose restart redis
```

## Desenvolvimento Local

Se você quer desenvolver sem Docker:

### 1. Instale dependências

```bash
npm install
```

### 2. Configure .env files

```bash
cp services/users/.env.example services/users/.env
cp services/transactions/.env.example services/transactions/.env
cp services/gateway/.env.example services/gateway/.env
```

### 3. Inicie apenas infraestrutura no Docker

```bash
# Suba apenas databases, redis e kafka
docker-compose up -d users-db transactions-db redis kafka zookeeper
```

### 4. Execute os serviços localmente

Em terminais separados:

```bash
# Terminal 1 - Users Service
cd services/users
npm run start:dev

# Terminal 2 - Transactions Service
cd services/transactions
npm run start:dev

# Terminal 3 - Gateway
cd services/gateway
npm run start:dev
```

## Próximos Passos

- 📖 Leia a [Documentação Completa](README.md)
- 🏗️ Entenda a [Arquitetura](docs/ARCHITECTURE.md)
- 🚀 Aprenda sobre [Deploy na AWS](docs/DEPLOYMENT.md)
- 🤖 Veja como [IA foi utilizada](docs/AI_USAGE.md)

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação em `/docs`
- Entre em contato: processoseletivo@loomi.com.br

---

**Happy Coding! 🎉**

