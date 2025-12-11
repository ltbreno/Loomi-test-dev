# Guia de Deploy AWS ECS

Este documento descreve o processo completo de deploy dos microsserviços Loomi na AWS usando ECS Fargate.

## Arquitetura AWS

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Load Balancer               │
│                    (loomi-alb.amazonaws.com)                │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
         │ Gateway │    │  Users  │    │  Trans  │
         │ Service │    │ Service │    │ Service │
         │ (ECS)   │    │ (ECS)   │    │ (ECS)   │
         └─────────┘    └─────────┘    └─────────┘
              │               │               │
         ┌────▼───────────────▼───────────────▼────┐
         │            ElastiCache Redis            │
         └─────────────────────────────────────────┘
              │               │               │
         ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
         │ Secrets │    │   RDS   │    │   MSK   │
         │ Manager │    │  (x2)   │    │ (Kafka) │
         └─────────┘    └─────────┘    └─────────┘
```

## Pré-requisitos

1. **AWS CLI** instalado e configurado
2. **Docker** para build das imagens
3. **Conta AWS** com permissões adequadas
4. **GitHub** configurado para CI/CD

## Passo 1: Configurar Credenciais AWS

```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json
```

## Passo 2: Configurar Rede (VPC, Subnets, Security Groups)

```bash
cd infrastructure/aws
chmod +x setup-networking.sh
./setup-networking.sh
```

Isto criará:
- VPC (10.0.0.0/16)
- 2 Subnets públicas
- 2 Subnets privadas
- Internet Gateway
- Route Tables
- Security Groups

Anote os IDs gerados para uso posterior.

## Passo 3: Criar Bancos de Dados RDS

### Users Database

```bash
aws rds create-db-instance \
  --db-instance-identifier loomi-users-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-XXXXX \
  --db-subnet-group-name loomi-db-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --region us-east-1
```

### Transactions Database

```bash
aws rds create-db-instance \
  --db-instance-identifier loomi-transactions-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-XXXXX \
  --db-subnet-group-name loomi-db-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --region us-east-1
```

## Passo 4: Criar ElastiCache Redis

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id loomi-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1 \
  --cache-subnet-group-name loomi-cache-subnet-group \
  --security-group-ids sg-XXXXX \
  --region us-east-1
```

## Passo 5: Criar MSK Kafka Cluster

```bash
aws kafka create-cluster \
  --cluster-name loomi-kafka \
  --broker-node-group-info file://kafka-broker-config.json \
  --kafka-version 3.5.1 \
  --number-of-broker-nodes 2 \
  --region us-east-1
```

## Passo 6: Configurar Secrets Manager

```bash
# JWT Secret
aws secretsmanager create-secret \
  --name loomi/jwt/secret \
  --secret-string "YOUR_SUPER_SECRET_JWT_KEY" \
  --region us-east-1

# JWT Refresh Secret
aws secretsmanager create-secret \
  --name loomi/jwt/refresh-secret \
  --secret-string "YOUR_SUPER_SECRET_REFRESH_KEY" \
  --region us-east-1

# Database passwords
aws secretsmanager create-secret \
  --name loomi/users-db/password \
  --secret-string "YOUR_DB_PASSWORD" \
  --region us-east-1
```

## Passo 7: Criar Repositórios ECR e Deploy Imagens

```bash
chmod +x deploy.sh
./deploy.sh
```

Este script:
1. Cria repositórios ECR
2. Faz build das imagens Docker
3. Faz push para ECR
4. Registra task definitions no ECS

## Passo 8: Criar Application Load Balancer

```bash
# Criar ALB
aws elbv2 create-load-balancer \
  --name loomi-alb \
  --subnets subnet-XXXXX subnet-YYYYY \
  --security-groups sg-XXXXX \
  --region us-east-1

# Criar Target Groups
aws elbv2 create-target-group \
  --name loomi-gateway-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-XXXXX \
  --target-type ip \
  --health-check-path /health \
  --region us-east-1
```

## Passo 9: Criar ECS Services

