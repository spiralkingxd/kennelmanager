# Design — Auditoria de Segurança (Fase 1: Discovery)

**Data:** 2026-07-03
**Status:** Aprovado pelo usuário (pre-aprovação geral em vigor)
**Sub-spec:** 1 de 3 (auditoria descoberta → suíte automatizada → correções)
**HEAD base:** `0811cb0`

## 1. Resumo Executivo

Produzir um **inventário auditado, priorizado e verificável** de vulnerabilidades reais no codebase atual do `kennelmanager-pro`, focado nos 11 módulos com superfície de mutação. **Não executar correções neste sub-spec** — apenas mapear achados com severidade (Crítico/Alto/Médio/Baixo), reproduzir os reproduzíveis e produzir um relatório em `docs/security/AUDIT-2026-07-03.md` que orientará os sub-specs 2 (suite automatizada de regressão) e 3 (correções).

Entregas deste sub-spec:
1. Relatório de achados em `docs/security/AUDIT-2026-07-03.md` (canonical, commitado).
2. Lista de reprodução (PoC) anexada ao relatório para cada achado **High/Critical** demonstrável.
3. Mapa de gaps de teste por categoria de vulnerabilidade (entrada para sub-spec 2).

## 2. Escopo

### 2.1 Módulos auditados (11 com mutação)

Incluídos (escrita em DB, alteração de estado, exposição de PII/dados financeiros):

| Módulo | Por que entra | Onde olhar |
|---|---|---|
| `auth` | login, JWT, sessions | `src/modules/auth/*` |
| `users` | roles, reset password, isolamento | `src/modules/users/*` |
| `clients` | PII de clientes, bulkDelete | `src/modules/clients/*` |
| `client_interactions` | histórico de ações do cliente | `src/modules/client_interactions/*` |
| `animals` | núcleo do produto, dados de pets | `src/modules/animals/*` |
| `litters` | relacionamentos, vínculos de venda | `src/modules/litters/*` |
| `litter_health_events` | dados de saúde (PII-adjacente) | `src/modules/litter_health_events/*` |
| `health` | prontuário, eventos | `src/modules/health/*` |
| `financial` | receita/despesa, dados sensíveis | `src/modules/financial/*` |
| `installments` | parcelas, regras de tolerância | `src/modules/installments/*` |
| `sales` | funil + integração financeira | `src/modules/sales/*` |

### 2.2 Módulos excluídos nesta fase

| Módulo | Razão |
|---|---|
| `calendar` | read-majority (mutação trivia), auditado no passado | fica para sub-spec 3 se houver achados |
| `notifications` | read-mark, já demonstrado seguro | idem |
| `audit_log` | append-only | idem |
| `documents` | upload meta, mas ver 2.3 | incluído via scan geral, não revisão profunda |
| `message_templates` | templates internos (gerenciados, não user-input) | idem |
| `puppies` | delegates para `litters` para escrita | cobrir via `litters` |
| `system_config` | admin-only, mutação rara | scan geral |

### 2.3 Áreas transversais auditadas (não por módulo)

- `src/expressApp.ts` — bootstrap, ordem de middleware
- `src/shared/middlewares/*` — auth, csrf, audit, errorHandler
- `src/shared/utils/adminHelpers.ts` — `isolationUserId`
- `src/config/rateLimiters.ts` — limites em rotas state-changing
- `src/shared/validation/*` — schemas Zod nas bordas
- `src/components/**` — fronts React 19 (foco XSS)
- `package.json` + `package-lock.json` — supply chain
- `SECURITY.md` — gaps entre o que o doc promete e o que o código entrega
- `.env.example` — superfície de configuração

### 2.4 Vetores cobertos

Mapeamento direto para a taxonomia OWASP Top 10:2025 + Regras Express (security-best-practices):

- **A01 — Broken Access Control**: IDOR (rotas com `isolationUserId` faltando), escalonamento de privilégio, forçar role em body/query
- **A02 — Security Misconfiguration**: CORS permissivo, trust proxy, cookies, headers
- **A03 — Supply Chain**: CVEs em pacotes não pinados, integridade do lockfile
- **A05 — Injection**: SQLi (string concat vs parametrizado), NoSQL/JSON-as-query (sondagem), command (sondagem em edge cases)
- **A06 — Insecure Design**: business-logic (ex.: resetPassword, bulk delete, mass export)
- **A07 — Authentication Failures**: força bruta, JWT alg confusion, expiração, refresh
- **A08 — Integrity Failures**: CSRF (cookie-auth), mudanças em config; verificação de payload
- **A09 — Logging & Alerting**: auditoria (audit middleware), vazamento em logs
- **A10 — Exceptional Conditions**: fail-open em auth/validação/Zod schemas

