# HomeLink Platform

Plataforma de liquidez imobiliária baseada em cadeias de transação (graph matching).

> **Idioma:** Somente Português do Brasil (pt-BR) a partir da v2.

---

## Stack Atual (MVP Frontend)
- **Next.js 14** (App Router)
- **React 18** com hooks
- **Supabase** (PostgreSQL + RLS + Realtime) — com fallback para mock data
- **CSS customizado** (design system completo em `globals.css`)

---

## Changelog

### v2.0 — Melhorias de UX e Due Diligence (atual)
- **Formulário de Novo Imóvel:** busca automática de endereço por CEP (API ViaCEP), campos de número e complemento, formatação de preço em R$ ao digitar. Campo "Título (EN)" removido.
- **Formulário de Novo Interesse:** seleção múltipla de bairros por cidade (dropdown com checkboxes), régua de preço inteligente (range slider) para faixa mín/máx.
- **Pipeline de Due Diligence:** novo passo "Due Diligence" no pipeline após "Concretizada". Inclui tabela de documentos requeridos (Matrícula, Certidões, IPTU, Docs Pessoais, Contrato, Procuração), checkboxes por item, upload de arquivos e barra de progresso.
- **Distribuição de Comissão:** lógica corrigida — corretor independente (sem imobiliária) divide com a plataforma; quando há imobiliária, a divisão é imobiliária + plataforma. Admin pode selecionar imobiliária e depois escolher um de seus corretores cadastrados.
- **Dashboards clicáveis:** todos os KPI cards e linhas de tabela navegam para a tela correspondente.
- **Informações de cadeia:** visíveis somente para Admin, Corretor e Imobiliária. O perfil USUARIO não vê referências a cadeias (CHN-*).
- **Interface 100% em Português do Brasil:** toggle de idioma removido.
- **Texto de interesse melhorado:** "Descreva o que você procura e o sistema vai buscar os imóveis que atendem às suas expectativas."

### v1.0 — Supabase Integration
- Migrations SQL para `properties`, `interests`, `chains`, `opportunities`, `commissions`
- Row Level Security (RLS) com políticas por perfil (admin/broker/agency/usuario)
- `src/lib/db.js` — data access layer com fallback automático para mock data
- `src/lib/supabase.js` — client configurável via variáveis de ambiente
- `supabase/seed.sql` — dados iniciais espelhando o mockData.js

### v0.x — MVP Inicial
- Marketplace, Dashboard, Meus Imóveis, Interesses, Oportunidades
- Pipeline de oportunidades com 8 etapas
- Aprovação de imóveis (Admin), auditoria por imóvel
- WhatsApp direto entre usuário e corretor
- Perfis: ADMIN, BROKER, AGENCY, USUARIO
- Sourcing on demand com status por interesse

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Entry point
│   └── globals.css         # Design system completo
├── components/
│   ├── HomeLinkApp.jsx     # App principal (estado, nav, roteamento, modais)
│   ├── ui.jsx              # Componentes compartilhados (KpiCard, PriceRangeSlider, NeighborhoodPicker, PipelineSteps…)
│   └── screens/
│       ├── Marketplace.jsx
│       ├── Dashboard.jsx
│       ├── Properties.jsx
│       ├── MyProperties.jsx
│       ├── Interests.jsx
│       ├── Opportunities.jsx
│       ├── OppDetail.jsx       # Due Diligence completo
│       ├── Transactions.jsx
│       ├── Payments.jsx
│       ├── Analytics.jsx
│       ├── Sourcing.jsx
│       ├── AdminApprovals.jsx
│       └── AdminUsers.jsx
├── data/
│   └── mockData.js         # Fallback data (usado quando Supabase não está configurado)
└── lib/
    ├── utils.js            # Helpers, badges, formatação
    ├── supabase.js         # Client Supabase (null quando env vars ausentes)
    └── db.js               # Data access layer com fallback automático
supabase/
├── migrations/
│   ├── 001_schema.sql      # Criação de todas as tabelas
│   └── 002_rls.sql         # Row Level Security
└── seed.sql                # Dados iniciais
```

---

## Perfis de Usuário
| Perfil | Acesso |
|--------|--------|
| **ADMIN** | Tudo: imóveis, aprovações, oportunidades, usuários, analytics, sourcing, pagamentos, due diligence |
| **BROKER** | Marketplace, meus anúncios, interesses, oportunidades, transações, pagamentos, due diligence |
| **AGENCY** | Marketplace, meus anúncios, interesses, corretores, transações, pagamentos |
| **USUARIO** | Marketplace, dashboard, meus imóveis, interesses (sem informações de cadeia) |

---

## Pipeline de Status
```
PENDING_REVIEW → APPROVED → ASSIGNED → IN_NEGOTIATION →
CONCRETIZADA → DUE_DILIGENCE → COMMISSION_PENDING → COMMISSION_PAID → CLOSED
```

### Etapa Due Diligence
Documentos verificados pelo corretor atribuído:
| # | Documento | Descrição |
|---|-----------|-----------|
| 1 | Matrícula do Imóvel | Certidão atualizada (máx. 30 dias) |
| 2 | Certidões Negativas | Certidões de ônus, ações e tributos |
| 3 | IPTU | Comprovante de IPTU quitado |
| 4 | Documentos Pessoais do Vendedor | RG, CPF e comprovante de residência |
| 5 | Contrato de Compra e Venda | Minuta ou contrato assinado |
| 6 | Procuração (se aplicável) | Procuração pública, se representado |

---

## Lógica de Negócio
- Comissão total: **6% sobre o valor de venda**, paga pelo vendedor
- **Corretor independente** (sem imobiliária): split = corretor% + plataforma% = 6%
- **Via imobiliária**: split = imobiliária% + plataforma% = 6% (corretor interno não divide separado)
- CPS (Chain Performance Score): 0–1, afeta ranking de oportunidades
- Algoritmos: M07 GeoSpatial → M09 Chain Discovery → M06 DNA Engine → M11 Price Bridge → M12 CPS

---

## Como rodar localmente

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

### Com Supabase (opcional)

Copie `.env.local.example` para `.env.local` e preencha as variáveis:

```bash
cp .env.local.example .env.local
```

Execute as migrations no SQL Editor do Supabase:
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/seed.sql` (dados iniciais)

Sem as variáveis configuradas, a plataforma roda em modo demo com dados mockados.

---

## Deploy no Vercel

```bash
vercel login
vercel --prod
```

Adicione as variáveis de ambiente no painel do Vercel (Settings → Environment Variables).

---

## Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_DEMO_MODE=false
```
