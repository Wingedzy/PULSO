# 🧠 Pulso — Central de Produtividade Pessoal

Uma aplicação completa para gerenciar sua rotina, finanças, saúde, estudos e muito mais, com organização inteligente de tarefas.

## ✨ Funcionalidades

### 📋 Tarefas
- CRUD completo com prioridade e tags
- Classificação automática por categoria (saúde, trabalho, estudos, pessoal, ideias)
- Priorização inteligente por palavras-chave (urgente, importante, etc.)
- Sugestão automática de data baseada na urgência
- Status: Pendente, Em andamento, Concluído, Cancelado

### 💰 Finanças
- Registro de entradas e saídas
- Compras parceladas com controle por grupo
- Assinaturas recorrentes com geração automática mensal
- Orçamentos por categoria com alertas de gasto
- Suporte a múltiplos bancos e formas de pagamento
- Resumo mensal com saldo, entradas e saídas
- Registro por linguagem natural (ex: "gastei 50 reais no mercado")

### 📈 Investimentos
- Carteira de investimentos (renda fixa, variável, cripto, etc.)
- Acompanhamento de valor investido vs. valor atual
- Histórico completo

### 🎯 Metas Financeiras
- Metas com valor-alvo e aporte mensal
- Acompanhamento de progresso
- Foto personalizada por meta

### 📚 Estudos
- Planejamento de sessões com assunto, tópico e duração
- Registro de tempo real gasto vs. planejado
- Histórico de sessões concluídas

### 🏋️ Treinos
- Suporte a Musculação, Cardio, Funcional, Esportivo e outros
- Lista de exercícios por treino
- Avaliação, progressão e nível de dor pós-treino
- Histórico completo

### ✅ Hábitos
- Criação de hábitos personalizados com cor
- Grade visual por mês
- Histórico de execuções por dia

### 🔄 Rotinas
- Rotinas por dias da semana com horário
- Marcação de execução diária
- Prioridade e categoria por rotina

### 💧 Hidratação
- Tracker de consumo de água diário
- Meta personalizável (padrão: 2000ml)
- Histórico por hora e histórico semanal

### 😌 Registro Emocional
- Registro de emoções com texto livre
- Histórico por data e hora

### 🛍️ Lista de Desejos
- Wishlist com preço, link e prioridade
- Filtros por status e prioridade
- Status: Desejado, Comprado, Descartado

### 🏷️ Categorias Financeiras
- 11 categorias padrão (alimentação, transporte, moradia, saúde, lazer, educação, vestuário, investimento, salário, freelance, outros)
- Criação de categorias personalizadas

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- Conta no [Neon](https://neon.tech) com banco PostgreSQL criado

### Passo 1: Clonar e instalar dependências

```bash
git clone https://github.com/Wingedzy/Mentrix.git
cd Mentrix

# Dependências do backend
npm install

# Dependências do frontend
cd client && npm install && cd ..
```

### Passo 2: Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
```

### Passo 3: Gerar o Prisma Client e aplicar migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

### Passo 4: Iniciar o projeto

**Opção A — Script automático (Windows):**
```bash
iniciar.bat
```

**Opção B — Manual (dois terminais):**
```bash
# Terminal 1 — Backend
npm start

# Terminal 2 — Frontend
cd client && npm start
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

## 📁 Estrutura do Projeto

```
Mentrix/
├── server/
│   └── index.js              # API REST completa (Express + Prisma)
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/       # Todos os componentes React
│       │   ├── TarefaForm.js / TarefaList.js
│       │   ├── FinancaForm.js / FinancaList.js / FinancaPage.jsx
│       │   ├── AlertasFinanceiros.jsx
│       │   ├── CategoriaGastos.js
│       │   ├── DashboardGraficos.js
│       │   ├── InvestimentosDashboard.jsx
│       │   ├── MetasPage.jsx
│       │   ├── HabitosGrade.jsx
│       │   ├── RotinasPage.jsx
│       │   ├── AguaTracker.js
│       │   ├── RegistroEmocional.js
│       │   ├── ListaDesejos.js
│       │   ├── EstudoForm.js
│       │   ├── TreinoForm.js / ModalConcluirTreino.js
│       │   ├── Calendario.js
│       │   ├── DatePicker.jsx
│       │   ├── InputModal.js / ConfirmModal.js
│       │   ├── ErrorBoundary.js
│       │   ├── RegisterAnimation.js
│       │   └── MitrexIcons.js
│       ├── services/
│       │   └── api.js        # Chamadas à API via Axios
│       ├── utils/
│       │   └── data.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── prisma/
│   ├── schema.prisma         # Modelos do banco de dados
│   └── migrations/           # Histórico de migrations
├── package.json
├── iniciar.bat               # Script de inicialização (Windows)
└── .env                      # Variáveis de ambiente (não versionado)
```

## 🔧 Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express |
| ORM | Prisma |
| Banco de dados | PostgreSQL (Neon) |
| Frontend | React 18 |
| Gráficos | Recharts |
| Ícones | Lucide React |
| HTTP Client | Axios |

## 🧠 Organização Inteligente de Tarefas

Ao adicionar uma tarefa, o sistema analisa o texto automaticamente:

| Exemplo | Resultado |
|---|---|
| "Preciso fazer academia amanhã" | Categoria: Saúde, Tipo: Treino |
| "Estudar React para projeto" | Categoria: Estudos, Tipo: Estudo |
| "Reunião com cliente urgente" | Categoria: Trabalho, Prioridade: 🔴 Urgente |
| "Comprar leite e pão" | Categoria: Pessoal, Tipo: Tarefa |
| "Ideia: app de produtividade" | Categoria: Ideias, Tipo: Tarefa |

## 📝 Próximas Melhorias

- [ ] Sistema de notificações/lembretes
- [ ] Exportação de dados (JSON, CSV, PDF)
- [ ] Sincronização com Google Calendar
- [ ] Backup automático
- [ ] Aplicativo mobile
- [ ] Autenticação de usuários

## 📄 Licença

MIT — desenvolvido por [Wingedzy](https://github.com/Wingedzy)