Vetores específicos em escopo (todos já mapeados nos skills carregados):
- **XSS** (refletido, armazenado, DOM-based via dangerouslySetInnerHTML)
- **SQLi** (qualquer string concat em queries SQL)
- **SSRF** (qualquer fetch com URL derivada de usuário)
- **XXE / XML**: presumido zero (sem parser XML visível); **escanear e registrar**
- **Open Redirect** (qualquer `res.redirect` com input user-controlled)
- **Path Traversal** (qualquer `res.sendFile`/`fs` com path user-controlled)

### 2.5 Fora de escopo (documentado mas não escrito)

- **Correções**: vão para o sub-spec 3.
- **Suíte automatizada nova**: vai para o sub-spec 2.
- **Pentest ativo**: execução de comandos de ataque contra instâncias Supabase reais (depende de aprovação separada).
- **Auditoria de infraestrutura cloud (Vercel/Supabase config)**: requer credenciais e acesso ao dashboard; vai para tarefa separada fora desta decomposição.
- **Auditoria de DevTools e bundler**: irrelevante para o produto.

## 3. Metodologia

Fases alinhadas com workflow `security-audit` (Phase 1–5), adaptadas para um achado-estático no código:

### Fase A — Reconhecimento de código (Recon forense estático)

- Mapear surface attack por arquivo: para cada controller, listar rotas, métodos, validators, chamadas de repo.
- Confirmar pipeline de middlewares em `expressApp.ts` na ordem exata (auth → audit → csrf → rate-limit).
- Confirmar `trust proxy` settings.
- Confirmar CORS allowlist e tratamento de credentials.

### Fase B — Descoberta por padrões

- Grep regulado para padrões inseguros por regra (abaixo).
- Cada hit é uma *hipótese de achado*, não um achado pronto.
- Cada hipótese é verificada por leitura e/ou reprodução mínima.

Patterns a varrer (com regras EXPRESS-INJECT-*, EXPRESS-XSS-*, etc da referência):

