# Auditoria de Segurança — Plano de Implementação (Sub-spec 1 de 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) ou superpowers:executing-plans para implementar este plano. Steps em checkbox (`- [ ]`) para tracking.

**Goal:** Produzir `docs/security/AUDIT-2026-07-03.md` com achados reais, priorizados (Crítico/Alto/Médio/Baixo), em 11 módulos com superfície de mutação, cobrindo vetores do OWASP Top 10:2025 + regras EXPRESS-*. Cada achado segue formato canônico (Rule ID, Severity, Location, Evidence, Impact, Reproduction, Fix, Mitigation, Sub-spec destino). Final inclui Test Coverage Gaps para input do sub-spec 2.

**Architecture:** Skill-driven static audit. Carrega `security-audit`/`top-web-vulnerabilities`/`vulnerability-scanner`/`security-best-practices`/`xss-html-injection`/`sql-injection-testing` sob demanda por categoria. Discovery regulado: mapeamento de superfície → grep regulado → verificação manual em contexto → composição do relatório. Sem código de produto escrito neste plano; somente discovery e documentação.

**Tech Stack:** Node 24, TypeScript 5.8, Express 4.22, PostgreSQL via Supabase. Ferramentas de inspeção: ripgrep (rg), Read, Grep, Glob. Sem novas dependências.

## Global Constraints

- Somente leitura no código de produto. **Nenhum arquivo de produto modificado** neste sub-spec.
- Saída canônica: `docs/security/AUDIT-2026-07-03.md` em `docs/` (não vai para git por `.gitignore`); publicar a versão commitada via `git add -f` ao final.
- **Não** executar `npm audit`, `eslint-plugin-security`, ou scans dinâmicos sem autorização; inscritos como ação opcional (§6 do design).
- **Não** tocar `.env`, `package.json`, `package-lock.json`, ou qualquer arquivo fora de `docs/security/` e `docs/superpowers/plans/`.
- IDs locais de achado: `FIND-<CATEGORIA>-NN`, onde CATEGORIA ∈ {AUTH, IDOR, INJECT, XSS, CSRF, SSRF, REDIR, TRAV, SESS, CORS, CRYPTO, MISC, SUPPLY, DOS, DESERIAL}.
- Severidade: Crítica / Alta / Média / Baixa.
- Severidade calculada como proxy de CVSS-like: `Risk = Likelihood × Impact` (declarado por achado), não apenas nominal.
- Formato canônico de achado: §4 do design.
- Quando uma categoria de vetor não apresentar nenhum achado verificável, escrever **negativo explícito** ("Cobertura X — sem achados verificáveis acima de Baixa") no relatório, com proof de varrência.

---

## Task 1: Census de superfície — 11 controllers mutantes

**Files:**
- Create: `docs/security/audit-scratch/surface-census.md` (apenas rascunho local — **NÃO** commitar)
- References: o resultado deste census vira Tabela A do relatório.

**Interfaces:**
- Consumes: estrutura do projeto (lida via Bash + Glob + Grep nas tasks anteriores).
- Produces: tabela de superfície — módulo/controller, rotas (método + path), validators aplicados (Zod schema?), repository chamado, autenticação aplicada (auth middleware?), isolationUserId(req) presente? (sim/não/N/A para sem mutação).

- [ ] **Step 1.1: Mapear controllers mutantes**

Para cada módulo em {auth, users, clients, client_interactions, animals, litters, litter_health_events, health, financial, installments, sales}:
- Localizar arquivos de controller (tipicamente `src/modules/<mod>/controller.ts` ou rounter).
- Listar cada função exportada de controller e extrair:
  - método HTTP
  - path da rota
  - schema Zod aplicado (se houver — olhar em `schema.ts` ou inline)
  - linhas 1–3 de cada controller

Comando genérico a se adaptar por módulo:
```bash
rg -n "router\.(get|post|put|delete|patch)\b" src/modules/<mod>/router.ts 2>/dev/null || \
rg -n "(get|post|put|delete|patch)\b" src/modules/<mod>/controller.ts
```

- [ ] **Step 1.2: Para cada rota, anotar 4 booleanos**

| Rota | Zod presente? | auth(?)? | isolationUserId(req)? | repository usa NULL-guard? |
|---|---|---|---|---|

