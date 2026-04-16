# 🐛 Guia de Diagnóstico - Erros no Frontend

## 📋 Possíveis Problemas e Soluções

### 1. **CARREGAMENTO INFINITO**

**Causa:** Frontend não consegue se conectar ao backend

**Diagnóstico:**
```bash
# No terminal, verifique se o backend está rodando:
curl http://localhost:3001/api/tarefas
# Deve retornar: []
```

**Solução:**
- Certifique-se que o backend está rodando na porta 3001
- Verifique se não há firewall bloqueando
- Tente acessar `http://localhost:3001/api/tarefas` diretamente no navegador

---

### 2. **ERRO NO CONSOLE DO NAVEGADOR**

**Abra o DevTools (F12) → Console**

**Erros comuns:**

```
❌ "Failed to fetch"
→ Backend não está rodando ou URL errada

❌ "Unexpected token < in JSON"
→ Backend retornando HTML em vez de JSON (erro no backend)

❌ "Uncaught TypeError: Cannot read properties of undefined"
→ Dados da API não estão no formato esperado
```

**Solução:**
1. Verifique se a API URL está correta em `client/src/services/api.js`
2. Teste o backend diretamente com curl ou navegador
3. Verifique se há erros no console do backend

---

### 3. **ERRO DE BUILD/COMPILAÇÃO**

```
SyntaxError: Unexpected character
```

**Causa:** Emojis ou caracteres especiais fora de strings

**Solução:**
- Verificar se todos os emojis estão dentro de backticks `` ` `` ou aspas
- Não usar emojis diretamente em código JSX fora de strings

---

### 4. **TELA BRANCA/BLACK SCREEN**

**Causa:** Erro no React que não está sendo capturado

**Solução:**
- Verifique o ErrorBoundary (agora está ativo!)
- Abra o console do navegador para ver o erro exato
- Procure por `Uncaught Error` ou `Invariant Violation`

---

## 🔧 FERRAMENTAS DE DEBUG

### 1. **Logs Detalhados**
A aplicação agora tem logs em cada etapa:
- `🔌 API Configuration:` - Mostra URL da API
- `🔄 Iniciando carregamento de dados...`
- `📡 Requisitando dados da API...`
- `➡️ REQUEST:` - Cada requisição
- `✅ RESPONSE:` - Respostas bem-sucedidas
- `❌ ERROR:` - Erros

** Veja tudo no console do navegador (F12) **

---

### 2. **Tela de Loading**
Mostra claramente quando está carregando:
```
◈ INICIALIZANDO SISTEMA
Conectando ao núcleo neural... Aguarde.
```

Se ficar preso aqui → Problema de conexão com API

---

### 3. **ErrorBoundary**
Captura qualquer erro e mostra:
```
⚠ SISTEMA FALHOU
ERRO: <mensagem do erro>
◈ RECARREGAR SISTEMA
```

---

## 🚀 TESTE RÁPIDO

### Passo 1: Teste o Backend
```bash
# No terminal 1
npm start
# Deve mostrar: 🚀 Servidor rodando na porta 3001

# Em outro terminal, teste:
curl http://localhost:3001/api/tarefas
# Deve retornar: []
```

### Passo 2: Teste o Frontend
```bash
# No terminal 2
cd client && npm start
# Abra: http://localhost:3000
```

### Passo 3: Verifique os Logs
1. Pressione F12
2. Abra a aba "Console"
3. Deverá ver:
```
🔌 API Configuration: {API_URL: "http://localhost:3001/api"}
🔄 Iniciando carregamento de dados...
📡 Requisitando dados da API...
➡️  REQUEST: GET /api/tarefas
✅ RESPONSE: 200 /api/tarefas
✅ Tarefas carregadas: 0
✅ Estudos carregadas: 0
✅ Treinos carregadas: 0
```

---

## 🆘 VERSÃO DE EMERGÊNCIA (SIMPLIFICADA)

Se a interface cyberpunk estiver causando problemas, criei uma versão ultra-simples:

**Crie um arquivo `client/src/App-Simple.js`:**

```javascript
import React, { useState, useEffect } from 'react';
import { tarefasAPI, estudosAPI, treinosAPI } from './services/api';

function AppSimple() {
  const [tarefas, setTarefas] = useState([]);
  const [estudos, setEstudos] = useState([]);
  const [treinos, setTreinos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, e, tr] = await Promise.all([
          tarefasAPI.getAll(),
          estudosAPI.getAll(),
          treinosAPI.getAll()
        ]);
        setTarefas(t.data);
        setEstudos(e.data);
        setTreinos(tr.data);
      } catch (err) {
        console.error('Erro:', err);
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Central de Produtividade - Modo Seguro</h1>
      <p>Tarefas: {tarefas.length}</p>
      <p>Estudos: {estudos.length}</p>
      <p>Treinos: {treinos.length}</p>
    </div>
  );
}

export default AppSimple;
```

Para usar:
1. Renomeie `App.js` para `App-complex.js`
2. Renomeie `App-Simple.js` para `App.js`
3. Rode `npm start` novamente

---

## 📊 CHECKLIST DE VERIFICAÇÃO

- [ ] Backend rodando na porta 3001
- [ ] `http://localhost:3001/api/tarefas` retorna `[]`
- [ ] Frontend rodando na porta 3000
- [ ] Console do navegador SEM erros
- [ ] Logs de API aparecem no console
- [ ] Loading somece depois de alguns segundos
- [ ] Não há loop infinito (useEffect só roda 1x)

---

## 🎯 PROBLEMAS ESPECÍFICOS DO CYBERPUNK

Se o problema for específico da interface cyberpunk:

1. **Erro de CSS**: Verifique se todas as variáveis CSS estão definidas
2. **Fonte não carrega**: Orbitron pode não carregar (fallback para sans-serif)
3. **Emojis não aparecem**: Use emojis nativos, não Unicode excessivo

---

## 📞 COMANDOS ÚTEIS

```bash
# Limpar cache do React
rm -rf client/node_modules/.cache

# Reinstalar tudo
rm -rf node_modules client/node_modules
npm install && cd client && npm install && cd ..

# Ver logs do backend em tempo real
# (Ctrl+C para parar)
node server/index.js

# Testar API diretamente
curl -v http://localhost:3001/api/tarefas
```

---

**Se nada funcionar, crie um arquivo `debug.log` com:**
1. Print do console do navegador (F12 → Console)
2. Output do `curl http://localhost:3001/api/tarefas`
3. Mensagens do terminal do backend

Isso vai ajudar a identicar exatamente o problema!