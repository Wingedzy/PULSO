# Architecture Documentation

## System Overview

Mentrix follows a 3-tier architecture pattern with clear separation between frontend, backend, and data storage.

## Component Architecture

### Frontend Layer (React)

**Location:** `client/src/`

#### Main Components
- **App.js** - Root component managing application state
- **TarefaForm.js / TarefaList.js** - Task management interface
- **EstudoForm.js** - Study session management
- **TreinoForm.js** - Workout session management
- **ChatIA.js** - Interactive AI assistant
- **DashboardGraficos.js** - Main dashboard with visualizations
- **ErrorBoundary.js** - Error handling wrapper

#### Services Layer
**Location:** `client/src/services/api.js`

Provides a clean API abstraction layer using Axios:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});
```

#### State Management
- **Local Component State:** React `useState` for UI state
- **API State:** Axios-based HTTP client
- **Data Flow:** Unidirectional (Parent → Child via props)

### Backend Layer (Express)

**Location:** `server/`

#### Core Architecture

**1. Data Layer**
- **File:** `server/index.js`
- **Storage:** SQLite database (`database.sqlite`)
- **Models:** In-memory data structures with persistence

**2. Business Logic Layer**
- **TaskOrganizer Class:** Intelligent task categorization and prioritization
- **AI Assistant:** Interactive chat for task organization
- **Validation Layer:** Input validation and sanitization

**3. API Layer**
- **Framework:** Express.js
- **Middleware:** CORS, body-parser, security headers
- **Routing:** RESTful API design

#### Key Classes

##### TaskOrganizer
```javascript
class TaskOrganizer {
  // Analyzes task content for categorization
  analisarTarefa(titulo, descricao)
  
  // Assigns priority based on keywords
  priorizarTarefa(titulo, descricao)
  
  // Suggests due dates based on urgency
  sugerirData(prioridade)
  
  // Organizes ideas into actionable tasks
  organizarIdeia(titulo, descricao)
}
```

#### Data Flow

```
[Frontend] → HTTP Request → [Express Router] → [Business Logic] → [SQLite]
     ↓                                          ↓
[Display]   ← [Response] ← [Controller] ← [Model] ← [Database]
```

**Request Flow:**
1. User interacts with React component
2. Component calls Axios service method
3. Axios sends HTTP request to Express server
4. Express routes request to appropriate handler
5. Handler processes business logic (TaskOrganizer)
6. Data read/written to SQLite database
7. Response sent back to frontend
8. Component updates UI

### Data Layer

**Database:** `server/database.sqlite`

SQLite provides lightweight, file-based persistence without requiring a separate database server.

**Data Models:**

**Task:**
```javascript
{
  id: "uuid",
  titulo: "string",
  descricao: "string",
  data: "YYYY-MM-DD",
  prioridade: 1|2|3|4,
  status: "pendente|em-andamento|concluido|cancelado",
  tags: ["string"],
  created_at: "ISO",
  updated_at: "ISO"
}
```

## Integration Points

### API Configuration
- **Frontend Base URL:** `process.env.REACT_APP_API_URL || 'http://localhost:3001/api'`
- **Backend Port:** `process.env.PORT || 3001`
- **Frontend Port:** `3000` (development)
- **Proxy Setup:** `client/package.json` → `"proxy": "http://localhost:3001"`

### CORS Configuration
- Enabled for frontend-backend communication
- Allows development on localhost:3000 to access localhost:3001

## Design Patterns

### 1. MVC Pattern
- **Model:** Data structures and SQLite storage
- **View:** React components
- **Controller:** Express routes and handlers

### 2. Service Layer
- API methods abstracted in service modules
- Single source of truth for API endpoints
- Easy to mock for testing

### 3. Event-Driven Architecture
- State changes trigger UI updates
- API responses update component state
- No direct DOM manipulation

## Security Architecture

### Backend Security
- **Helmet:** Security headers (XSS, CSP, etc.)
- **Rate Limiting:** Prevents API abuse
- **Input Validation:** Sanitization and verification

### Frontend Security
- **HTTPS:** Required in production
- **Input Sanitization:** Prevents XSS
- **Error Boundaries:** Graceful error handling

## Scalability Considerations

### Current Strengths
- SQLite provides zero-configuration persistence
- Lightweight and fast for local development
- No external database server required
- Easy deployment and portability

### Future Improvements
- Add caching layer for frequent queries
- Implement connection pooling
- Add comprehensive logging
- Consider PostgreSQL for production scale