```bash
# Gateway Service
aws ecs create-service \
  --cluster loomi-cluster \
  --service-name loomi-gateway-service \
  --task-definition loomi-gateway \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=gateway,containerPort=3000" \
  --region us-east-1

# Users Service
aws ecs create-service \
  --cluster loomi-cluster \
  --service-name loomi-users-service \
  --task-definition loomi-users-service \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX]}" \
  --region us-east-1

# Transactions Service
aws ecs create-service \
  --cluster loomi-cluster \
  --service-name loomi-transactions-service \
  --task-definition loomi-transactions-service \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX]}" \
  --region us-east-1
```

## Passo 10: Configurar Auto Scaling

```bash
# Definir target tracking para Gateway
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/loomi-cluster/loomi-gateway-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/loomi-cluster/loomi-gateway-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name loomi-gateway-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Passo 11: Configurar CI/CD com GitHub Actions

1. Adicione os secrets no GitHub:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID`

2. O workflow `.github/workflows/ci-cd.yml` já está configurado e executará:
   - Testes em todos os PRs
   - Build e push de imagens em merge para `main`
   - Deploy automático no ECS

## Monitoramento e Logs

### CloudWatch Logs

Os logs são automaticamente enviados para CloudWatch:
- `/ecs/loomi-gateway`
- `/ecs/loomi-users-service`
- `/ecs/loomi-transactions-service`

### CloudWatch Metrics

Métricas automáticas do ECS:
- CPU Utilization
- Memory Utilization
- Request Count (ALB)

### Métricas Customizadas

Acesse `/metrics` no Gateway para métricas de aplicação.

## Custos Estimados (us-east-1)

| Serviço | Configuração | Custo Mensal |
|---------|-------------|--------------|
| ECS Fargate (6 tasks) | 0.5 vCPU, 1GB RAM | ~$45 |
| RDS (2 instâncias) | db.t3.micro | ~$30 |
| ElastiCache | cache.t3.micro | ~$15 |
| MSK | kafka.t3.small (2 brokers) | ~$150 |
| ALB | Standard | ~$23 |
| Data Transfer | 10GB/mês | ~$1 |
| **Total** | | **~$264/mês** |

## Troubleshooting

### Task não inicia

```bash
# Ver logs do task
aws ecs describe-tasks \
  --cluster loomi-cluster \
  --tasks TASK_ID \
  --region us-east-1
```

### Health check falhando

```bash
# Verificar logs do container
aws logs tail /ecs/loomi-gateway --follow
```

### Conectividade entre serviços

Verifique os Security Groups e certifique-se de que:
- ECS tasks podem acessar RDS (porta 5432)
- ECS tasks podem acessar Redis (porta 6379)
- ECS tasks podem acessar Kafka (portas 9092, 9094)

## Rollback

Em caso de problemas:

```bash
# Reverter para task definition anterior
aws ecs update-service \
  --cluster loomi-cluster \
  --service loomi-gateway-service \
  --task-definition loomi-gateway:PREVIOUS_VERSION \
  --region us-east-1
```

## Backup e Disaster Recovery

### RDS Backups

- Backups automáticos diários com retenção de 7 dias
- Point-in-time recovery disponível

### Recuperação

```bash
# Restaurar RDS de backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier loomi-users-db-restored \
  --db-snapshot-identifier snapshot-name
```

## Segurança

- ✅ Todos os dados em trânsito criptografados (TLS)
- ✅ Bancos de dados criptografados em repouso
- ✅ Secrets gerenciados via AWS Secrets Manager
- ✅ Least privilege IAM roles
- ✅ Security groups restritivos
- ✅ Private subnets para bancos de dados

## Próximos Passos

1. Configurar WAF no ALB
2. Implementar CloudFront para CDN
3. Configurar Route53 para DNS personalizado
4. Implementar backups cross-region
5. Adicionar alertas no SNS

## Suporte

Para problemas de deploy, abra uma issue no repositório ou entre em contato com a equipe.