- [ ] **Step 1.3: Salvar rascunho local**

Escrever a tabela completa em `docs/security/audit-scratch/surface-census.md`. Não commitar.

---

## Task 2: Grep regulado por vetor

**Files:**
- Create: `docs/security/audit-scratch/grep-results.md` (rascunho local — **NÃO** commitar; vira Tabela Hipóteses no relatório).

**Patterns regulados:**

Executar cada um com `rg -n "<padrão>" src/`. Listar hit por hit com file:line e 1 linha de contexto.

- [ ] **Step 2.1: SQL injection (string concat)**

```bash
rg -n "(\b(SELECT|INSERT|UPDATE|DELETE)\b[^;]*['\"`]?\s*(\+|\$\{))" src/
```
Hipótese: query SQL montada por concatenação.

- [ ] **Step 2.2: SQL injection (template literal)**

```bash
rg -n "\\\`.+\\\\$\\{(req|.*Query|.*Params)|\\\`.+(req\\.|params\\.|query\\.)" src/
```

- [ ] **Step 2.3: Open redirect**

```bash
rg -n "res\.redirect\(" src/
```

- [ ] **Step 2.4: XSS no frontend (dangerouslySetInnerHTML / raw HTML)**

```bash
rg -n "dangerouslySetInnerHTML|innerHTML\s*=|document\.write" src/
```

- [ ] **Step 2.5: SSRF (URL user → fetch outbound)**

```bash
rg -n "(fetch|axios|got|node-fetch)\s*\(\s*[^)]*req\." src/
```

- [ ] **Step 2.6: Path traversal (fs/sendFile/res.download)**

```bash
rg -n "(sendFile|download|readFile|createReadStream)\s*\(" src/
```

- [ ] **Step 2.7: JWT algorithm confusion**

```bash
rg -n "algorithm\s*:\s*['\"`]?(none|HS256|RS256)['\"`]?\s*[;,)]" src/
```

- [ ] **Step 2.8: trust proxy**

```bash
rg -n "trust proxy" src/
```

- [ ] **Step 2.9: CORS wildcard**

```bash
rg -n "origin\s*[:=]\s*['\"`]\*['\"`]" src/
```

- [ ] **Step 2.10: isolationUserId ausente sob suspeita**

Para cada rota onde `req.user.id` ou `req.user?.id` aparece, conferir se o controller chama `isolationUserId(req)` ou se a query do repository já filtra via `userId`:

```bash
rg -n "req\.user(\.id|\?\.id)" src/modules/
```

Lista de hits = hipóteses. Validar cada uma manualmente.

- [ ] **Step 2.11: Registrar output em rascunho**

Cada grep: agrupar hits por file:line + categoria. Anotar quais são hits genuínos vs framework-builtin (ex.: `helmet()` ativando trust proxy). Salvar em `docs/security/audit-scratch/grep-results.md`.

---

## Task 3: Verificação manual em contexto + classificação

**Files:**
- Modify: `docs/security/audit-scratch/grep-results.md` (anotações se adicionam)
- Create: hipóteses são elevadas a achados finais durante esta task; os achados em si vão no relatório.

**Por cada hit de Task 2 que sobreviveu como hipótese genuína:**

- [ ] **Step 3.1: Ler o arquivo inteiro, não só o hit**

Usar Read. O contexto importa: a regra pode estar mitigada em outra parte daquele mesmo arquivo (ex.: um `try/catch` que sanitiza; um helper bypass).

- [ ] **Step 3.2: Confirmar ou refutar a hipótese**

- **Confirmada** → promover a achado: anotar ID + severity + location + evidence (trecho) + impacto esperado.
- **Refutada** → excluir com nota no rascunho (motivo: framework-builtin / mitigado upstream / falso positivo / não-aplicável).

- [ ] **Step 3.3: Para cada achado confirmado, atribuir Risk = Likelihood × Impact**

- Likelihood ∈ {baixa, média, alta}:
  - **Alta** se autenticado-anônimo, ou rota de API pública
  - **Média** se autenticado-usuário comum
  - **Baixa** se requer role específica (admin) e privilege é auditado
- Impact ∈ {baixo, médio, alto}:
  - **Alto** se PII/financeiro/secredo
  - **Médio** se dados de usuário único
  - **Baixo** se apenas nuisance (ex.: log speculation)

Mapeamento Result → Severity:
- HH = Crítica
- HM, MH = Alta
- HL, MM, LM = Média
- LL, LH (raro) = Baixa

- [ ] **Step 3.4: Para cada Crítica + Alta, rascunhar PoC mínimo**

Apenas Crítica + Alta recebem prova de conceito. Formato:
```markdown
- Reproduction:
  1. (pré-condição)
  2. enviar: <curl/test snippet com auth-context>
  3. observar: <esperado invasivo>
