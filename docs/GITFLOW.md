# GitFlow e Convenções de Versionamento

## Estratégia de Branching

Este projeto segue uma versão simplificada do GitFlow, adaptada para microsserviços.

### Branches Principais

```
main (production)
  └─ develop (staging)
       ├─ feature/users-service
       ├─ feature/transactions-service
       ├─ feature/api-gateway
       ├─ feature/kafka-integration
       └─ feature/aws-deployment
```

### Tipos de Branches

#### 1. `main` - Produção

- **Propósito**: Código em produção
- **Proteções**: 
  - Requer PR aprovado
  - Testes devem passar
  - Deploy automático via CI/CD
- **Merge**: Apenas de `develop` ou `hotfix/*`

#### 2. `develop` - Staging

- **Propósito**: Código pronto para release
- **Proteções**:
  - Requer PR aprovado
  - Testes devem passar
- **Merge**: De `feature/*` branches

#### 3. `feature/*` - Features

- **Nomenclatura**: `feature/descricao-da-feature`
- **Exemplos**:
  - `feature/user-registration`
  - `feature/jwt-authentication`
  - `feature/transaction-processing`
- **Base**: `develop`
- **Merge para**: `develop`
- **Ciclo de vida**: Deletada após merge

#### 4. `hotfix/*` - Correções Urgentes

- **Nomenclatura**: `hotfix/descricao-do-problema`
- **Exemplos**:
  - `hotfix/security-jwt-vulnerability`
  - `hotfix/transaction-rollback-bug`
- **Base**: `main`
- **Merge para**: `main` E `develop`
- **Ciclo de vida**: Deletada após merge

#### 5. `bugfix/*` - Correções Não-Urgentes

- **Nomenclatura**: `bugfix/descricao-do-bug`
- **Base**: `develop`
- **Merge para**: `develop`

## Conventional Commits

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat(users): add profile picture upload` |
| `fix` | Correção de bug | `fix(transactions): validate balance before transfer` |
| `docs` | Documentação | `docs: update deployment guide` |
| `style` | Formatação de código | `style: format with prettier` |
| `refactor` | Refatoração | `refactor(cache): extract cache service` |
| `perf` | Melhoria de performance | `perf(users): add database indexes` |
| `test` | Adição de testes | `test(transactions): add unit tests` |
| `build` | Build system | `build: update dependencies` |
| `ci` | CI/CD | `ci: add github actions workflow` |
| `chore` | Tarefas diversas | `chore: update gitignore` |
| `revert` | Reverter commit | `revert: revert feat(users): add email validation` |

### Scopes

Scopes indicam o microsserviço ou módulo afetado:

- `users` - Users Service
- `transactions` - Transactions Service
- `gateway` - API Gateway
- `shared` - Código compartilhado
- `infra` - Infraestrutura
- `docs` - Documentação
- `deps` - Dependências

### Exemplos de Commits

#### ✅ Bons Commits

```bash
feat(users): implement JWT refresh token

- Add refresh token generation
- Create refresh endpoint
- Update authentication flow

Closes #23

---

fix(transactions): prevent race condition in balance update

Use pessimistic locking to ensure atomic balance updates

Fixes #45

---

perf(users): add Redis cache for user queries

- Implement cache-aside pattern
- Add TTL of 1 hour
- Invalidate cache on updates

Improves response time by 80%

---

docs(deployment): add AWS ECS deployment guide

Complete guide with step-by-step instructions for deploying
to AWS ECS Fargate including networking, RDS, and ElastiCache setup
```

#### ❌ Commits Ruins

```bash
# Muito vago
fix: bug

# Sem type
Added new feature

# Sem scope quando necessário
feat: add new endpoint

# All caps
FIX: CRITICAL BUG
```

## Pull Request Guidelines

### Template de PR

```markdown
## Descrição

Breve descrição das mudanças realizadas.

## Tipo de Mudança

- [ ] Bug fix (correção não-breaking)
- [ ] New feature (funcionalidade não-breaking)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## Checklist

- [ ] Código segue style guide do projeto
- [ ] Self-review realizado
- [ ] Comentários adicionados em código complexo
- [ ] Documentação atualizada
- [ ] Nenhum novo warning gerado
- [ ] Testes unitários adicionados
- [ ] Testes existentes passam
- [ ] Testes E2E passam (se aplicável)

## Screenshots (se aplicável)

## Issues Relacionadas

Closes #issue_number
```

### Regras de Aprovação

1. **Code Review Obrigatório**
   - Mínimo 1 aprovação para merge em `develop`
   - Mínimo 2 aprovações para merge em `main`

2. **CI Deve Passar**
   - Todos os testes devem passar
   - Linter sem erros
   - Build bem-sucedido

3. **Conflitos Resolvidos**
   - Sem conflitos com branch destino
   - Rebase ou merge conforme necessário

## Workflow Completo

### Feature Development

```bash
# 1. Criar branch de feature
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. Desenvolver feature
# ... fazer alterações ...
git add .
git commit -m "feat(gateway): implement JWT authentication"