```text
Concatenação SQL        :  "(\\b(SELECT|INSERT|UPDATE|DELETE)\\b[^;]*['\"`]\\s*\\+|\\$\\{[^}]*req\\.)"
Open redirect           :  res\\.redirect\\(.*(req\\.query|req\\.body|req\\.params)
XSS via dangerouslySet   :  dangerouslySetInnerHTML
XSS via raw HTTP render  :  res\\.send\\([^)]*req\\.
URL user → fetch        :  (fetch|axios|got)\\(.*(req\\.query|req\\.body|req\\.params)
JWT alg                 :  algorithm\\s*:\\s*['\"`]none['\"`]
trust proxy true        :  trust proxy.*true
CORS wildcard           :  origin.*\\*
isolationUserId ausente :  controllers/* onde req.user.id é usado sem isolationUserId
```

### Fase C — Análise

- Confirmar hipoteses em contexto (ler arquivo inteiro, não só o trecho).
- Para cada achado, aplicar o formato canônico (item 4).
- Para cada achado **High/Critical demonstrável sem dependência externa**, anexar PoC.
- Para achados que requerem runtime real (ex.: força bruta), descreva pré-condições e o que validaria o achado em CI.

### Fase D — Relatório

- Consolidar em `docs/security/AUDIT-2026-07-03.md`.
- Adicionar sumário executivo + tabela de achados por severidade.
- Cada achado recebe ID local (formato `AUDIT-IDOR-01` etc.) e cross-reference ao sub-spec 3.

### Fase E — Entrega

- Commit do relatório + este spec + changelog curto.
- Notificar o usuário (mesmo sob pre-aprovação): relatório fica visível para revisão visual.

## 4. Formato dos Achados

Cada achado segue o formato da regra §2.3 de `EXPRESS-*` (mutuável do security-best-practices):

```markdown
### FIND-ID-001 — <Título>
- **Rule ID:** EXPRESS-* (ou N/A se business-logic)
- **Severity:** Critical | High | Medium | Low
- **Location:** src/modules/<mod>/controller.ts:L<N>-L<M>
- **Evidence:** <trecho exato>
- **Impact:** <o que pode dar errado, quem pode explorar>
- **Reproduction:** <passos ou PoC — mínimo viável>
- **Fix:** <mudança ideal, scoped a esse achado>
- **Mitigation:** <defesa em profundidade se o fix imediato for inviável>
- **Sub-spec destino:** 2 (suite) | 3 (correção) | ambos | nenhum (informativo)
```

## 5. Mapa de testes atuais (entrada para sub-spec 2)

Sub-produto obrigatório deste sub-spec: ao final, dentro de `docs/security/AUDIT-2026-07-03.md`, uma seção intitulada **"Test Coverage Gaps"** contendo uma tabela no formato:

| Categoria | Testes existentes | Gaps a fechar (sub-spec 2) |
|---|---|---|
| SQLi param. | n/a | … |
| IDOR multi-tenant | `tests/waitlist-isolation.spec.ts` (existe) | estender para 11 módulos |
| XSS armado | nenhum | … |
| CSRF | parcial | … |
| Brute force | nenhum | … |
| JWT expiry/algo | nenhum | … |
| Open redirect | nenhum | … |
| … | … | … |

Isso permite o sub-spec 2 consumir um mapa concreto de "que testes faltam onde" em vez de inventá-los.

## 6. Critérios de Sucesso (DoD)

- [ ] `docs/security/AUDIT-2026-07-03.md` commitado.
- [ ] Sumário executivo + tabela por severidade no topo.
- [ ] Cada achado **High** e **Critical** tem proof-of-concept reproducible sem dependência externa.
- [ ] Cada achado **Medium** tem evidence; reproduction é opcional.
- [ ] Cada achado **Low** é somente lista, sem PoC nem reprodução.
- [ ] Mapa de gaps de teste anexado.
- [ ] Cada achado indica o sub-spec destino (2 ou 3).
- [ ] Nenhum segredo real (paths absolutos) nem valores de credenciais no relatório.
- [ ] Nenhum arquivo `.env` ou similar commitado (já garantido pelo `.gitignore`).
- [ ] Limite do achado priorizado por `Risk = Likelihood × Impact` (CVSS-like), não só severidade nominal.

## 7. Não-Objetivos

- Não criar testes automatizados aqui (sub-spec 2).
- Não corrigir vulnerabilidades aqui (sub-spec 3).
- Não auditar dashboards Supabase/Vercel (fora do projeto code-wise).
- Não instalar novas dependências só para o audit (skills carregadas, sem mais).

## 8. Riscos & Restrições

- **Stack limitado a leitura estática**: achados de timing/race/dep precisam de runtime. Quando isso acontecer, escrever condição `<runtime-conditional>` no PoC e marcar sub-spec 2 ou um CI gate como caminho de validação.
- **Falsos positivos**: orchestrator declara baseline (regras *podem* ser mitigadas em outra camada). Cada achado High/Critical cita o que *foi verificado* vs *presumido*.
- **Local-only scan**: `npm audit`, `eslint-plugin-security`, ou qualquer scan dinâmico fica como ação opcional no final (comando único), não compromiso.

## 9. Sequenciamento interno

Tasks dentro deste sub-spec:

1. Carregar skills-base (security-audit, top-web-vulns, vulnerability-scanner, security-best-practices, regra Express). — **concluído**
2. Mapear superfície de ataque por controller dos 11 módulos: rotas, métodos, validators, chamadas de repo.
3. Fase B (grep regulado) pelos padrões da §3/Fase B.
4. Fase C (verificação manual por leitura em contexto de cada hit + reprodutibilidade).
5. Compor `docs/security/AUDIT-2026-07-03.md` com tabela canônica + Test Coverage Gaps.
6. Self-review do relatório (placeholders resolvidos em Finding; IDs consistentes; cross-ref para sub-specs).
7. Commit final + notificar.

## 10. Handoff para sub-specs seguintes

- **Sub-spec 2** consome: gaps map (item 5) + lista de achados com `sub-spec destino: ambos`.
- **Sub-spec 3** consome: tabela de achados + PoC + fix recomendado por achado.

Esse contrato fecha as fases: discovery produz input para os dois próximos em uma única passagem.

---

**Assinatura:** Spec pré-aprovado pelo usuário em 2026-07-03 via comando "preaprovo qualquer design gerado". Implementação não se inicia antes do `writing-plans` skill ser invocada e um plano itemizado existir.