```

Para achados de runtime que não dá pra reproduzir estaticamente: marcar `runtime-conditional: <gate>` e indicar que o sub-spec 2 cobre.

---

## Task 4: Varrer categorias que grep não cobre diretamente

- [ ] **Step 4.1: Auth brute force**

Verificar `src/modules/auth/*` para:
- `express-rate-limit` no router de autenticação: `rg -n "rateLimit|rate-limit" src/modules/auth/`
- Se ausente, achado: `FIND-AUTH-NN — auth sem rate-limitador dedicado` (Mediana dependente de exposição global).

- [ ] **Step 4.2: JWT lifecycle**

Procurar:
- expiração do token: `rg -n "expiresIn|exp\s*[=:]|jwt\.sign" src/modules/auth/`
- rotação de refresh (se houver)
- claims padrões (alg=none, não-assinado)

- [ ] **Step 4.3: Cookie flags (se aplicável)**

```bash
rg -n "res\.cookie\s*\(|cookie\s*:\s*\{" src/
```

- [ ] **Step 4.4: CSRF aplicação de origem/referer**

Verificar `src/shared/middlewares/csrf.ts`:
- que tipo de token
- aplicação por rota ou global
- bypass em rotas de mutação?

- [ ] **Step 4.5: Logging sanitization (PII/secrets)**

```bash
rg -n "console\.log|logger\.(info|debug|warn|error)" src/
```
Conferir se há redaction (`src/shared/utils/redact.ts` existe; ver se é aplicado).

- [ ] **Step 4.6: Supply chain (qualitativo)**

```bash
rg -n "\^\s*[\"'](\d+)\." package.json
```
Pacotes não pinados (com caret) que tocam superfície de segurança: listar.

---

## Task 5: Compor `docs/security/AUDIT-2026-07-03.md`

**Files:**
- Create: `docs/security/AUDIT-2026-07-03.md`

**Estrutura do relatório:**

- [ ] **Step 5.1: Cabeçalho**

```
# Auditoria de Segurança — 2026-07-03

- Spec: docs/superpowers/specs/2026-07-03-security-audit-design.md
- Plano: docs/superpowers/plans/2026-07-03-security-audit-plan.md (este)
- Sub-spec: 1 de 3
- HEAD auditado: 0811cb0
- Janela de análise: discovery estático, sem execução de ataques

## Sumário Executivo

<Narrativa curta: principais riscos, achados Críticos/Altos em destaque, o que já está sólido.>

## Tabela por Severidade

| ID | Rule ID | Severidade | Localização | Categoria |
|
```

- [ ] **Step 5.2: Tabela de Test Coverage Gaps** (entregável para sub-spec 2)

| Categoria | Teste atual | Gap a fechar (sub-spec 2) |
|---|---|---|
| (populate conforme constatação de Task 3) | | |

- [ ] **Step 5.3: Achados detalhados — usar template canônico**

Cada achado da Task 3 confirmado, em formato §4 do design:
```markdown
### <ID> — <título>
- **Rule ID:** EXPRESS-XYZ-001 (ou N/A se business-logic)
- **Severity:** Crítica / Alta / Média / Baixa
- **Risk:** L=I/M/A × I=B/M/A → resultado
- **Location:** path:linhas
- **Evidence:** <snippet>
- **Impact:** <afirmação>
- **Reproduction:** <passo a passo curto, ou "runtime-only: ver §Test Coverage Gaps">
- **Fix:** <recomendação prática>
- **Mitigation:** <defesa em profundidade>
- **Sub-spec destino:** 2 (suite) | 3 (correção) | ambos | informativo
```

- [ ] **Step 5.4: Cobertura nula (negativos explícitos)**

Para categorias onde o grep não produziu hits genuínos e a varredura manual não confirmou: registrar uma linha explícita:
```markdown
- **XXE / XML**: sem achado. Não há parser XML customizado no código.
- **OS Command Injection**: sem achado. Sem uso de `child_process` no código de produto.
- **Insecure Deserialization**: sem achado. Sem uso de `eval`/`new Function`/`node-serialize`.
```

- [ ] **Step 5.5: Achados remanescentes (baixa severidade)**

Lista compacta — uma linha por achado Baixo com caminho.

---

## Task 6: Self-review do relatório

- [ ] **Step 6.1: Placeholder scan no relatório final**

Procurar:
- TBD / TODO / FIXME / `<...>` / `[ incertidumbre ]`
- Achados Críticos/Altos sem PoC ou runtime-gate
- Categorias ausentes sem negativo explícito

- [ ] **Step 6.2: Consistência interna**

- Severidades batem com Risk declarado?
- IDs únicos? (Cada achado um ID distinto; Categoria-NN sequencial dentro de uma categoria)
- Localização (file:line) bater com o snippet de evidence?
- Cross-ref sub-specs faz sentido? (ex.: achado de IDOR → 3; achado que infere falta de teste → 2)

- [ ] **Step 6.3: Cobertura do escopo do spec**

Do spec (sub-spec 1, §2.2), conferir se as 11 áreas foram varridas:
- [ ] auth · users · clients · client_interactions · animals · litters · litter_health_events · health · financial · installments · sales

Resolver gaps: voltar à Task 4 para a área não varrida.

---

## Task 7: Commit final + notificar

- [ ] **Step 7.1: Adicionar e commitar o relatório**

```bash
git add -f docs/security/AUDIT-2026-07-03.md
git commit -m "docs(audit): relatorio de descoberta 2026-07-03

Mapa de achados dos 11 modulos com superficie de mutacao. Inclui
cobertura por categoria OWASP Top 10:2025, negativos explicitos
para vetores sem achado, e Test Coverage Gaps para input do
sub-spec 2 (suite automatizada)."
```

- [ ] **Step 7.2: Adicionar este plano ao git**

```bash
git add -f docs/superpowers/plans/2026-07-03-security-audit-plan.md
git commit -m "docs(plan): plano de implementacao do sub-spec 1

Auditoria descoberta sem codigo de produto adicionado. Apenas
discovery e documentacao. Tasks 1-5 varrem superficie, padronizam
achados; Task 6 self-review; Task 7 publica."
```

- [ ] **Step 7.3: Remover rascunhos locais (não-recursivos)**

```bash
rm -rf docs/security/audit-scratch
```

Esses rascunhos não devem ser commitados; servem apenas como buffer durante a auditoria.

- [ ] **Step 7.4: Notificar**

Emitir mensagem final ao usuário com:
- Resumo de achados por severidade (contadores Crítica/Alta/Média/Baixa)
- Top 3 achados mais sensíveis (com Rule ID + caminho)
- Status do handoff para sub-spec 2 e sub-spec 3
- Local de leitura: `docs/security/AUDIT-2026-07-03.md`

---

## Self-Review do plano (skill `writing-plans`)

- [x] **Spec coverage:**
  - Audit-role-only (sem código de produto) — §2 do spec, refletido na Task 1–5 ✅
  - 11 módulos listados em §2.1 → Tasks 1.1 ✅
  - Vetores OWASP em §2.4 → Task 2 (grep regulado) ✅
  - Formato de achado §4 → Task 5.3 ✅
  - Test Coverage Gaps para sub-spec 2 → Tasks 5.2 ✅
  - DoD §6 → Tasks 6 + 7 ✅
  - Nenhum veto de correção/sub-spec 2 aqui → Task 7.4 faz handoff
- [x] **Placeholder scan:** Tarefas com snippet de código/comando real, sem "TODO". Tasks 4.1–4.6 têm critérios verificáveis inline.
- [x] **Type/name consistency:** IDs na forma `FIND-<CATEG>-NN`. Regra de severidade HH⁻¹ define o mapping Risk → Severity global. Único delivrável (relatório) tem só uma assinatura: `docs/security/AUDIT-2026-07-03.md`.
- [x] **No "implement later" ou similar:** substituídos por tarefas discretas com entrega.
