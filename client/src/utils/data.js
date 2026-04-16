export const hojeLocal = () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const normalizarData = (valor) => {
  if (!valor) return '';

  if (typeof valor === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
    if (valor.includes('T')) return valor.split('T')[0];
  }

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};