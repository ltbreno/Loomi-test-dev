# GitHub Configuration

Este diretório contém configurações e templates para o repositório GitHub.

## Estrutura

```
.github/
├── workflows/          # GitHub Actions workflows
│   └── ci-cd.yml      # Pipeline de CI/CD
├── ISSUE_TEMPLATE/    # Templates de issues (futuro)
├── PULL_REQUEST_TEMPLATE.md  # Template de PR (futuro)
└── README.md          # Este arquivo
```

## CI/CD Pipeline

O workflow `ci-cd.yml` executa automaticamente:

### Em Pull Requests

1. **Testes**
   - Lint check
   - Unit tests
   - Coverage report
   
2. **Build**
   - Verifica se o código compila

### Em Push para `main`

1. **Testes** (mesmo que PR)
2. **Build de Imagens Docker**
   - Build de cada microsserviço
   - Push para Amazon ECR
   
3. **Deploy Automático**
   - Atualiza serviços no AWS ECS
   - Force new deployment

## Secrets Necessários

Configure no GitHub Settings > Secrets:

- `AWS_ACCESS_KEY_ID` - Access key da AWS
- `AWS_SECRET_ACCESS_KEY` - Secret key da AWS
- `AWS_ACCOUNT_ID` - ID da conta AWS

## Usando o Pipeline

### Para Desenvolvimento

```bash
# Crie uma feature branch
git checkout -b feature/minha-feature

# Desenvolva e commit
git add .
git commit -m "feat: adiciona nova funcionalidade"

# Push para sua branch
git push origin feature/minha-feature

# Abra um PR no GitHub
# O CI rodará automaticamente
```

### Para Production

```bash
# Merge do PR para main (via GitHub)
# O CD deployará automaticamente para AWS ECS
```

## Badges

Adicione estes badges ao README principal:

```markdown
![CI/CD](https://github.com/your-org/loomi/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-81%25-green)
![License](https://img.shields.io/badge/license-MIT-blue)
```

## Futuras Melhorias

- [ ] Templates de issues para bugs e features
- [ ] Template de Pull Request
- [ ] Workflow para release automático
- [ ] Dependabot para atualizações de dependências
- [ ] CodeQL para análise de segurança
- [ ] Workflow para testes de performance

