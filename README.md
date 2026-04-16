# 🎯 Central de Produtividade com IA

Uma aplicação completa para gerenciar sua rotina, estudos, treinos e ter um assistente de IA para organização inteligente de tarefas.

## ✨ Funcionalidades

### 📋 Gerenciamento de Tarefas
- Adicionar, editar e excluir tarefas
- Classificação por prioridade (Urgente, Importante, Normal, Baixa)
- Tags para categorização
- Status: Pendente, Em andamento, Concluído, Cancelado
- **Sistema inteligente de organização**: A IA analisa suas tarefas e sugere categorização e priorização automática

### 📚 Controle de Estudos
- Planejamento de sessões de estudo
- Definição de assunto, tópico e duração
- Registro de tempo real gasto
- Controle de conclusão

### 🏋️ Controle de Treinos
- Registro de diferentes tipos de treino (Musculação, Cardio, Funcional, Esportivo)
- Lista de exercícios
- Duração e intensidade
- Histórico completo

### 🤖 Assistente IA
- Chat interativo sem necessidade de login
- A IA ajuda a organizar suas ideias e afazeres
- Sugere automaticamente como categorizar suas solicitações
- Integração direta com as outras funcionalidades

### 🧠 Sistema Inteligente de Organização
Quando você adiciona uma tarefa, o sistema:
1. **Analisa o conteúdo** para detectar categorias (saúde, trabalho, estudos, pessoal, ideias)
2. **Define prioridade** baseada em palavras-chave (urgente, importante, etc.)
3. **Sugere uma data** baseada na urgência
4. **Fornece dicas** de como organizar melhor

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ instalado

### Passo 1: Instalar Dependências

```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client && npm install && cd ..
```

### Passo 2: Iniciar o Backend

```bash
npm start
```

O servidor rodará em `http://localhost:3001`

### Passo 3: Iniciar o Frontend

Em outro terminal:

```bash
cd client
npm start
```

O frontend estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
projeto/
├── server/
│   └── index.js          # API e lógica do backend
├── client/
│   ├── public/
│   │   └── index.html    # HTML base
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   │   ├── TarefaForm.js
│   │   │   ├── TarefaList.js
│   │   │   ├── EstudoForm.js
│   │   │   ├── TreinoForm.js
│   │   │   └── ChatIA.js
│   │   ├── services/
│   │   │   └── api.js    # Configuração Axios e chamadas API
│   │   ├── App.js        # Componente principal
│   │   ├── index.js      # Ponto de entrada
│   │   └── index.css     # Estilos globais
│   └── package.json
├── package.json          # Dependências do backend
├── README.md
└── database.sqlite       # Banco SQLite (gerado automaticamente)
```

## 💡 Como Usar a Funcionalidade Especial de Organização

### Cenário 1: Você tem uma ideia ou afazer
1. Vá até a aba "📋 Tarefas"
2. Adicione sua ideia/afazer no formulário
3. O sistema automaticamente:
   - Detecta a categoria (ex: "academia" → Saúde)
   - Sugere uma prioridade
   - Recomenda uma data
   - Fornece uma dica personalizada

### Cenário 2: Você quer apenas passar algo para a IA organizar
1. Vá até a aba "🤖 IA"
2. Digite sua ideia/afazer no chat
3. A IA responderá com sugestões de como categorizar
4. Você pode então adicionar nas abas apropriadas

### Exemplos de Detecção Automática:

- **"Preciso fazer academia amanhã"** → Categoria: Saúde, Tipo: Treino
- **"Estudar React para projeto"** → Categoria: Estudos, Tipo: Estudo
- **"Reunião com cliente urgente"** → Categoria: Trabalho, Prioridade: Urgente
- **"Comprar leite e pão"** → Categoria: Pessoal, Tipo: Tarefa
- **"Ideia: app de produtividade"** → Categoria: Ideias, Tipo: Tarefa

## 🔧 Tecnologias

- **Backend**: Node.js + Express
- **Database**: SQLite (local, sem necessidade de servidor externo)
- **Frontend**: React + TypeScript
- **Estilização**: CSS puro (sem framework)
- **API**: RESTful

## 📊 Dashboard

A página inicial mostra um resumo completo:
- Tarefas pendentes e concluídas
- Estudos pendentes
- Treinos pendentes
- Listas de próximos itens

## 🔒 Sobre Login

**Não há necessidade de login!** Todos os dados são armazenados localmente no banco SQLite. Isto é ideal para uso pessoal e rápido prototipagem.

## 📝 Próximas Melhorias Sugeridas

- [ ] Sistema de notificações/lembretes
- [ ] Exportação de dados (JSON, CSV, PDF)
- [ ] Gráficos de progresso
- [ ] Sincronização com Google Calendar
- [ ] Modo escuro
- [ ] Backup automático
- [ ] Integração com API de IA externa (OpenAI, Claude, etc.)
- [ ] Aplicativo mobile

## 🐛 Problemas Conhecidos

- Banco de dados local: se você apagar a pasta do projeto, perde os dados
- Sem sistema de backup automático (por enquanto)

## 📄 Licença

MIT

---

Desenvolvido com ❤️ para maximizar sua produtividade!