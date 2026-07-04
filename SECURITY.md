# Segurança — KennelManager Pro

## Rotação de Credenciais

### Quando Rotacionar

- A cada **90 dias** (rotina preventiva)
- Imediatamente se uma credencial for comprometida
- Quando um membro da equipe que tinha acesso sai do projeto
- Após incidente de segurança

### Processo de Rotação

#### 1. JWT_SECRET

1. Acesse Supabase Dashboard → Authentication → Settings → JWT Settings
2. Gere um novo JWT Secret (min 64 caracteres)
3. Copie o novo valor
4. Atualize o `.env` local com o novo JWT_SECRET
5. **IMPORTANTE:** O valor no Dashboard e no `.env` devem ser **idênticos**
6. Reinicie o servidor
7. Teste o login de todos os usuários

> ⚠️ Rotacionar JWT_SECRET invalida todos os tokens JWT ativos.
> Todos os usuários precisarão fazer login novamente.

#### 2. DATABASE_URL (Senha do Banco)

1. Acesse Supabase Dashboard → Settings → Database
2. Clique em "Reset Database Password"
3. Gere uma senha forte (min 32 caracteres)
4. Atualize o `.env` com a nova senha na DATABASE_URL
5. Reinicie o servidor
6. Verifique a conexão nos logs

#### 3. SUPABASE_SERVICE_ROLE_KEY

1. Acesse Supabase Dashboard → Settings → API
2. Clique em "Reset API Key" para a service_role key
3. Copie a nova chave
4. Atualize o `.env` com a nova SUPABASE_SERVICE_ROLE_KEY
5. Reinicie o servidor

#### 4. Usando o Script Automatizado

```bash
# PowerShell (Windows)
.\scripts\rotate-credentials.ps1

# O script gera novas credenciais e cria backup
# As instruções são exibidas no terminal
```

---

## Checklist de Segurança para Deploy

### Antes do Deploy

