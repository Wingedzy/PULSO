# 🚀 Como Executar a Central de Produtividade

## Método 1: Desenvolvimento Local (Recomendado)

### Passo 1: Instalar Dependências

```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client && npm install && cd ..
```

### Passo 2: Iniciar o Backend

No primeiro terminal:

```bash
npm start
```

O backend será iniciado em `http://localhost:3001`

### Passo 3: Iniciar o Frontend

No segundo terminal:

```bash
cd client
npm start
```

O frontend será aberto automaticamente em `http://localhost:3000`

## Método 2: Script Automatizado

No Windows, execute:
```
start.bat
```

No Linux/Mac, execute:
```bash
./start.sh
```

## 📋 Funcionalidades

### 1. 📋 Gerenciamento de Tarefas
- Adicione tarefas com título, descrição e data
- Defina prioridades (🔴 Urgente, 🟡 Importante, 🟢 Normal, etc.)
- Classifique com tags (trabalho, saúde, etc.)
- Sistema inteligente de organização automática

### 2. 📚 Planejamento de Estudos
- Registre sessões de estudo
- Defina assunto, tópico e duração
- Marque como concluído quando finalizar
- Registre tempo real gasto

### 3. 🏋️ Controle de Treinos
- Escolha tipo: Musculação, Cardio, Funcional, Esportivo
- Liste exercícios
- Registre duração e intensidade
- Histórico completo

### 4. 🤖 Chat com IA Organizadora
- Passe suas ideias e afazeres para a IA
- A IA sugere como categorizar
- Integração direta com as outras seções

## 🧠 Como Usar a Organização Inteligente

Quando você adicionar uma tarefa, o sistema analisa automaticamente:

**Exemplo 1:**
```
Título: "Preciso fazer academia hoje"
→ Tipo: treino (detectou "academia")
→ Prioridade: Altra (detectou "hoje")
→ Data: hoje
```

**Exemplo 2:**
```
Título: "Estudar React para projeto"
→ Tipo: estudo (detectou "estudar")
→ Prioridade: Importante (detectou contexto)
→ Data: amanhã
```

**Exemplo 3:**
```
Título: "Reunião com cliente urgente"
→ Tipo: tarefa (trabalho)
→ Prioridade: Urgente (detectou "urgente" e "cliente")
→ Data: hoje
```

## 📊 Dashboard

A página inicial mostra resumo completo com:
- Números de tarefas, estudos e treinos pendentes
- Lista de próximas tarefas
- Próximos estudos agendados
- Treinos recentes

## 💾 Armazenamento

Os dados são salvos localmente em:
```
server/data/database.json
```

Não há login necessário - tudo é armazenado no seu computador.

## 🔧 Personalização

### Cores e Tags
- 🔴 Urgente: precisa ser feito hoje
- 🟡 Importante: deve ser feito em breve
- 🟢 Normal: pode ser feito com calma

### Categorias Detectadas
- **Saúde**: academia, treino, exercício, caminhada
- **Trabalho**: reunião, projeto, email, cliente
- **Estudos**: estudar, curso, livro, ler
- **Pessoal**: comprar, marcar, ligar, pagar
- **Ideias**: ideia, planejar, criar, desenvolver

## 🐛 Troubleshooting

### Porta 3001 já em uso
Altere a porta no arquivo `server/index.js`:
```javascript
const PORT = 3002; // ou outra porta livre
```

### Erro "Cannot find module"
Execute `npm install` novamente no backend.

### Frontend não conecta
Verifique se o backend está rodando em `http://localhost:3001`

## 📱 Compatibilidade

- Chrome, Firefox, Safari, Edge (últimas versões)
- Responsivo para desktop e tablets
- Funciona offline (depois de carregado)

---

**Pronto!** Sua central de produtividade está configurada e pronta para uso.