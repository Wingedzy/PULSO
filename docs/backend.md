# Backend Documentation

## Server Structure

**Location:** `server/index.js`

### File Overview

```
server/
├── index.js          # Main server file (all routes and logic)
├── database.sqlite   # SQLite database file
└── node_modules/     # Dependencies
```

## Core Server Setup

### Express Configuration

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
```

### Middleware Stack

1. **CORS:** Allows cross-origin requests for frontend development
2. **JSON Parser:** Parses JSON request bodies
3. **Helmet:** Security headers (XSS, CSP, etc.)
4. **Rate Limiting:** Prevents API abuse

## Data Layer

### SQLite Database

**Location:** `server/database.sqlite`

SQLite provides lightweight, file-based persistence without requiring a separate database server.

### Database Initialization

```javascript
const dbPath = path.join(__dirname, 'database.sqlite');

// Initialize database with required tables
const initializeDB = () => {
  const db = new sqlite3.Database(dbPath);
  
  // Create tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    priority INTEGER,
    status TEXT,
    tags TEXT,
    created_at TEXT,
    updated_at TEXT
  )`);
  
  // Create studies table
  db.run(`CREATE TABLE IF NOT EXISTS studies (
    id TEXT PRIMARY KEY,
    assunto TEXT,
    topico TEXT,
    duracao_planejada INTEGER,
    data TEXT,
    duracao_real INTEGER,
    concluido INTEGER,
    created_at TEXT
  )`);
  
  // Create treinos table
  db.run(`CREATE TABLE IF NOT EXISTS treinos (
    id TEXT PRIMARY KEY,
    tipo TEXT,
    exercicios TEXT,
    data TEXT,
    duracao INTEGER,
    intensidade TEXT,
    concluido INTEGER,
    created_at TEXT
  )`);
};
```

### Data Persistence

SQLite stores data in a single file (`database.sqlite`) in the server directory. This provides:
- Zero-configuration setup
- File-based backup capability
- Cross-platform compatibility
- ACID-compliant transactions

## Business Logic Layer

### TaskOrganizer Class

**Purpose:** Intelligent task categorization and prioritization

#### Methods

##### `analisarTarefa(titulo, descricao)`
Analyzes task text to detect categories based on keyword matching.

```javascript
analisarTarefa(titulo, descricao) {
  const texto = `${titulo} ${descricao || ''}`.toLowerCase();
  const detectadas = {};
  
  for (const [cat, palavras] of Object.entries(this.categorias)) {
    const count = palavras.filter(p => texto.includes(p)).length;
    if (count > 0) detectadas[cat] = count;
  }
  
  return detectadas;
}
```

**Categories:**
- `saude`: ['academia', 'treino', 'exercício', 'corrida', 'meditação', 'yoga']
- `trabalho`: ['relatório', 'reunião', 'projeto', 'cliente', 'apresentação']
- `estudos`: ['estudar', 'curso', 'aula', 'concurso', 'exame']
- `pessoal`: ['comprar', 'pagar', 'organizar', 'casa', 'dentista']
- `ideias`: ['ideia', 'planejar', 'criar', 'inovar', 'app']

##### `priorizarTarefa(titulo, descricao)`
Assigns priority based on urgency keywords.

```javascript
priorizarTarefa(titulo, descricao) {
  const texto = `${titulo} ${descricao || ''}`.toLowerCase();
  
  if (['urgente','hoje','agora'].some(p => texto.includes(p))) return 1;
  if (['importante','prioridade','fundamental'].some(p => texto.includes(p))) return 2;
  return 3;
}
```

**Priority Levels:**
- `1`: URGENTE (red)
- `2`: Importante (yellow)
- `3`: Normal (green)

##### `sugerirData(prioridade)`
Suggests due dates based on priority.

```javascript
sugerirData(prioridade) {
  const d = new Date();
  d.setDate(d.getDate() + (prioridade === 1 ? 0 : 
               prioridade === 2 ? 1 : 3));
  return d.toISOString().split('T')[0];
}
```

### AI Assistant

**Purpose:** Interactive chat for task organization and idea processing

#### Features
- Natural language understanding
- Automatic categorization suggestions
- Priority assessment
- Context-aware recommendations

#### Integration
The AI assistant processes user input through the TaskOrganizer logic and provides:
1. Category detection
2. Priority assignment
3. Due date suggestions
4. Actionable recommendations

## API Routes

### Task Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tarefas` | Get all tasks |
| POST | `/api/tarefas` | Create new task |
| PUT | `/api/tarefas/:id` | Update task |
| DELETE | `/api/tarefas/:id` | Delete task |
| PUT | `/api/tarefas/:id/concluir` | Mark as complete |

### Study Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/estudos` | Get all studies |
| POST | `/api/estudos` | Create study session |
| PUT | `/api/estudos/:id/concluir` | Complete study |

### Workout Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/treinos` | Get all workouts |
| POST | `/api/treinos` | Create workout |
| PUT | `/api/treinos/:id/concluir` | Complete workout |

### Configuration Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/categorias` | Get categories |
| POST | `/api/categorias` | Create category |

## Error Handling

### Error Responses

```javascript
// 400 Bad Request
{
  "error": "Validation failed",
  "details": "Field 'priority' must be 1-4"
}

// 404 Not Found
{
  "error": "Task not found",
  "taskId": "invalid-uuid"
}

// 500 Internal Server Error
{
  "error": "Database error",
  "message": "Failed to execute query"
}
```

## Security Implementation

### Backend Security

**1. Helmet Middleware**
- XSS protection
- CSP policies
- Frame protection

**2. Rate Limiting**
- Prevents brute force attacks
- Default: 100 requests per minute

**3. Input Validation**
- All data validated before processing
- Type checking and sanitization

**4. CORS Configuration**
- Restricts origins to localhost:3000
- Prevents unauthorized cross-origin requests

## Performance Considerations

### Current Optimizations
1. **SQLite WAL mode:** Improved write concurrency
2. **Prepared statements:** Reduced SQL parsing overhead
3. **Connection pooling:** Efficient database connections

### Future Improvements
1. Add query result caching
2. Implement database migrations
3. Add comprehensive logging
4. Consider PostgreSQL for production scale