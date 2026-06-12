# KennelManager Pro

Sistema web completo de gestão de canil/gatil profissional. Cadastro genealógico do plantel, ciclo reprodutivo, saúde individual, CRM de clientes com funil de vendas, controle financeiro, calendário unificado e auditoria completa.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnol%C3%B3gica)
- [Pré-requisitos](#pr%C3%A9-requisitos)
- [Instalação](#instala%C3%A7%C3%A3o)
- [Configuração](#configura%C3%A7%C3%A3o)
- [Compilação e Execução](#compila%C3%A7%C3%A3o-e-execu%C3%A7%C3%A3o)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura e Funcionamento](#arquitetura-e-funcionamento)
- [Comandos Úteis](#comandos-%C3%BAteis)

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Plantel** | Cadastro completo de animais com pedigree, microchip, registro, fotos, temperamento e status reprodutivo. Suporte a múltiplas raças. |
| **Clientes** | CRM completo com histórico de interações (WhatsApp, telefone, e-mail, visita, redes sociais), preferências e funil de compra. |
| **Funil de Vendas** | Pipeline da lead (LEAD → NEGOTIATING → ACTIVE_RESERVATION → COMPLETED). Automação financeira ao concluir venda. |
| **Ninhadas** | Gestão de cruzamentos, gestação, parição e desmame. FSM de status: PLANNED → CONFIRMED → BORN → WEANING → COMPLETED. |
| **Filhotes** | Controle individual com status (AVAILABLE, RESERVED, SOLD, RETAINED, DEAD) e automação para o funil de vendas. |
| **Financeiro** | Receitas e despesas categorizadas com controle de parcelamentos, upload de comprovantes e status (PAID, PENDING, OVERDUE, CANCELLED). |
| **Calendário** | Eventos com suporte a recorrência, categorizados em saúde, reprodução, ninhada, financeiro, visitas e exposições. |
| **Saúde** | 9 sub-módulos completos: Vacinas, Vermífugos, Exames, Consultas, Medicações, Peso, Cios, Acasalamentos, Gestações. |
| **Lista de Espera** | Clientes aguardando filhotes disponíveis por raça, cor e características. Notificação automática quando um filhote compatível é cadastrado. |
| **Usuários e Permissões** | 6 papéis de acesso: ADMIN, CRIADOR, VET, COMMERCIAL, FINANCIAL, READONLY. |
| **Auditoria** | Log completo de todas as ações (criação, atualização, exclusão, visualização, login/logout, reset de senha). |
| **Notificações** | Alertas automáticos de saúde, reprodução, financeiro, vendas e match de lista de espera. |
| **Documentos** | Upload de pedigree, certificados, laudos, contratos de compra e venda, fotos. |

### Automações

- Filhote marcado como **SOLD** → cria automaticamente entrada no Funil de Vendas com status COMPLETED
- Funil concluído (**COMPLETED**) → cria automaticamente lançamento financeiro do tipo INCOME, categoria SALE, status PAID
- Exclusão de venda → libera automaticamente o filhote de volta para AVAILABLE (se não estiver SOLD)

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4 |
| **Backend** | Express 4, Node.js 20+, TypeScript |
| **Banco** | PostgreSQL 16 (Supabase) com Row Level Security |
| **Validação** | Zod 4 (runtime validation) |
| **Autenticação** | JWT com refresh tokens rotativos + httpOnly cookies |
| **Segurança** | Helmet (CSP, HSTS, COOP, CORP), express-rate-limit, CSRF |
| **UI/UX** | Lucide React, Recharts, Motion |
| **Logs** | Winston com redação automática de dados sensíveis (LGPD) |
| **API** | Swagger/OpenAPI 3.0 via swagger-jsdoc |
| **Upload** | Multer com validação de magic bytes e limite de 10MB |

---

## Pré-requisitos

- **Node.js** 20 ou superior
- **PostgreSQL** 16 ou superior (recomendado: Supabase)
- **npm** 10 ou superior
- **(Opcional)** Conta na Vercel para deploy

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/kennelmanager-pro.git
cd kennelmanager-pro

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
```

---

## Configuração

Edite o arquivo `.env` com suas credenciais:

### Conexão com o banco (Supabase)

```env
DATABASE_URL="postgresql://postgres:SENHA@db.SEU_PROJETO.supabase.co:5432/postgres"
```

Onde conseguir: Supabase → Settings → Database → Connection string → URI

### JWT Secret

```env
JWT_SECRET="sua-chave-com-pelo-menos-32-caracteres-aqui"
```

Deve ser uma chave forte (32+ caracteres). Pode gerar com: `openssl rand -base64 32`

### CORS

```env
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
```

Em produção, defina o domínio real do seu site.

### Usuário Admin

O administrador do sistema é gerenciado diretamente pelo banco de dados. O primeiro admin pode ser criado via SQL migration ou pela interface de usuários do sistema (após login com um admin existente). Usuários com papel `ADMIN` e coluna `is_protected = TRUE` são protegidos contra exclusão e alterações indevidas.

### Resumo de todas as variáveis

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ Sim | String de conexão PostgreSQL |
| `JWT_SECRET` | ✅ Sim | Chave secreta JWT (32+ chars) |
| `CORS_ORIGINS` | ❌ Não | Origens permitidas separadas por vírgula |
| `NODE_ENV` | ❌ Não | `development` (padrão) ou `production` |

---

## Compilação e Execução

### Desenvolvimento (com hot reload)

```bash
npm run dev
```

Acesse: **http://localhost:3000**
Swagger: **http://localhost:3000/api/docs**

### TypeScript check

```bash
npm run typecheck
```

### Build de produção

```bash
npm run build
```

Isso gera:
- `dist/` → Frontend estático (HTML, CSS, JS minificado)
- `dist/server.cjs` → Servidor Express em CommonJS listo para produção

### Produção local

```bash
npm run start
```

Antes de executar em produção, certifique-se de que:
- `NODE_ENV=production` está definido
- `APP_URL` está configurada (obrigatório em produção)
- `CORS_ORIGINS` não contém `*` (rejeitado em produção)

### Testes

```bash
# Testes unitários (Jest)
npm run test:unit

# Testes E2E (Playwright)
npm test

# Cobertura
npm run test:coverage
```


---

## Estrutura do Projeto

```
kennelmanager-pro/
├── src/
│   ├── components/           # Componentes React
│   │   ├── admin/            # Painel de administração
│   │   ├── auth/             # Login e autenticação
│   │   ├── calendario/       # Calendário de eventos
│   │   ├── clientes/         # CRM de clientes
│   │   ├── dashboard/        # Dashboard com KPI e gráficos
│   │   ├── ninhadas/         # Gestão de ninhadas
│   │   ├── plantel/          # Cadastro de animais
│   │   ├── reproducao/       # Ciclo reprodutivo
│   │   ├── saude/            # Módulo de saúde
│   │   └── vendas/           # Financeiro e vendas
│   ├── config/               # Configurações (multer, swagger, rate-limit)
│   ├── hooks/                # Hooks React (useAuth)
│   ├── modules/              # Backend — módulos por domínio
│   │   ├── animals/          # CRUD de animais
│   │   ├── auth/             # Autenticação e refresh token
│   │   ├── calendar/         # Eventos de calendário
│   │   ├── clients/          # CRM de clientes
│   │   ├── financial/        # Transações financeiras
│   │   ├── health/           # Saúde (vacinas, exames, etc.)
│   │   ├── litters/          # Ninhadas
│   │   ├── puppies/          # Filhotes
│   │   ├── sales/            # Funil de vendas
│   │   └── users/            # Usuários e papéis
│   ├── shared/               # Código compartilhado
│   │   ├── middlewares/      # Auth, error handler, audit
│   │   ├── utils/            # API fetch, redação de dados, helpers
│   │   └── validation/       # Schemas de validação (Zod)
│   └── @types/               # Declarações de tipos globais
├── tests/                    # Testes automatizados
├── schema.sql                # Schema completo do PostgreSQL
├── server.ts                 # Ponto de entrada do servidor
├── vite.config.ts            # Configuração do Vite
└── package.json
```

---

## Arquitetura e Funcionamento

### Fluxo de Dados

```
Navegador → Vite (dev) / CDN (prod)
    ↓
  Express Server (server.ts)
    ↓
  Middleware Pipeline:
    Helmet (CSP, HSTS, CORS)
    → Rate Limiting (global + endpoints específicos)
    → Autenticação JWT (validação Zod)
    → Auditoria (log de ações)
    ↓
  Rotas → Controllers → Services → Repositories → PostgreSQL (Supabase)
    ↓
  Resposta JSON padronizada: { success, message, data, code }
```

### Segurança Implementada

| Camada | Medida |
|--------|--------|
| **Autenticação** | JWT com Zod validation, roles válidas, refresh tokens rotativos com reuse detection |
| **Cookies** | httpOnly, Secure, SameSite=Strict para tokens; CSRF token separado |
| **Banco** | Parâmetros SQL (`$1`, `$2`) — 0% SQL injection possível |
| **Isolamento** | `isolationUserId()` + NULL guard pattern: ADMIN vê todos, usuário só vê seus registros |
| **Rate Limit** | Global (500/15min) + específico por endpoint destrutivo (5-10/15min) |
| **Upload** | Validação de magic bytes, tamanho máximo (10MB), tipos restritos |
| **Logs** | Redação automática de passwords, tokens, emails (LGPD) |
| **Headers** | CSP, HSTS, COOP, CORP, Referrer-Policy, X-Frame-Options |
| **Validação** | Zod schemas com `maxLength` em todos os campos string (DoS protection) |

### Banco de Dados

- **28 tabelas** com chaves estrangeiras e constraints
- **39 enums** para campos categorizados
- **Row Level Security (RLS)** — isolation multi-tenant no nível do banco
- **50 políticas RLS** — permissões granulares por papel de usuário
- **147 índices** para performance de consultas
- **Triggers automáticos** — atualização de contagem de filhotes na ninhada, updated_at automático

### Automações do Sistema

```
Puppy SOLD → Sales (COMPLETED) → Financial (INCOME, PAID)
                                       ↓
                                Notification (SYSTEM alert)
```

---

## Comandos Úteis

```bash
npm run dev            # Inicia servidor de desenvolvimento
npm run build          # Compila para produção
npm run start          # Executa build de produção
npm run typecheck      # Verifica tipos TypeScript
npm run lint           # Verifica qualidade do código
npm run lint:fix       # Corrige problemas automaticamente
npm run format         # Formata código com Prettier
npm run test:unit      # Executa testes unitários (Jest)
npm test               # Executa testes E2E (Playwright)
npm run test:coverage  # Gera relatório de cobertura
```

---

## Licença

Este projeto é privado — uso exclusivo do criador e sua equipe.
