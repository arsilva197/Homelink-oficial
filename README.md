# HomeLink Platform

Plataforma de liquidez imobiliária baseada em cadeias de transação (graph matching).

## Stack Atual (MVP Frontend)
- **Next.js 14** (App Router)
- **React 18** com hooks
- **CSS customizado** (design system completo em `globals.css`)
- **Dados mockados** em `src/data/mockData.js`

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Entry point
│   └── globals.css         # Design system completo
├── components/
│   ├── HomeLinkApp.jsx     # App principal (estado, nav, roteamento)
│   ├── ui.jsx              # Componentes compartilhados
│   └── screens/
│       ├── Marketplace.jsx
│       ├── Dashboard.jsx
│       ├── Properties.jsx
│       ├── MyProperties.jsx
│       ├── Interests.jsx
│       ├── Opportunities.jsx
│       ├── OppDetail.jsx
│       ├── Transactions.jsx
│       ├── Payments.jsx
│       ├── Analytics.jsx
│       ├── Sourcing.jsx    # também exporta MyBrokers e AdminUsers
│       ├── MyBrokers.jsx
│       └── AdminUsers.jsx
├── data/
│   └── mockData.js         # Todos os dados mockados
└── lib/
    └── utils.js            # Helpers, i18n, formatação
```

## Perfis de Usuário
| Perfil | Acesso |
|--------|--------|
| **ADMIN** | Tudo: imóveis, oportunidades, usuários, analytics, sourcing, pagamentos |
| **BROKER** | Marketplace, meus anúncios, interesses, oportunidades, transações, pagamentos |
| **AGENCY** | Marketplace, meus anúncios, interesses, corretores, transações, pagamentos |
| **USUARIO** | Marketplace, dashboard, meus anúncios, interesses, transações |

## Modelos de Dados (mockData.js)
- **PROPS** — 12 imóveis com owner/chain/status
- **INTERESTS** — 11 interesses de compra (usuario/broker/agency)
- **CHAINS** — 4 cadeias CHN-A a CHN-D
- **OPPS** — 3 oportunidades com participantes e comissões
- **USERS_DATA / BROKERS_DATA / AGENCIES_DATA** — gestão de usuários
- **COMM_HISTORY** — histórico de eventos de comissão

## Pipeline de Status (PL)
```
PENDING_REVIEW → APPROVED → ASSIGNED → IN_NEGOTIATION →
CONCRETIZADA → COMMISSION_PENDING → COMMISSION_PAID → CLOSED
```

## Lógica de Negócio
- Comissão: **6% sobre o valor de venda**, paga apenas pelo VENDEDOR
- Split: agency% + platform% (quando via imobiliária) ou broker% + platform% (autônomo)
- CPS (Chain Performance Score): 0-1, afeta ranking de oportunidades
- Algoritmos: M07 GeoSpatial → M09 Chain Discovery → M06 DNA Engine → M11 Price Bridge → M12 CPS

---

## Como rodar localmente

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

## Deploy no Vercel

```bash
npm install -g vercel   # se não tiver
vercel login            # autenticar
vercel                  # primeiro deploy (seguir prompts)
vercel --prod           # deploy para produção
```

---

## Próximos Passos com Claude Code

### 1. Banco de dados (Supabase / Postgres)

```bash
# Instalar Supabase client
npm install @supabase/supabase-js

# Criar tabelas (pedir ao Claude Code):
# - properties (com RLS por owner_id)
# - interests
# - chains
# - opportunities
# - commissions
# - users (extende auth.users)
```

**Prompt para Claude Code:**
```
Adicione Supabase ao projeto HomeLink. 
Crie migrations para as tabelas: properties, interests, chains, opportunities, commissions.
Use RLS (Row Level Security) para que cada usuário veja apenas seus próprios dados.
Substitua o mockData.js por chamadas reais à API do Supabase.
```

### 2. Autenticação (NextAuth + Supabase)

```bash
npm install next-auth @supabase/auth-helpers-nextjs
```

**Prompt para Claude Code:**
```
Adicione autenticação ao HomeLink usando NextAuth.
Implemente login com email/senha e Google OAuth.
Cada usuário autenticado deve ter um role (ADMIN/BROKER/AGENCY/USUARIO).
Proteja todas as rotas — redirecionar para /login se não autenticado.
```

### 3. Upload real de CSV

**Prompt para Claude Code:**
```
Implemente o upload real de CSV para imóveis.
Use a API route /api/import-properties.
Valide as colunas obrigatórias: titulo, tipo, cidade, bairro, preco, area_m2.
Salve no Supabase e retorne os IDs criados.
```

### 4. Algoritmo de matching

**Prompt para Claude Code:**
```
Implemente o algoritmo de Chain Discovery (M09) no HomeLink.
Use os dados de PROPS e INTERESTS para identificar cadeias potenciais.
Uma cadeia é válida quando: comprador A quer comprar prop com preço ~X,
e vendedor B vende prop ~X mas quer comprar prop ~Y, etc.
Calcule o CPS (Chain Performance Score) baseado em: compatibilidade de preço, 
localização e número de participantes (ideal: 2-4).
```

---

## Variáveis de Ambiente Necessárias

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=random-secret-string
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional
```
