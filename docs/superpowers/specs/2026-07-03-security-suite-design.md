# Security Test Suite Design — Sub-Spec 2 of 3

> **For agentic workers:** This is the second of three sub-specs. Sub-spec 1 produced `docs/security/AUDIT-2026-07-03.md`. This sub-spec designs a regression suite that locks down the findings before sub-spec 3 corrects them.

**Goal:** Add a regression test suite — Playwright e2e + Jest unit — that covers the 8 gaps from `docs/security/AUDIT-2026-07-03.md §6`, prioritizing H-01 first.

**Architecture:** Tests live under a new dedicated tree `tests/security/` — separate from existing `tests/` modules and root e2e specs. Unit tests use Jest (already configured) with `jest.mock('...pool...')` pattern. E2e uses Playwright (already configured). No new tooling.

**Tech Stack:** Jest 29.x (existing), Playwright 1.x (existing), TypeScript 5.x (existing).

---

## 1. Contexto & Restrições

- **Input primário:** `docs/security/AUDIT-2026-07-03.md` §6 (Test Coverage Gaps) e §2 (achados H-01, M-01, M-02, L-01, L-02).
- **Output primário:** uma sequência nova de testes cobrindo os 8 gaps + correção **documentada** do teste morto já existente em `tests/modules/auth/login.test.ts` (linhas 130-153 — `forgotPassword` describe block).
- **Sem dependências novas:** ferramentas ZAP, Burp, Auth0, etc. fora do escopo.
- **Sem rede contra Supabase real:** testes contra Supabase SaaS quebram em CI. Suite é totalmente local (server Express + pool mockado ou DB supabase local).
- **Mantém isolamento:** não tocar nos 19+ arquivos de teste já commitados (a única exceção é o teste morto `forgotPassword` que será **marcado como skip e comentado** com TODO para sub-spec 3, sem remoção que prejudique build).
- **Compatível TDD:** cada teste é o teste vermelho que falha hoje (porque o gap existe) e fica verde depois que o sub-spec 3 corrigir.

---

## 2. Escopo Comprimido (8 → 6 entregáveis)

| Gap ID do AUDIT | Severidade | Tipo | Arquivo de teste |
|---|---|---|---|
| #3 — H-01 is_protected bypass em reset-password | **High** | E2E Playwright | `tests/security/ido-rreset-password.spec.ts` |
| #1 — Brute force login (ACCOUNT_BLOCKED após 5) | Medium | Unit Jest | `tests/security/__tests__/brute-force.test.ts` |
| #2 — Refresh-token reuse (rotação) | Medium | Unit Jest | `tests/security/__tests__/refresh-reuse.test.ts` |
| #5 — `isolationUserId` edge cases | Medium | Unit Jest | `tests/security/__tests__/isolationUserId.test.ts` |
| #6 + #7 — Recursividade de redact + comportamento do audit sobre body | Low + Medium | Unit Jest | `tests/security/__tests__/redact.test.ts` (extensão) + extensão em `tests/modules/middlewares/audit.test.ts` |
| #8 — JWT algo confusion + expiry | Medium | Unit Jest | `tests/security/__tests__/jwt-lifecycle.test.ts` |
| #4 — L-01 cross-site forced logout | Low | E2E Playwright | `tests/security/csrf-logout.spec.ts` |

