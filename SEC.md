Prompt Detalhado para Auditoria de Segurança de Projetos de Software
1. Introdução
Este documento serve como um guia abrangente para a realização de uma auditoria de segurança em projetos de software. O objetivo é identificar, analisar e mitigar vulnerabilidades que possam comprometer a confidencialidade, integridade e disponibilidade dos sistemas e dados. A auditoria deve ser conduzida de forma sistemática, cobrindo diversas camadas da aplicação e infraestrutura.
2. Escopo da Auditoria
A auditoria deve abranger os seguintes componentes do projeto:
•
Código-fonte: Revisão manual e automatizada de todo o código da aplicação (frontend, backend, APIs, scripts).
•
Infraestrutura: Análise da configuração de servidores, serviços de rede, balanceadores de carga, firewalls e outros componentes de infraestrutura.
•
Configurações: Verificação de arquivos de configuração, permissões de acesso, segredos e variáveis de ambiente.
•
Bancos de Dados: Análise de esquemas, permissões, dados sensíveis e configurações de segurança do banco de dados.
•
APIs: Testes de segurança em todas as APIs expostas (REST, GraphQL, SOAP).
•
Dependências: Avaliação de bibliotecas, frameworks e componentes de terceiros quanto a vulnerabilidades conhecidas.
•
Processos de CI/CD: Revisão das práticas de segurança implementadas nos pipelines de integração e entrega contínuas.
•
Documentação: Análise da documentação de arquitetura, design de segurança e procedimentos operacionais.
3. Metodologia Sugerida
A auditoria deve empregar uma combinação das seguintes abordagens:
•
Revisão de Código (Code Review): Análise estática e dinâmica do código-fonte para identificar padrões de vulnerabilidade.
•
Testes de Penetração (Penetration Testing): Simulação de ataques reais para explorar vulnerabilidades e avaliar a resiliência do sistema.
•
Análise de Vulnerabilidades (Vulnerability Scanning): Uso de ferramentas automatizadas para identificar vulnerabilidades conhecidas em aplicações e infraestrutura.
•
Análise de Configuração (Configuration Review): Verificação das configurações de segurança em todos os componentes do sistema.
•
Testes de Lógica de Negócio: Avaliação de como a lógica da aplicação pode ser manipulada para contornar controles de segurança.
4. Categorias de Vulnerabilidades a Serem Verificadas
As seguintes categorias de vulnerabilidades, incluindo as fornecidas pelo usuário e as adicionais baseadas em padrões como OWASP Top 10 e CWE Top 25, devem ser exaustivamente verificadas:
4.1. Vulnerabilidades de Injeção
•
Injeção de SQL (SQLi): Exploração de falhas na validação de entrada para executar comandos SQL arbitrários.
•
Injeção de NoSQL: Similar ao SQLi, mas para bancos de dados NoSQL.
•
Injeção de Comandos do Sistema Operacional: Execução de comandos do sistema operacional através de entradas não validadas.
•
Injeção de LDAP: Manipulação de consultas LDAP.
•
Injeção de XPath: Manipulação de consultas XPath.
•
Injeção de SMTP: Injeção de comandos SMTP em cabeçalhos de e-mail ou corpo.
•
Injeção de Cabeçalho HTTP: Manipulação de cabeçalhos HTTP para alterar o comportamento da aplicação.
•
Injeção de Código: Execução de código arbitrário (e.g., PHP, Python, JavaScript no servidor) através de entradas.
•
Injeção de Template no Lado do Servidor (SSTI): Injeção de código em templates de servidor.
•
Injeção de GraphQL: Manipulação de consultas GraphQL para acessar dados não autorizados ou executar operações maliciosas.
4.2. Vulnerabilidades Cross-Site
•
Cross-Site Scripting (XSS) Refletido: Scripts maliciosos injetados via URL e refletidos na página.
•
Cross-Site Scripting (XSS) Armazenado: Scripts maliciosos armazenados no servidor e servidos a outros usuários.
•
Cross-Site Scripting (XSS) Baseado em DOM: Scripts maliciosos executados devido à manipulação insegura do DOM no lado do cliente.
•
Cross-Site Request Forgery (CSRF): Forçar um usuário autenticado a enviar uma requisição maliciosa.
•
Cross-Site Script Inclusion (XSSI): Inclusão de scripts de domínios externos para roubar informações.
•
JSON Hijacking: Roubo de dados JSON através de scripts maliciosos.
4.3. Vulnerabilidades de Requisições e Entidades Externas
•
Server-Side Request Forgery (SSRF): Fazer com que o servidor faça requisições HTTP para um destino arbitrário.
•
Client-Side Request Forgery: Similar ao SSRF, mas no lado do cliente.
•
Entidades Externas XML (XXE): Processamento inseguro de XML que permite a leitura de arquivos locais ou execução de requisições.
•
Redirecionamento Aberto (Open Redirect): Redirecionar usuários para URLs maliciosas através de parâmetros não validados.
4.4. Vulnerabilidades de Autenticação e Controle de Acesso
•
Autenticação Quebrada (Broken Authentication): Falhas na implementação de autenticação que permitem contornar ou comprometer credenciais.
•
Gestão de Sessão Fraca: Falhas na geração, proteção ou invalidação de IDs de sessão.
•
Fixação de Sessão (Session Fixation): Atacante define o ID de sessão de um usuário antes do login.
•
Roubo de Cookie: Roubo de cookies de sessão para assumir a identidade do usuário.
•
Credential Stuffing: Uso de credenciais vazadas de outros sites para tentar login.
•
Ataque de Força Bruta: Tentativas repetidas de adivinhar senhas ou chaves.
•
Ataque de Dicionário: Uso de listas de palavras comuns para adivinhar senhas.
•
Quebra de Controle de Acesso (Broken Access Control): Falhas na aplicação de restrições de acesso a usuários autenticados.
•
Referência Direta a Objetos Insegura (IDOR): Acesso a recursos de outros usuários modificando um parâmetro.
•
Escalonamento de Privilégios Vertical: Usuário com menos privilégios obtém acesso a funções de maior privilégio.
•
Escalonamento de Privilégios Horizontal: Usuário acessa recursos de outro usuário com o mesmo nível de privilégio.
•
Bypass de Autenticação: Contornar completamente o mecanismo de autenticação.
4.5. Exposição de Dados e Criptografia
•
Exposição de Dados Sensíveis: Dados sensíveis (senhas, informações pessoais, dados financeiros) não protegidos adequadamente.
•
Armazenamento Criptográfico Inseguro: Armazenamento de dados criptografados de forma vulnerável (e.g., chaves fracas, algoritmos desatualizados).
•
Falhas de Criptografia: Uso de algoritmos criptográficos fracos, implementações incorretas ou gerenciamento inadequado de chaves.
4.6. Configuração Incorreta e Desatualização
•
Configurações Incorretas de Segurança (Security Misconfiguration): Configurações padrão inseguras, permissões incorretas, serviços desnecessários habilitados.
•
Listagem de Diretórios: Servidor web permite a listagem de diretórios, expondo arquivos e estrutura.
•
Mensagens de Erro Detalhadas: Mensagens de erro que revelam informações sensíveis sobre a aplicação ou infraestrutura.
•
Headers de Segurança Ausentes: Falta de cabeçalhos HTTP de segurança (e.g., HSTS, CSP, X-Frame-Options).
•
Configuração Incorreta de CORS: Políticas de Cross-Origin Resource Sharing (CORS) configuradas de forma muito permissiva.
•
Uso de Componentes com Vulnerabilidades Conhecidas: Utilização de bibliotecas, frameworks ou outros componentes de software com vulnerabilidades públicas.
•
Dependências de Terceiros Desatualizadas: Dependências não atualizadas, que podem conter falhas de segurança corrigidas em versões mais recentes.
4.7. Falhas de Lógica de Negócio e Condições de Corrida
•
Falhas de Lógica de Negócio: Vulnerabilidades que exploram falhas na lógica da aplicação para obter resultados não intencionais ou maliciosos.
•
Condições de Corrida (Race Conditions): Vulnerabilidades que surgem quando a ordem de execução de operações concorrentes é crítica e pode ser manipulada.
•
Atribuição em Massa (Mass Assignment): Permissão para que um atacante modifique propriedades de objetos que não deveriam ser acessíveis.
•
Poluição de Protótipo (Prototype Pollution): Vulnerabilidade em JavaScript que permite a modificação de protótipos de objetos, afetando a aplicação globalmente.
4.8. Negação de Serviço (DoS/DDoS)
•
Negação de Serviço (DoS): Ataques que visam tornar um serviço indisponível para seus usuários legítimos.
•
Negação de Serviço Distribuída (DDoS): DoS realizado por múltiplos sistemas comprometidos.
•
Negação de Serviço na Camada de Aplicação: Ataques DoS que visam esgotar recursos da aplicação (e.g., CPU, memória, conexões).
•
Esgotamento de Recursos: Qualquer ataque que leve ao esgotamento de recursos críticos do sistema.
•
Negação de Serviço por Expressão Regular (ReDoS): Expressões regulares maliciosas que consomem muitos recursos de processamento.
•
XML Bomb (Billion Laughs Attack): Ataque XML que causa esgotamento de recursos ao expandir entidades XML recursivamente.
4.9. Ataques de Rede e Infraestrutura
•
Man-in-the-Middle (MitM): Interceptação e possível modificação da comunicação entre duas partes.
•
DNS Rebinding: Ataque que contorna a política de mesma origem em navegadores web.
•
Sequestro de Subdomínio (Subdomain Takeover): Assumir o controle de um subdomínio não utilizado.
•
HTTP Request Smuggling: Manipulação de requisições HTTP para contornar controles de segurança.
•
HTTP Response Splitting: Injeção de caracteres de nova linha em uma resposta HTTP para manipular o navegador.
•
Envenenamento de Cache Web: Injeção de conteúdo malicioso em um cache web.
•
Envenenamento de Cache de DNS: Injeção de registros DNS falsos em um servidor DNS.
4.10. Vulnerabilidades de Arquivos e Caminhos
•
Path Traversal (Directory Traversal): Acesso a arquivos e diretórios fora do diretório raiz da aplicação.
•
Inclusão de Arquivo Local (LFI): Inclusão de arquivos locais arbitrários no servidor.
•
Inclusão de Arquivo Remoto (RFI): Inclusão de arquivos remotos arbitrários no servidor.
•
Upload de Arquivo Malicioso: Permitir o upload de arquivos com conteúdo malicioso (e.g., web shells).
•
Web Shell: Upload de um script malicioso que permite controle remoto do servidor.
•
Backdoor: Ponto de entrada secreto no sistema para acesso não autorizado.
4.11. Outras Vulnerabilidades
•
Clickjacking (UI Redressing): Enganar usuários para que cliquem em elementos invisíveis ou disfarçados.
•
Tabnabbing: Manipulação de abas do navegador para redirecionar o usuário para sites maliciosos.
•
Typosquatting: Registro de domínios com erros de digitação comuns para enganar usuários.
•
Desserialização Insegura: Desserialização de dados não confiáveis que pode levar à execução remota de código.
•
Vulnerabilidades em WebSockets: Falhas de segurança específicas em implementações de WebSocket.
•
Vulnerabilidade de Dia Zero (Zero-Day): Vulnerabilidades desconhecidas publicamente e sem patch disponível.
4.12. Monitoramento e Registro
•
Monitoramento e Registro Insuficientes: Falta de logs de segurança adequados ou monitoramento ineficaz para detectar e responder a incidentes.
5. Requisitos de Relatório
O relatório da auditoria deve incluir, no mínimo:
•
Resumo Executivo: Visão geral das descobertas mais críticas e recomendações de alto nível.
•
Metodologia: Descrição detalhada das abordagens e ferramentas utilizadas.
•
Descobertas: Lista detalhada de todas as vulnerabilidades identificadas, incluindo:
•
Nome da vulnerabilidade.
•
Descrição.
•
Localização (arquivo, linha de código, URL, componente).
•
Severidade (Crítica, Alta, Média, Baixa, Informativa).
•
Impacto potencial.
•
Prova de Conceito (PoC) ou passos para reprodução.
•
Recomendações: Sugestões claras e acionáveis para mitigar cada vulnerabilidade, incluindo referências a boas práticas e padrões de segurança.
•
Plano de Ação: Proposta de um plano de remediação priorizado.
•
Anexos: Quaisquer logs, capturas de tela ou outros artefatos relevantes.
6. Ferramentas Sugeridas (Exemplos)
•
SAST (Static Application Security Testing): SonarQube, Checkmarx, Bandit (Python).
•
DAST (Dynamic Application Security Testing): OWASP ZAP, Burp Suite.
•
SCA (Software Composition Analysis): Snyk, Dependabot, OWASP Dependency-Check.
•
Análise de Configuração: Ferramentas de hardening de sistemas operacionais, scanners de configuração de nuvem.
•
Testes de Penetração Manual: Burp Suite Professional, Nmap, Metasploit.
7. Referências
•
OWASP Top 10 - The OWASP Foundation
•
CWE Top 25 Most Dangerous Software Weaknesses - MITRE Corporation