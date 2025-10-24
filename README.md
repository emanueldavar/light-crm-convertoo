# Light CRM Convertoo

Light CRM Convertoo é um CRM moderno e leve inspirado em ferramentas como Trello, Notion e Linear. Ele oferece visualizações em Kanban e Lista, suporte a arrastar e soltar, personalização de colunas e integração via webhook para receber leads automaticamente.

## 🧱 Estrutura do projeto

```
light-crm-convertoo/
├── backend/              # API Express
├── frontend/             # Interface React + Vite
├── docker-compose.yml    # Stack full-stack em contêineres
└── README.md
```

## ✅ Pré-requisitos

- Node.js 20.x
- npm 10+
- (Opcional) Docker e Docker Compose

## ⚙️ Instalação

Clone este repositório e instale as dependências nas três camadas:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Variáveis de ambiente

Copie os arquivos `.env.example` para `.env` em cada pasta e ajuste se necessário.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## 🚀 Executando em modo desenvolvimento

### Tudo de uma vez

```bash
npm run dev
```

O comando acima inicia backend (porta `4000`) e frontend (porta `5173`) em paralelo utilizando `concurrently`.

### Serviços individuais

Você também pode iniciar cada parte separadamente:

```bash
# Backend
npm run dev --prefix backend

# Frontend
npm run dev --prefix frontend
```

O frontend está configurado com proxy para `http://localhost:4000/api` durante o desenvolvimento.

## 🐳 Usando Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- SQLite (para futura migração Prisma): volume montado em `backend/db/sqlite-data`

As pastas locais são montadas como volumes para suportar hot-reload de Vite e nodemon.

## 📡 API

### GET /api/columns
Lista todas as colunas do funil.

### POST /api/columns
Cria uma nova coluna. Corpo esperado:
```json
{
  "name": "Novo estágio",
  "color": "#6366f1"
}
```

### PUT /api/columns/:id
Atualiza nome, cor ou ordem da coluna.

### DELETE /api/columns/:id
Remove uma coluna e os leads associados a ela.

### GET /api/leads
Retorna todos os leads e suas posições nas colunas.

### POST /api/leads
Cria um novo lead manualmente. Campos principais:
```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "phone": "(11) 99999-9999",
  "company": "Empresa X",
  "value": 5000,
  "notes": "Observações",
  "tags": [{ "id": "uuid", "name": "Prioridade", "color": "#f97316" }],
  "columnId": "id-da-coluna"
}
```

### PUT /api/leads/:id
Atualiza dados do lead (incluindo a coluna).

### POST /api/leads/reorder
Reordena os leads dentro de uma coluna. Corpo esperado:
```json
{
  "columnId": "id-da-coluna",
  "orderedLeadIds": ["lead-1", "lead-2"]
}
```

### POST /api/webhook
Endpoint para receber leads automaticamente via integração externa. Exemplo de requisição cURL:

```bash
curl -X POST http://localhost:4000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Pereira",
    "email": "joao@email.com",
    "telefone": "(48) 99999-9999",
    "empresa": "Construtora Alpha",
    "mensagem": "Tenho interesse em orçar um projeto."
  }'
```

Um novo card será criado automaticamente na coluna "Novo Lead" e o frontend exibirá um toast de notificação na próxima atualização.

## 🖥️ Funcionalidades do frontend

- **Visualizações Kanban e Lista** com alternância na Topbar.
- **Drag & Drop** entre colunas usando `@dnd-kit`, com feedback visual suave.
- **Modal de detalhes** e **diálogos de coluna** construídos com Radix UI.
- **Modo claro/escuro** centralizado no hook `useTheme` com persistência automática.
- **Personalização de colunas** com formulários amigáveis (criar, editar, mudar cor, reordenar e remover).
- **Toasts padronizados** via hook `useToast` e skeleton loaders para feedback instantâneo.

## 🧪 Scripts úteis

### Raiz (`./`)
- `npm run dev` — Inicia backend e frontend em paralelo.

### Frontend (`frontend/`)
- `npm run dev` — Ambiente de desenvolvimento.
- `npm run build` — Build de produção.
- `npm run preview` — Pré-visualização do build.
- `npm run lint` — Lint com ESLint.

### Backend (`backend/`)
- `npm run dev` — Inicia a API com nodemon.
- `npm start` — Inicia a API em modo produção.

## 🧭 Roadmap sugerido

- ✅ Migrar MemoryStore → SQLite (Prisma)
- 🔐 Autenticação (JWT + Supabase Auth)
- 📊 Dashboard de métricas
- 📬 Webhook n8n / Meta Ads
- 📱 Versão PWA ou mobile-friendly

Aproveite o Light CRM Convertoo para organizar seus leads com rapidez e estilo! ✨
