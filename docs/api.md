# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

None required for development. All endpoints accept requests without authentication headers.

## Request Format

All requests use JSON format:

```http
Content-Type: application/json
Accept: application/json
```

## Response Format

All responses follow this structure:

```json
{
  "status": "success|error",
  "data": { /* response payload */ },
  "timestamp": "ISO-8601 timestamp"
}
```

**Error responses:**

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* additional context */ }
  },
  "timestamp": "ISO-8601 timestamp"
}
```

## Financial Endpoints

### Get All Financial Transactions

**Endpoint:** `GET /api/financas`

**Query Parameters:**
- `mes` (number, optional) - Month (1-12)
- `ano` (number, optional) - Year (e.g., 2026)
- `tipo` (string, optional) - Filter by type: `todos`, `entrada`, `gasto`

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "type": "income|expense",
      "amount": 150.50,
      "currency": "BRL",
      "date": "2026-04-15",
      "description": "Freelance payment",
      "category": "freelance",
      "created_at": "2026-04-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Get Expense Categories

**Endpoint:** `GET /api/financas/tipos-gastos`

**Response (200):**
```json
{
  "status": "success",
  "data": [
    "alimentacao",
    "transporte",
    "moradia",
    "saude",
    "lazer",
    "educacao",
    "vestuario",
    "investimento",
    "salario",
    "freelance",
    "outros"
  ],
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Get Financial Summary

**Endpoint:** `GET /api/financas/resumo`

**Query Parameters:**
- `mes` (number, optional) - Month (1-12)
- `ano` (number, optional) - Year (e.g., 2026)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_entradas": 5000.00,
    "total_gastos": 3200.50,
    "saldo": 1799.50,
    "categorias_maior_gasto": "alimentacao",
    "transacoes_por_categoria": {
      "alimentacao": 1200.00,
      "transporte": 450.50,
      "saude": 300.00
    }
  },
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Create Transaction

**Endpoint:** `POST /api/financas`

**Request Body:**
```json
{
  "type": "income|expense",
  "amount": 150.50,
  "currency": "BRL",
  "date": "2026-04-15",
  "description": "Freelance project payment",
  "category": "freelance"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "type": "income",
    "amount": 150.50,
    "currency": "BRL",
    "date": "2026-04-15",
    "description": "Freelance project payment",
    "category": "freelance",
    "created_at": "2026-04-16T04:53:00.000Z"
  },
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Update Transaction

**Endpoint:** `PUT /api/financas/:id`

**Request Body:**
```json
{
  "type": "income|expense",
  "amount": 175.50,
  "description": "Updated payment description"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "type": "income",
    "amount": 175.50,
    "date": "2026-04-15",
    "updated_at": "2026-04-16T05:00:00.000Z"
  },
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Delete Transaction

**Endpoint:** `DELETE /api/financas/:id`

**Response (200):**
```json
{
  "status": "success",
  "data": null,
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Confirm Transactions

**Endpoint:** `POST /api/financas/confirmar`

**Request Body:**
```json
{
  "transacoes": ["uuid1", "uuid2"],
  "confirmacao": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "confirmadas": ["uuid1", "uuid2"],
    "pendentes": []
  },
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

## Task Endpoints

### Get All Tasks

**Endpoint:** `GET /api/tarefas`

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "tipo": "tarefa",
      "titulo": "Complete project report",
      "descricao": "Finish the quarterly report",
      "data": "2026-04-20",
      "prioridade": 2,
      "status": "pendente",
      "tags": ["trabalho", "urgente"],
      "created_at": "2026-04-16T04:53:00.000Z",
      "updated_at": "2026-04-16T04:53:00.000Z"
    }
  ],
  "timestamp": "2026-04-16T04:53:00.000Z"
}
```

### Create Task

**Endpoint:** `POST /api/tarefas`

**Request Body:**
```json
{
  "tipo": "tarefa",
  "titulo": "Complete project report",
  "descricao": "Finish the quarterly report",
  "data": "2026-04-20",
  "prioridade": 2,
  "tags": ["trabalho", "urgente"]
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tipo": "tarefa",
    "titulo": "Complete project report",
    "descricao": "Finish the quarterly report",
    "data": "2026-04-20",
    "prioridade": 2,
    "status": "pendente",
    "tags": ["trabalho", "urgente"],
    "created_at": "2026-04-16T04:53:00.000Z",
    "updated_at": "2026-04-16T04:53:00.000Z"
  }
}
```

### Update Task

**Endpoint:** `PUT /api/tarefas/:id`

**Request Body:**
```json
{
  "titulo": "Complete project report",
  "status": "concluido"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tipo": "tarefa",
    "titulo": "Complete project report",
    "status": "concluido",
    "updated_at": "2026-04-16T05:00:00.000Z"
  }
}
```

### Complete Task

**Endpoint:** `PUT /api/tarefas/:id/concluir`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tipo": "tarefa",
    "status": "concluido",
    "updated_at": "2026-04-16T05:00:00.000Z"
  }
}
```

## Study Endpoints

### Get All Study Sessions

**Endpoint:** `GET /api/estudos`

### Create Study Session

**Endpoint:** `POST /api/estudos`

**Request Body:**
```json
{
  "assunto": "React hooks",
  "topico": "useEffect",
  "duracao_planejada": 40,
  "data": "2026-04-16"
}
```

### Complete Study Session

**Endpoint:** `PUT /api/estudos/:id/concluir`

**Request Body:**
```json
{
  "duracao": 32
}
```

## Workout Endpoints

### Get All Workouts

**Endpoint:** `GET /api/treinos`

### Create Workout

**Endpoint:** `POST /api/treinos`

**Request Body:**
```json
{
  "tipo": "musculacao",
  "exercicios": ["Peito e Tríceps"],
  "data": "2026-04-13",
  "duracao": 60,
  "intensidade": "alta"
}
```

### Complete Workout

**Endpoint:** `PUT /api/treinos/:id/concluir`

**Request Body:**
```json
{
  "duracao": 45
}
```

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request format or validation error |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

## Rate Limiting

- **Default:** 100 requests per minute per IP
- **Exceeded response:** 429 Too Many Requests