# Frontend Documentation

## React Application Structure

**Location:** `client/src/`

### Component Hierarchy

```
App.js (Root)
├── DashboardGraficos.js (Main dashboard)
│   ├── Charts for data visualization
│   └── Summary cards
├── TarefaForm.js (Task creation form)
├── TarefaList.js (Task list display)
├── EstudoForm.js (Study session form)
├── TreinoForm.js (Workout form)
├── ChatIA.js (Interactive AI assistant)
├── Calendario.js (Date picker)
├── InputModal.js (Generic modal)
├── ConfirmModal.js (Confirmation modal)
└── ErrorBoundary.js (Error handling)
```

### App State Management

**Local State (useState):**
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
const [tarefas, setTarefas] = useState([]);
const [estudos, setEstudos] = useState([]);
const [treinos, setTreinos] = useState([]);
const [financas, setFinancas] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Derived State:**
- Filtered financial transactions based on month/year/type
- Sorted task lists by priority/due date
- Aggregated statistics for dashboards

## Service Layer

### API Client Configuration

**File:** `client/src/services/api.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});
```

**Environment Variables:**
- `REACT_APP_API_URL` - Override base API URL (default: `http://localhost:3001/api`)
- Proxy configured in `client/package.json`: `"proxy": "http://localhost:3001"`

### API Service Modules

#### Task Service (`tarefasAPI`)
```javascript
const tarefasAPI = {
  getAll:   ()          => api.get('/tarefas'),
  create:   (data)      => api.post('/tarefas', data),
  update:   (id, data)  => api.put(`/tarefas/${id}`, data),
  delete:   (id)        => api.delete(`/tarefas/${id}`),
  concluir: (id)        => api.put(`/tarefas/${id}/concluir`),
};
```

#### Study Service (`estudosAPI`)
```javascript
const estudosAPI = {
  getAll:   ()                  => api.get('/estudos'),
  create:   (data)              => api.post('/estudos', data),
  update:   (id, data)          => api.put(`/estudos/${id}`, data),
  delete:   (id)                => api.delete(`/estudos/${id}`),
  concluir: (id, duracao)       => api.put(`/estudos/${id}/concluir`, { duracao }),
};
```

#### Workout Service (`treinosAPI`)
```javascript
const treinosAPI = {
  getAll:   ()         => api.get('/treinos'),
  create:   (data)     => api.post('/treinos', data),
  update:   (id, data) => api.put(`/treinos/${id}`, data),
  delete:   (id)       => api.delete(`/treinos/${id}`),
  concluir: (id)       => api.put(`/treinos/${id}/concluir`),
};
```

#### Chat Service (`conversasAPI`)
```javascript
const conversasAPI = {
  getAll:        ()              => api.get('/conversas'),
  create:        (data)          => api.post('/conversas', data),
  getMensagens:  (id)            => api.get(`/conversas/${id}/mensagens`),
  sendMensagem:  (id, data)      => api.post(`/conversas/${id}/mensagens`, data),
};
```

## Data Fetching Patterns

### Initial Data Load

```javascript
const carregarDados = async () => {
  setLoading(true);
  setError(null);
  try {
    const [tarefasRes, estudosRes, treinosRes] = await Promise.allSettled([
      tarefasAPI.getAll(),
      estudosAPI.getAll(),
      treinosAPI.getAll(),
    ]);
    
    const arr = (r) => {
      if (Array.isArray(r?.data)) return r.data;
      if (Array.isArray(r?.data?.data)) return r.data.data;
      return [];
    };
    
    if (tarefasRes.status === 'fulfilled') setTarefas(arr(tarefasRes.value));
    if (estudosRes.status === 'fulfilled') setEstudos(arr(estudosRes.value));
    if (treinosRes.status === 'fulfilled') setTreinos(arr(treinosRes.value));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Real-time Updates

```javascript
// After creating a task
const handleTarefaCriada = (nova) => setTarefas(prev => [nova, ...prev]);

// After updating
const handleTarefaAtualizada = () => carregarDados();
```

## UI Components

### Dashboard View
- **Main Metrics:** Total tasks, completed tasks, upcoming deadlines
- **Charts:** Spending by category, study progress, workout frequency
- **Quick Actions:** Create task, start study, log workout

### Task Management
- **TaskForm:** Input fields for title, description, date, priority, category
- **TaskList:** Display tasks with status indicators and priority colors
- **Drag & Drop:** Reorder tasks by priority

### Study Sessions
- **EstudoForm:** Subject, topic, duration input
- **Progress Tracking:** Timer and completion status
- **History:** Past study sessions with performance metrics

### Workout Tracking
- **TreinoForm:** Exercise type, sets, reps, intensity
- **Progress Charts:** Strength gains over time
- **Routine Suggestions:** Based on goals and history

### AI Assistant
- **ChatIA.js:** Interactive chat interface
- **Context-aware responses**
- **Task suggestions based on conversation**

## Utility Functions

### Date Handling
```javascript
function normalizarData(data) {
  if (!data) return null;
  return String(data).slice(0, 10);
}

function formatarData(data) {
  const d = normalizarData(data);
  if (!d) return '—';
  const [ano, mes, dia] = d.split('-');
  return `${dia}/${mes}/${ano}`;
}
```

### Data Normalization
```javascript
const arr = (r) => {
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.data?.data)) return r.data.data;
  return [];
};
```

## Error Handling

### Error Boundary Component
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Styling

### CSS Architecture
- **Global Styles:** `index.css` - Base styles, resets, typography
- **Component Styles:** Inline styles or CSS modules
- **Responsive Design:** Mobile-first approach
- **Theme:** Consistent color palette for priorities
  - Red = Urgente
  - Yellow = Importante
  - Green = Normal

## Development Best Practices

### Code Organization
- Feature-based folder structure
- Shared hooks for common logic
- Type-safe props with PropTypes
- Comprehensive error logging

### Testing Strategy
- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for API flows
- E2E tests for critical user journeys