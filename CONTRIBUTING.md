# Contribuindo para o Projeto Loomi Banking

Obrigado por considerar contribuir com o projeto! Este documento fornece diretrizes para contribuições.

## Como Contribuir

1. **Fork o repositório**
2. **Clone seu fork**
   ```bash
   git clone https://github.com/your-username/loomi.git
   ```
3. **Crie uma branch de feature**
   ```bash
   git checkout -b feature/minha-feature
   ```
4. **Faça suas alterações**
5. **Commit suas mudanças**
   ```bash
   git commit -m "feat(users): adiciona nova funcionalidade"
   ```
6. **Push para sua branch**
   ```bash
   git push origin feature/minha-feature
   ```
7. **Abra um Pull Request**

## Código de Conduta

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo:

- Usar linguagem acolhedora e inclusiva
- Respeitar pontos de vista e experiências diferentes
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros

### Comportamentos Inaceitáveis

- Uso de linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos/depreciativos
- Assédio público ou privado
- Publicar informações privadas de outros sem permissão
- Outras condutas consideradas inadequadas profissionalmente

## Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Evite `any`, use tipos específicos
- Use interfaces para objetos complexos
- Documente funções públicas com JSDoc

### NestJS

- Siga padrões do NestJS (modules, controllers, services)
- Use dependency injection
- Implemente DTOs com class-validator
- Use Guards para autenticação/autorização

### Testes

- Escreva testes para novas funcionalidades
- Mantenha cobertura acima de 80%
- Use mocks adequados
- Testes devem ser independentes

### Commits

Siga [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Pull Requests

### Checklist

Antes de submeter um PR, verifique:

- [ ] Código segue style guide
- [ ] Testes escritos e passando
- [ ] Documentação atualizada
- [ ] Sem console.logs ou debuggers
- [ ] Commits seguem convenção
- [ ] PR tem descrição clara

### Template

```markdown
## Descrição

Breve descrição das mudanças.

## Tipo de Mudança

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar

Passos para testar as mudanças.

## Checklist

- [ ] Testes passam localmente
- [ ] Código revisado
- [ ] Documentação atualizada
```

## Reportando Bugs

Use o template de issue para bugs:

**Descreva o bug**
Uma descrição clara e concisa do bug.

**Para Reproduzir**
Passos para reproduzir:
1. Vá para '...'
2. Clique em '....'
3. Veja o erro

**Comportamento Esperado**
Descrição do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [e.g. macOS]
- Node version: [e.g. 20.0.0]
- Docker version: [e.g. 24.0.0]

## Sugerindo Features

Use o template de issue para features:

**A feature resolve um problema?**
Descrição clara do problema.

**Descreva a solução desejada**
Descrição da solução proposta.

**Descreva alternativas consideradas**
Outras abordagens consideradas.

**Contexto Adicional**
Qualquer outro contexto ou screenshots.

## Configuração de Desenvolvimento

### Requisitos

- Node.js 20+
- Docker Desktop
- Git

### Setup

```bash
# Clone
git clone https://github.com/your-org/loomi.git
cd loomi

# Instalar dependências
npm install

# Configurar env
cp services/users/.env.example services/users/.env
cp services/transactions/.env.example services/transactions/.env
cp services/gateway/.env.example services/gateway/.env

# Iniciar infraestrutura
docker-compose up -d

# Executar testes
npm test
```

## Dúvidas?

- Abra uma issue
- Entre em contato: processoseletivo@loomi.com.br

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

Obrigado por contribuir! 🎉

