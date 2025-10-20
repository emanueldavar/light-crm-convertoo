# Light CRM Convertoo

Uma stack completa (frontend + backend) para um CRM leve, inspirado em ferramentas como Trello, Linear e Notion. O projeto oferece um funil de vendas em formato Kamban/List com personalização de colunas, arrastar e soltar, modal detalhado dos leads e suporte a dark mode. O backend em Express expõe uma API REST com endpoint de webhook para inserir leads automaticamente.

## Visão geral da arquitetura

```
light-crm-convertoo/
├── backend/                # API Express + armazenamento em JSON
│   ├── server.js           # Ponto de entrada da API
│   ├── routes/             # Rotas REST (leads, colunas, webhook)
│   └── data/db.json        # Banco leve persistido em arquivo
├── frontend/               # SPA React + Vite + Tailwind
│   ├── src/components/     # UI reutilizável (colunas, cards, modal, etc.)
│   ├── src/pages/          # Modos Kanban e Lista
│   ├── src/store/          # Gerenciamento de estado global com Zustand
│   └── vite.config.js      # Configuração do Vite + proxy para o backend
└── docker-compose.yml      # Subida simplificada dos serviços
```

## Backend (Express)

- Node.js + Express com CORS e JSON habilitados.
- Banco local baseado em arquivo JSON (`backend/data/db.json`).
- Rotas principais:
  - `GET /api/columns` — lista colunas com leads agrupados.
  - `POST /api/columns`, `PATCH /api/columns/:id`, `DELETE /api/columns/:id` — CRUD de colunas.
  - `GET /api/leads`, `POST /api/leads`, `PATCH /api/leads/:id`, `DELETE /api/leads/:id` — CRUD de leads.
  - `POST /api/webhook` — entrada automática de leads (payload flexível em PT/EN).
- Endpoint de saúde: `GET /api/health`.

### Rodando o backend

```bash
cd backend
npm install
npm run dev
```

A API fica disponível em `http://localhost:4000`.

## Frontend (React + Vite)

- Interface moderna com TailwindCSS, animações via Framer Motion e ícones Lucide.
- Drag-and-drop com `@dnd-kit` para mover colunas e cards.
- Zustand para orquestrar estado global (colunas, leads, tema, etc.).
- Modal detalhado com edição completa de leads (Headless UI + toasts).
- Alternância entre visualizações Kamban e Lista.
- Polling automático para avisar quando novos leads chegam pelo webhook.

### Rodando o frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173` e já consome o backend via proxy (`/api`).

## Webhook de novos leads

Envie um POST para `http://localhost:4000/api/webhook` com payload semelhante:

```json
{
  "nome": "João Pereira",
  "email": "joao@email.com",
  "telefone": "(48) 99999-9999",
  "empresa": "Construtora Alpha",
  "mensagem": "Tenho interesse em orçar um projeto."
}
```

O backend criará automaticamente um card na primeira coluna configurada. O frontend realiza polling periódico e exibe um toast "Novo lead recebido!" quando detectar leads inéditos.

## Docker Compose

Para subir tudo com Docker (modo desenvolvimento):

```bash
docker compose up --build
```

- Frontend disponível em `http://localhost:5173`
- Backend em `http://localhost:4000`

## Scripts úteis

| Local     | Comando            | Descrição                                |
|-----------|--------------------|------------------------------------------|
| backend   | `npm run dev`      | Inicia API com recarregamento automático |
| frontend  | `npm run dev`      | Inicia SPA React (Vite)                  |
| frontend  | `npm run build`    | Build de produção                        |
| frontend  | `npm run preview`  | Preview da build                         |

## Observações

- O projeto utiliza armazenamento em arquivo para simplificar; substitua por SQLite/Supabase conforme necessário.
- Como o ambiente não possui acesso ao registro npm durante a criação, as dependências ainda precisam ser instaladas localmente ao rodar o projeto.
- Ajuste as variáveis de ambiente no frontend/backend conforme seu cenário (ex.: URL da API em produção).