Total: **4 e2e specs + 4 unit tests** espelhados nos 8 gaps. (Os 8 gaps originais se consolidam em 6 arquivos de teste porque #6+#7 vão juntos.)

---

## 3. Decisões de Design

### 3.1 — Onde os testes vão morar

**Estrutura de arquivos:**

```
tests/
├── security/                            # NOVO namespace dedicado
│   ├── __tests__/                       # Jest unit (mesmo padrão do resto do repo)
│   │   ├── brute-force.test.ts          # Gap #1
│   │   ├── refresh-reuse.test.ts        # Gap #2
│   │   ├── isolationUserId.test.ts      # Gap #5
│   │   ├── redact.test.ts               # Gap #6
│   │   └── jwt-lifecycle.test.ts        # Gap #8
│   ├── csrf-logout.spec.ts              # Gap #4 (e2e Playwright)
│   └── ido-rreset-password.spec.ts      # Gap #3 / H-01 (e2e Playwright)
└── modules/
    └── middlewares/
        └── audit.test.ts                # EXTENSÃO: testes #7 (body redaction)
```

**Por que `tests/security/` separado:** o projeto já usa `tests/modules/<module>/` para unit tests por módulo. Os testes de segurança cruzam múltiplos módulos e são coesos entre si; namespace próprio facilita `npm run test:unit -- tests/security/` como gate dedicado.

### 3.2 — Como os e2e Playwright rodam sem Supabase real

Constraint: testes e2e precisam de um server local autenticável.

**Solução: `global-setup.ts` estendido** com um helper que:
1. Faz seed de dados via SQL direto (lembrar que projeto usa `dist/` + `node_modules/pg`), apontando para o banco de testes já existente (DB local `DATABASE_URL` em `.env.test`).
2. Cria **dois ADMINs de teste**:
   - `protected-admin@test.local` com `is_protected=true`
   - `regular-admin@test.local` com `is_protected=false`
3. Os testes usam essas credenciais fixas (não dependem de aleatoriedade).

**Risco residual:** se `DATABASE_URL` em `.env.test` apontar para Supabase SaaS, vai falhar. O `global-setup` deve **abortar** se o host não terminar em `localhost`, `127.0.0.1`, ou nome de container local. Sem isso, o teste pode causar side-effects em produção. Documentar no `.env.test.example`.

### 3.3 — Como os unit Jest cobrem comportamento de rede

Padrão já praticado no repo (ver `tests/modules/auth/login.test.ts:9-11`):

```typescript
jest.mock('../../../src/shared/config/db', () => ({ pool: { query: jest.fn() } }));
```

Seguimos o mesmo padrão. Para `isolationUserId`: função pura, não requer pool.

### 3.4 — Teste morto `forgotPassword` existente

Já existe `forgotPassword` em `tests/modules/auth/login.test.ts:130-153` que testa comportamento de console.log — mas `service.forgotPassword` ATUAL (lido em T3 do sub-spec 1) lança 501. O teste está **quebrado silenciosamente** ou **passa por sorte** (se `console.log` não foi mockado, pode estar passando sem chamar o serviço — coisa que `expect(consoleSpy).toHaveBeenCalledWith(...)` deveria pegar, mas o `service.forgotPassword` atual lança AppError, então o `await` rejeita antes de chegar ao expect).

**Decisão:** não consertar agora. Sub-spec 2 apenas adiciona `it.todo('REMOVE_OR_IMPLEMENT — seeL-02 from AUDIT-2026-07-03')` como documentation marker no describe, e adiciona comentário explicando que o teste será removido/recriado no sub-spec 3.

### 3.5 — Convenção de teste vermelho → verde (TDD reverso)

Para gaps que documentam bugs reais (H-01, L-01, L-02), os testes **devem falhar antes do fix** (sub-spec 3). Isso prova que o engine atual deixa passar o vetor. Quando sub-spec 3 corrigir, os testes passam.

Convenção no nome do teste: prefixar com `[H-01]`, `[L-01]`, `[L-02]` para rastrear origem. Ex.: `it('[H-01] is_protected=true — reset-password é bloqueado para ADMIN não-principal')`.

### 3.6 — Não-me-toques

Arquivos fora do novo `tests/security/` mantidos intactos, exceto:
- `tests/modules/middlewares/audit.test.ts`: estender com 4 testes novos (body com array, body null, body deeply nested, redaction preserve de campos não-sensíveis).
- `tests/modules/auth/login.test.ts`: único bloco `forgotPassword` recebe `it.todo(...)` + comentário, sem remover o que já existe (pode ser necessário para histórico/regressão quando sub-spec 3 remover o controller).

---

## 4. Vetores por teste (TDD vectors)

Para cada teste abaixo, listo: pré-condição, ação, pós-condição esperada (estado atual), e estado desejado pós-fix (referência para sub-spec 3).

### 4.1 — `tests/security/__tests__/brute-force.test.ts` (Gap #1)

**Cenário vermelho (atual passa o vetor):** ADMIN também protegido.
- Mock: `findUserByUsername` retorna ADMIN.
- 5 chamadas com senha errada → quinto chama `blockUser` + lança ACCOUNT_BLOCKED.
- Já existe parcialmente em `tests/modules/auth/login.test.ts:92-101` mas com `mockUser` onde role='ADMIN'. Ampliar com: teste específico ADMIN (não usava-se — symptoms diferenciados), e teste confirmando que **nenhum role é exempt**.

Vetores a incluir:
1. `it('[brute-force-A07] ADMIN também bloqueia após 5 tentativas — HIGH-004 do projeto')`
2. `it('[brute-force-A07] após 4 tentativas erradas, 5ª bloqueia e desabilita user')`
3. `it('[brute-force-A07] bloqueio prévio expira e usuario consegue logar novamente')`

### 4.2 — `tests/security/__tests__/refresh-reuse.test.ts` (Gap #2)

**Cenário:** depois de rotação, refresh token antigo não funciona mais.
- Mock sequence: `findRefreshTokenByHash` → null na segunda chamada (rotação efetiva).
- Esperado: `service.refresh(oldToken)` lança `INVALID_REFRESH_TOKEN`.
- Esperado: persistência chama `revokeRefreshToken` (idempotência: chamar duas vezes não duplica estado).

Vetores:
1. `it('[refresh-A07] refresh-token usado em paralelo rejeita segunda chamada')` — token reuse detection
2. `it('[refresh-A07] refresh expirado é rejeitado')` — TTL enforcement
3. `it('[refresh-A07] rotação gera novo token e revoga o anterior')` — happy path

### 4.3 — `tests/security/__tests__/isolationUserId.test.ts` (Gap #5)

**Função pura:** `isolationUserId(req)`.

Vetores (assertion pura):
1. `it('ADMIN retorna undefined — sem filtro de dados')`
2. `it('CRIADOR/VET/COMMERCIAL/FINANCIAL/READONLY retorna req.user.id')`
3. `it('req.user undefined retorna undefined (no filter — caller should handle)')` — expect explícito
4. `it('req.user.id presente mas role undefined retorna req.user.id (fail-secure, não bypass)')` — caso degenerate

### 4.4 — `tests/security/__tests__/redact.test.ts` (Gap #6)

**Função pura:** `redact(obj)` em `src/shared/utils/redact.ts`.

Vetores:
1. `it('campo top-level com chave sensitive → mask')` — já indiretamente coberto, reforçar
2. `it('array de objetos → recursividade preserva estrutura e mascara campos')`
3. `it('objeto deeply nested aninhado em array → mascarado')` — `[{outer: {secret: 'x', keep: 'y'}}]`
4. `it('chave sensitive em objeto mas valor undefined/null → mantém undefined/null sem quebrar')`

### 4.5 — Extensão em `tests/modules/middlewares/audit.test.ts` (Gap #7)

Body redaction em audit middleware:
1. `it('body com objeto aninhado em array — apenas campo sensitive mascarado')`
2. `it('body = null — não chama audit')` (complementar o existente)
3. `it('body circular-safe — fallback graceful sem quebrar request')` — complementar o existente warning-only

### 4.6 — `tests/security/__tests__/jwt-lifecycle.test.ts` (Gap #8)

**Alvo:** `authMiddleware` em `src/shared/middlewares/auth.ts`.

Vetores:
1. `it('alg=none rejeitado com TOKEN_INVALID')` — bypass via mudança de alg
2. `it('alg=HS512 rejeitado (allowlist HS256)')` — confusion attack
3. `it('exp expirado retorna 401 com TOKEN_INVALID')` — TTL
4. `it('payload com role fora do enum retorna 401 com TOKEN_INVALID')` — privilege escalation via token tampered (não-sigiloso é OK mesmo; o teste confirma defesa em camadas)

### 4.7 — `tests/security/csrf-logout.spec.ts` (Gap #4 / L-01)

**E2e Playwright:**
- Pré: navegador limpo, login de usuário de teste (cookie httpOnly + CSRF cookie).
- Ação: navegar para página externa (mockeada via `page.route`) que submete POST `/api/v1/auth/logout` sem o header `X-CSRF-Token`.
- Resultado esperado: **L-01 comportamento atual é o nuisance**: a 403 do CSRF não é testável aqui porque `/auth/*` isenta CSRF. Logo, o logout atual **passa sem CSRF**. Hmm.

Decisão revisada: teste para **confirmar que L-01 é nuisance-only**, documentando:
1. Com login ativo, POST `/auth/logout` cross-origin sem CSRF header → 200 + cookie cleared.
2. **Resultado atual**: nuisance — usuário cross-site consegue forçar logout.
3. **Contrato do teste**: deixa passar hoje, documenta a decisão UX (sub-spec 3 decide se mantém).

Versão positiva: `it('[L-01] logout cross-site sem csrf-token retorna 200 — nuisance-only conforme AUDIT')`. Fora dos limites da sub-spec 3 alterar isso.

### 4.8 — `tests/security/ido-rreset-password.spec.ts` (Gap #3 / H-01 — **prioridade máxima**)

**E2e Playwright:**
- Pré:
  - Server local rodando.
  - DB test seed: dois ADMINs, um com `is_protected=true` e outro com `is_protected=false`.
  - Sessão autenticada com o ADMIN não-principal (cookie auth + CSRF cookie).
- Ação: POST `/api/v1/users/<id-admin-protegido>/reset-password` com header `X-CSRF-Token`.
- Resultado esperado **atual (vulnerável)**: 200. **Esperado pós-fix**: 403 com `code: 'PROTECTED_ADMIN'` **OU** aceito conscientemente como recovery path (decisão produto).
- Padrão do teste: `it('[H-01] ADMIN não-principal NÃO pode resetar senha de ADMIN is_protected=true')` — deve falhar hoje (200), passar pós-fix (403).

Para este teste, precisamos **helper de seed**: arquivo `tests/security/global-setup-security.ts` (similar ao `tests/global-setup.ts` raiz, mas específico para fixtures de segurança). Cria os dois ADMINs localmente via SQL direto.

Seed script: idempotente (`INSERT ... ON CONFLICT (email) DO UPDATE ...`), popula `protected-admin@test.local` com `is_protected=true` e `regular-admin@test.local` com `is_protected=false`. Cleanup opcional ao fim (não obrigatório se os testes são idempotentes).

---

## 5. Plano de Execução (alto nível)

Implementação dividida em **bend tracks** paralelos seguidos de integração:

**Track A — Unit tests (puros, sem rede)** [paralelizado]
1. `tests/security/__tests__/isolationUserId.test.ts`
2. `tests/security/__tests__/redact.test.ts`
3. `tests/security/__tests__/jwt-lifecycle.test.ts`

**Track B — Unit tests (com pool mockado)** [paralelizado]
4. `tests/security/__tests__/brute-force.test.ts` — depende de mock da auth/service
5. `tests/security/__tests__/refresh-reuse.test.ts` — depende de mock da auth/service

**Track C — E2e + helpers** [sequencial ou paralelo se helpers independentes]
6. Extensão de `tests/modules/middlewares/audit.test.ts` (Gap #7) — pode rodar em paralelo com A/B
7. Ajuste de `tests/modules/auth/login.test.ts` (marcador `it.todo` em `forgotPassword`)
8. `tests/security/global-setup-security.ts` — seed de ADMIN `is_protected=true`
9. `tests/security/csrf-logout.spec.ts`
10. `tests/security/ido-rreset-password.spec.ts` (H-01)

Cada Track termina com seu próprio commit.

---

## 6. Critérios de Sucesso (DoD)

- [ ] 6 novos arquivos de teste + 1 extensão passam individualmente (cada um passa na sua faixa).
- [ ] Cada teste com prefixo `[H-01]`, `[L-01]`, etc. **falha hoje** (prova que há vetor) e está marcado como esperado-falha-pós-fix.
- [ ] `npm run test:unit` continua verde para tudo que era verde antes (não-quebrar suite existente, exceto o teste morto `forgotPassword` que será `it.todo`).
- [ ] `npm run test` (Playwright) só roda em CI com DB disponível — incluir no CI gate.
- [ ] Cada novo arquivo tem cabeçalho de comentário dizendo qual gap do AUDIT cobre.
- [ ] Nenhum secret real em fixtures; `tests/security/global-setup-security.ts` aborta se `DATABASE_URL` não aponta para host local.
- [ ] Counting de testes: 24 testes novos (≈4 por arquivo novo × 6) mais 4 testes novos em audit.test.ts.

---

## 7. Não-Objetivos

- **Não corrigir nada.** Sub-spec 3. Os testes podem falhar hoje — isso é **bom** e intencional.
- **Não instalar ferramentas novas.** Sem ZAP, sem Burp, sem supertest, sem testcontainers.
- **Não rodar contra Supabase SaaS.** Local only.
- **Não escrever fixture SQL definitiva.** Apenas seed mínimo em global-setup-security.

---

## 8. Riscos

- **Supabase SaaS apontamento acidental**: se `DATABASE_URL` em `.env.test` não for local, seed_helper pode poluir o banco real. Mitigação: abort-check no início do global-setup.
- **Conflito de seed**: dois testes que rodam em paralelo podem usar o mesmo ADMIN `is_protected=true`. Mitigação: namespace os IDs com sufixo único (`protected-admin-${runId}`) ou rodar Track C sequencialmente.
- **Refactor de jwt-lifecycle**: depende do comportamento exato do `auth.ts`. Se sub-spec 3 mudar validação de role, teste passa a precisar de update — **não** problema porque tracking via TAG do teste.

---

## 9. Handoff

- **Sub-spec 3 consome:** `--testNamePattern` para filtrar testes por TAG (`[H-01]`, `[L-01]`, etc.) e verificar que cada fix vira o teste de vermelho para verde.
- **CI sugerido (não escopo aqui)**: gate `npm run test:unit -- tests/security/` em PR + gate `npm run test -- tests/security/` em nightly.

---

## 10. Assinatura

Spec do sub-spec 2 em **2026-07-03**, com base em:
- `docs/security/AUDIT-2026-07-03.md` (8 gaps)
- `docs/superpowers/specs/2026-07-03-security-audit-design.md` (escopo menor)
- Padrão de teste já estabelecido em `tests/modules/auth/login.test.ts` (mock pool) e `tests/modules/middlewares/audit.test.ts` (spyOn singleton).

Sub-spec 2/3 → Sub-spec 3/3 (correções baseadas em achados + tags dos testes).