# 3. Push para remote
git push origin feature/user-authentication

# 4. Abrir Pull Request no GitHub
# - Base: develop
# - Compare: feature/user-authentication
# - Adicionar descrição detalhada
# - Solicitar reviewers

# 5. Após aprovação, fazer merge
# (via GitHub interface ou CLI)

# 6. Deletar branch local e remote
git checkout develop
git pull origin develop
git branch -d feature/user-authentication
git push origin --delete feature/user-authentication
```

### Hotfix Workflow

```bash
# 1. Criar branch de hotfix a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/security-vulnerability

# 2. Fazer correção
git add .
git commit -m "fix(security): patch JWT verification vulnerability"

# 3. Merge para main
git checkout main
git merge hotfix/security-vulnerability
git push origin main

# 4. Merge para develop também
git checkout develop
git merge hotfix/security-vulnerability
git push origin develop

# 5. Tag de versão
git tag -a v1.0.1 -m "Hotfix: security vulnerability"
git push origin v1.0.1

# 6. Deletar branch
git branch -d hotfix/security-vulnerability
git push origin --delete hotfix/security-vulnerability
```

## Versionamento Semântico (SemVer)

Formato: `MAJOR.MINOR.PATCH`

### Incremento de Versão

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): Novas features (backwards compatible)
- **PATCH** (0.0.1): Bug fixes (backwards compatible)

### Exemplos

```
v1.0.0 - Initial release
v1.0.1 - Hotfix: security vulnerability
v1.1.0 - Feature: add profile picture upload
v1.1.1 - Fix: transaction validation bug
v2.0.0 - Breaking: change authentication flow to OAuth2
```

### Criando Tags

```bash
# Tag anotada (recomendado)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Listar tags
git tag

# Ver detalhes de uma tag
git show v1.0.0
```

## Rebase vs Merge

### Quando usar Rebase

```bash
# Atualizar feature branch com develop
git checkout feature/my-feature
git rebase develop

# Limpar histórico antes de PR
git rebase -i HEAD~5
```

**Use rebase quando:**
- Atualizar branch de feature
- Limpar histórico de commits
- Manter histórico linear

### Quando usar Merge

```bash
# Merge de feature para develop
git checkout develop
git merge --no-ff feature/my-feature
```

**Use merge quando:**
- Integrar feature em develop/main
- Preservar histórico de branch
- Resolver conflitos complexos

## Git Hooks

### Pre-commit

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linter
npm run lint

# Run tests
npm run test

# Check for console.logs
if git diff --cached | grep -q "console.log"; then
  echo "Error: console.log found in staged files"
  exit 1
fi
```

### Commit-msg

```bash
#!/bin/sh
# .git/hooks/commit-msg

# Validate commit message format
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,50}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "Error: Invalid commit message format"
  echo "Format: <type>(<scope>): <subject>"
  exit 1
fi
```

## Boas Práticas

### ✅ DO

1. **Commits Pequenos e Focados**
   - Um commit = uma mudança lógica
   - Facilita review e rollback

2. **Mensagens Descritivas**
   - Explique o "porquê", não só o "o quê"
   - Use corpo do commit para contexto

3. **Teste Antes de Push**
   - Rode testes localmente
   - Verifique linter

4. **Review Próprio Código**
   - Revise suas mudanças antes de PR
   - Use `git diff` para verificar

5. **Mantenha Histórico Limpo**
   - Rebase antes de PR se necessário
   - Squash commits relacionados

### ❌ DON'T

1. **Commits Gigantes**
   - Não commite 1000+ linhas de uma vez
   - Divida em commits lógicos

2. **Mensagens Vagas**
   - Não: "fix bug"
   - Sim: "fix(transactions): validate balance before transfer"

3. **Commit de Código Quebrado**
   - Sempre teste antes de commit
   - Use `git stash` se precisar salvar trabalho incompleto

4. **Force Push em Branches Compartilhadas**
   - Nunca `git push --force` em main/develop
   - Use `--force-with-lease` se absolutamente necessário

5. **Ignore PRs**
   - Não faça push direto para main/develop
   - Sempre use Pull Requests

## Comandos Úteis

```bash
# Ver histórico bonito
git log --oneline --graph --all

# Ver mudanças staged
git diff --cached

# Adicionar parte de arquivo
git add -p

# Corrigir último commit
git commit --amend

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Limpar mudanças não commitadas
git clean -fd
git reset --hard

# Ver quem mudou uma linha
git blame arquivo.ts

# Encontrar bug com binary search
git bisect start
git bisect bad  # commit atual é bad
git bisect good v1.0.0  # commit antigo que funcionava

# Cherry-pick commit específico
git cherry-pick abc123
```

## Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Lembre-se**: Um bom histórico de Git é documentação que viaja com o código!

