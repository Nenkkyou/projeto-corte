# Design: Painel DEV + Auth de Clientes

**Data:** 2026-05-22
**Projeto:** Projeto Corte — site estático HTML/CSS/JS com localStorage

---

## Contexto

O sistema atual tem duas áreas separadas: pública (landing + formulário) e interna (dashboard admin com login). Este spec adiciona:

1. **Auth de clientes** — clientes precisam se cadastrar/logar antes de acessar o formulário de proposta
2. **Painel DEV** — ambiente de monitoramento completo para o desenvolvedor
3. **Rastreamento de eventos** — logging automático de tudo que acontece no sistema

---

## 1. Auth de Clientes

### Arquivo: `cadastro.html`

Página única com duas abas: **Entrar** e **Cadastrar**.

**Cadastro:** campos nome completo, email, senha (mín. 6 chars). Senha armazenada como hash SHA-256 via Web Crypto API. Dados salvos em `localStorage` na chave `pc_users` (array de objetos).

**Login:** email + senha. Valida contra `pc_users`. Ao autenticar, salva sessão em `pc_client_session` com `{ name, email, loginAt }` e redireciona para `proposta.html`.

**Estrutura de usuário:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "passwordHash": "abc123...",
  "createdAt": "2026-05-22T14:30:00Z"
}
```

### Mudança em `index.html`

O botão "Solicitar Projeto" e todos os CTAs que apontavam para `proposta.html` passam a apontar para `cadastro.html`.

### Mudança em `proposta.html`

Adiciona verificação de sessão de cliente no `<head>`: se `pc_client_session` não existir, redireciona para `cadastro.html`.

---

## 2. Rastreamento de Eventos

### Função: `trackEvent(type, detail)`

Adicionada em `script.js`. Salva eventos em `pc_events` no localStorage (array, máximo 500 entradas — FIFO, remove mais antigas).

**Estrutura de evento:**
```json
{
  "id": "uuid-simples",
  "type": "page_view",
  "detail": "dashboard.html",
  "timestamp": "2026-05-22T14:30:00.000Z"
}
```

**Tipos de evento capturados automaticamente:**
| Tipo | Quando |
|---|---|
| `page_view` | Toda página ao carregar |
| `admin_login` | Login admin bem-sucedido |
| `admin_logout` | Clique em Sair |
| `admin_login_fail` | Senha admin errada |
| `client_register` | Cadastro de cliente |
| `client_login` | Login de cliente |
| `client_login_fail` | Senha cliente errada |
| `form_submit` | Envio de proposta (salva dados completos) |
| `js_error` | Erro JS global (window.onerror) |

---

## 3. Painel DEV

### Arquivo: `dev.html`

**Acesso:** senha mestre `KuroNeko@97` (só senha, sem usuário). Sessão salva em `pc_dev_session`. Redirecionamento imediato no `<head>` se não autenticado.

**Layout:** sidebar fixa à esquerda com ícones + labels; conteúdo à direita com scroll. Estilo consistente com o resto do sistema (mesmo `style.css`).

### Seções

#### Overview
Espelho dos stats do dashboard admin:
- Total de usuários cadastrados (clientes)
- Total de formulários enviados
- Total de eventos no log
- Último evento registrado

#### Usuários Cadastrados
Tabela: Nome | Email | Data de cadastro
Dados lidos de `pc_users`.

#### Formulários Enviados
Tabela expansível: cada linha é uma proposta. Ao expandir, mostra todos os campos preenchidos. Dados lidos de `pc_submissions` (array salvo no submit do formulário).

**Estrutura de submissão:**
```json
{
  "id": "uuid-simples",
  "submittedAt": "2026-05-22T14:30:00.000Z",
  "clientEmail": "joao@email.com",
  "clientName": "João Silva",
  "data": {
    "projectName": "Reforma Cozinha",
    "projectType": "residential",
    "environment": "kitchen",
    "area": "30",
    "description": "...",
    "timeline": "short",
    "budget": "15k",
    "requirements": ["sustainable", "3d"],
    "contactMethod": "whatsapp"
  }
}
```

#### Event Log
Tabela com filtro por tipo de evento. Colunas: Timestamp | Tipo (badge colorido) | Detalhe. Botão "Limpar log". Dados de `pc_events`.

#### HealthCheck
Botão "Rodar Checks" dispara verificações assíncronas:

| Check | Como verifica |
|---|---|
| Páginas acessíveis | `fetch()` em cada `.html` — status 200 = OK |
| Assets carregam | `fetch()` no logo e no `style.css` |
| localStorage funcional | Escreve e lê uma chave de teste |
| JS sem erros críticos | Conta eventos do tipo `js_error` nas últimas 24h |

Resultado por item: badge verde ✓ ou vermelho ✗ com mensagem de erro.

#### localStorage Viewer
Lista todas as chaves do localStorage com valor (truncado em 200 chars). Botão "Deletar" por chave. Botão "Exportar tudo" (download JSON).

---

## Arquivos Modificados / Criados

| Arquivo | Ação |
|---|---|
| `cadastro.html` | Criar — auth de clientes |
| `dev.html` | Criar — painel DEV |
| `index.html` | Editar — CTAs apontam para `cadastro.html` |
| `proposta.html` | Editar — verificação de sessão cliente |
| `script.js` | Editar — `trackEvent()`, auth cliente, submit salva em `pc_submissions` |
| `style.css` | Editar — estilos de cadastro e dev panel |

---

## Verificação

1. Clicar "Solicitar Projeto" → cair em `cadastro.html`
2. Cadastrar conta → redirecionar para `proposta.html`
3. Enviar formulário → aparecer em "Formulários" no DEV panel
4. Acessar `dev.html` sem senha → redirecionar para login DEV
5. Logar com `KuroNeko@97` → ver todas as seções
6. Rodar HealthCheck → todos os itens com status correto
7. Forçar erro JS → aparecer no Event Log e no HealthCheck
