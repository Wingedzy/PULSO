import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

const financasAPI = {
  getAll:           (params = {}) => api.get('/financas', { params }),
  getAllWithDetails: (params = {}) => api.get('/financas', { params }),
  create:           (data)        => api.post('/financas', data),
  update:           (id, data)    => api.put(`/financas/${id}`, data),
  delete:           (id)          => api.delete(`/financas/${id}`),
  getTiposGastos:   ()            => api.get('/financas/tipos-gastos'),
  getResumo:        (params = {}) => api.get('/financas/resumo', { params }),
  confirmar:        (transacoes, confirmacao) => api.post('/financas/confirmar', { transacoes, confirmacao }),
};

const tarefasAPI = {
  getAll:   ()          => api.get('/tarefas'),
  create:   (data)      => api.post('/tarefas', data),
  update:   (id, data)  => api.put(`/tarefas/${id}`, data),
  delete:   (id)        => api.delete(`/tarefas/${id}`),
  concluir: (id)        => api.put(`/tarefas/${id}/concluir`),
};

const estudosAPI = {
  getAll:   ()                  => api.get('/estudos'),
  create:   (data)              => api.post('/estudos', data),
  update:   (id, data)          => api.put(`/estudos/${id}`, data),
  delete:   (id)                => api.delete(`/estudos/${id}`),
  concluir: (id, duracao)       => api.put(`/estudos/${id}/concluir`, { duracao }),
};

const treinosAPI = {
  getAll:   ()         => api.get('/treinos'),
  create:   (data)     => api.post('/treinos', data),
  update:   (id, data) => api.put(`/treinos/${id}`, data),
  delete:   (id)       => api.delete(`/treinos/${id}`),
  concluir: (id)       => api.put(`/treinos/${id}/concluir`),
};

const tiposPagamentoAPI = {
  getAll:   ()          => api.get('/tipos-pagamento'),
  create:   (data)      => api.post('/tipos-pagamento', data),
  update:   (id, data)  => api.put(`/tipos-pagamento/${id}`, data),
  delete:   (id)        => api.delete(`/tipos-pagamento/${id}`),
};

const bancosAPI = {
  getAll:   ()          => api.get('/bancos'),
  create:   (data)      => api.post('/bancos', data),
  update:   (id, data)  => api.put(`/bancos/${id}`, data),
  delete:   (id)        => api.delete(`/bancos/${id}`),
};

const categoriasAPI = {
  getAll:   ()          => api.get('/categorias'),
  create:   (data)      => api.post('/categorias', data),
  update:   (id, data)  => api.put(`/categorias/${id}`, data),
  delete:   (id)        => api.delete(`/categorias/${id}`),
};

const conversasAPI = {
  getAll:        ()              => api.get('/conversas'),
  create:        (data)          => api.post('/conversas', data),
  getMensagens:  (id)            => api.get(`/conversas/${id}/mensagens`),
  sendMensagem:  (id, data)      => api.post(`/conversas/${id}/mensagens`, data),
};

export {
  financasAPI,
  tarefasAPI,
  estudosAPI,
  treinosAPI,
  tiposPagamentoAPI,
  bancosAPI,
  categoriasAPI,
  conversasAPI,
};