- [ ] `.env` **NUNCA** commitado no repositório
- [ ] `.gitignore` inclui `.env`, `*.env.local`, `*.env.*.local`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` só usado em código server-side
- [ ] `JWT_SECRET` tem no mínimo 64 caracteres
- [ ] `DATABASE_URL` usa SSL (ou Pooler com Transaction mode)
- [ ] `CORS_ORIGINS` restrito aos domínios de produção
- [ ] `NODE_ENV="production"` definido
- [ ] Nenhum `console.log` com dados sensíveis em código
- [ ] Helmet habilitado no Express
- [ ] Rate limiting configurado (express-rate-limit)

### Após o Deploy

- [ ] Testar fluxo de login completo
- [ ] Verificar logs por erros de conexão
- [ ] Confirmar CORS funcionando (sem erros no browser)
- [ ] Testar endpoints protegidos com token inválido (deve retornar 401)
- [ ] Verificar que service_role key não está exposta no frontend

### Rotina Mensal

- [ ] Revisar logs de acesso
- [ ] Verificar dependências desatualizadas (`npm audit`)
- [ ] Confirmar que backups do `.env` estão atualizados
- [ ] Testar restore do backup em ambiente de staging

---

## Contatos de Emergência

| Papel | Contato | Quando Acionar |
|-------|---------|----------------|
| **Email de Segurança** | security@kennelmanager.pro | Reportar vulnerabilidades, incidentes, solicitações de rotação |
| **Responsável Técnico** | [NOME] — [EMAIL] | Incidentes de segurança, rotina de credenciais |
| **Supabase Support** | https://supabase.com/support | Problemas de infraestrutura, reset de projeto |
| **Vercel Support** | https://vercel.com/support | Problemas de deploy, DNS, edge functions |

> ⚠️ **Política de Divulgação:** Vulnerabilidades devem ser reportadas primeiro por email (security@kennelmanager.pro), **nunca** como issue pública no GitHub. Aguarde confirmação antes de qualquer divulgação externa.

### Processo de Resposta a Incidentes

1. **Detecção (T+0)** — Identificar o incidente e congelar evidências (logs, snapshots)
2. **Triagem (T+15min)** — Avaliar severidade:
   - 🔴 **Crítico** (credencial vazada, RCE, exfiltração em massa) → rotação imediata
   - 🟠 **Alto** (acesso não autorizado, bypass de RLS) → investigar em 24h
   - 🟡 **Médio** (vulnerabilidade conhecida, sem exploração) → agendar fix em 7 dias
3. **Contenção (T+1h)** — Rotacionar credenciais afetadas (JWT_SECRET, DB, SERVICE_ROLE)
4. **Erradicação (T+24h)** — Identificar vetor de ataque, aplicar patch, validar fix
5. **Recuperação (T+72h)** — Restaurar serviço, monitorar logs por atividade anômala
6. **Post-mortem (T+7d)** — Documentar causa raiz, ações preventivas, atualizar este documento

### Em Caso de Incidente

1. **Não entre em pânico.** Avalie o escopo.
2. **Rotacione credenciais imediatamente** (JWT_SECRET + DATABASE_URL + SERVICE_ROLE_KEY)
3. **Verifique logs** para identificar acesso não autorizado
4. **Comunique** ao responsável técnico
5. **Documente** o incidente com timestamps e evidências
6. **Revise** permissões de acesso ao projeto
7. **Considere** notificar usuários afetados (se aplicável)

---

## Boas Práticas

- Nunca compartilhe credenciais por chat ou email
- Use variáveis de ambiente, nunca hardcode
- Mantenha `SUPABASE_SERVICE_ROLE_KEY` fora do frontend
- Use HTTPS sempre em produção
- Implemente logging de tentativas de autenticação
- Revise permissões regularmente no Supabase Dashboard

---

## Referências OWASP

- **[OWASP Top 10 (2021)](https://owasp.org/Top10/)** — Riscos mais críticos em aplicações web
- **[OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)** — Padrão de verificação de segurança de aplicações
- **[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)** — Guias práticos:
  - [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
  - [JWT for Java Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
  - [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
  - [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

---

## Supply Chain Security

### Política de Dependências

#### Lock File (package-lock.json)
- **OBRIGATÓRIO**: `package-lock.json` deve estar commitado no repositório
- **CI/CD**: Vercel e GitHub Actions usam `npm ci` (instalação exata)
- **PROIBIDO**: `npm install` em produção (pode pegar versões diferentes do lock)

#### Versões Pinadas (Sem Caret)
Pacotes críticos de segurança são pinados em versões **exatas** (sem `^` ou `~`):
- `bcrypt` — Password hashing
- `express` — HTTP server
- `express-rate-limit` — Rate limiting
- `helmet` — Security headers
- `jsonwebtoken` — JWT tokens
- `multer` — File upload
- `pg` — PostgreSQL driver
- `winston` — Logging
- `zod` — Validation

#### Renovação de Dependências
- **Patches**: Aplicar mensalmente (atualizações de segurança)
- **Minor**: Revisar trimestralmente (changelog review)
- **Major**: Planejar anualmente (breaking changes)

### Auditoria de Vulnerabilidades

#### Comandos Disponíveis
```bash
npm audit              # Audit completo (dev + prod)
npm audit:prod         # Apenas produção
npm audit:fix          # Auto-fix vulnerabilidades
npm audit:json         # Output JSON para ferramentas
npm outdated           # Dependências desatualizadas
```

#### CI/CD Automático
- **GitHub Actions**: Executa `npm audit` semanalmente
- **Dependabot**: Abre PRs automáticos para patches/minor
- **Bloqueio**: PR com vulnerabilidades moderadas+ não pode ser mergeado

### Software Bill of Materials (SBOM)

```bash
npm run sbom:generate  # Gera sbom.json
npm run sbom:xml       # Gera sbom.xml
```

SBOM é gerado automaticamente em cada CI run e fica disponível como artifact.

### Checklist de Supply Chain

#### Antes de Adicionar Nova Dependência
- [ ] Verificar CVEs conhecidos (`npm audit`)
- [ ] Verificar popularidade (>1k weekly downloads)
- [ ] Verificar manutenção (último commit <6 meses)
- [ ] Verificar origem (npm registry oficial, não typosquatting)
- [ ] Avaliar se é realmente necessário (evitar bloat)
- [ ] Documentar justificativa no PR

#### Antes de Atualizar Dependência
- [ ] Ler CHANGELOG da nova versão
- [ ] Verificar breaking changes
- [ ] Testar em ambiente de staging primeiro
- [ ] Verificar CVEs resolvidos

### Revogação de Pacote

Em caso de descoberta de pacote malicioso:
1. Remover imediatamente via `npm uninstall`
2. Commitar package.json + package-lock.json
3. Executar `npm audit` para confirmar remoção
4. Notificar equipe
5. Atualizar este documento com lessons learned

### Referências

- [OWASP A03:2021 - Software Supply Chain](https://owasp.org/Top10/A03_2021-Injection/)
- [npm security best practices](https://docs.npmjs.com/security-best-practices)
- [CycloneDX SBOM Specification](https://cyclonedx.org/specification/overview/)

---

## Auditoria Recente

### Última Auditoria: 03/Jul/2026

**Escopo:** Revisão completa de configurações de segurança, isolamento de dados, validação de entrada, gestão de credenciais e supply chain de dependências.

> 📦 **Supply Chain Security** está documentado integralmente na seção [Supply Chain Security](#supply-chain-security) acima (política de dependências pinadas, auditoria automatizada via `npm audit`, geração de SBOM e checklists de revisão).

**Achados Críticos Corrigidos:**

- [x] **JWT_SECRET** validado como ≥ 64 caracteres e idêntico ao Supabase Dashboard
- [x] **SQL NULL Guard Pattern** implementado em todos os repositories (`$N::uuid IS NULL OR created_by = $N`)
- [x] **`isolationUserId(req)`** aplicado em todos os endpoints (não-ADMIN vê apenas seus dados; ADMIN vê tudo)
- [x] **Upload de foto via URL** (não multipart) — reduz superfície de ataque
- [x] **Data Flow Automation** com `try/catch` (não quebra fluxo principal)
- [x] **Duplo `useEffect`** removido em listas com busca (debounce consolidado)
- [x] **`.env`** removido de qualquer histórico do git e bloqueado por `.gitignore`
- [x] **`SUPABASE_SERVICE_ROLE_KEY`** confirmado uso exclusivo server-side

**Achados em Monitoramento:**

- [ ] **Rotação automática de credenciais** — pendente de integração com Supabase Management API
- [ ] **Rate limiting distribuído** — Redis como backend compartilhado (atual: in-memory)

**Próxima Auditoria:** 03/Out/2026 (90 dias) ou imediatamente em caso de incidente.
