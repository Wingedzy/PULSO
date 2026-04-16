const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'App.js');

console.log('📄 Lendo App.js...');
let content = fs.readFileSync(filePath, 'utf8');

// ==================== PASSO 1: IMPORTS ====================
console.log('✅ Passo 1: Adicionando imports de modais...');
content = content.replace(
  "import ErrorBoundary from './components/ErrorBoundary';",
  "import ErrorBoundary from './components/ErrorBoundary';\nimport ConfirmModal from './components/ConfirmModal';\nimport InputModal from './components/InputModal';"
);

// ==================== PASSO 2: REMOVER ABA IA DO TABS ====================
console.log('✅ Passo 2: Removendo aba IA...');
content = content.replace(
  "{ id: 'chat', label: '🤖 IA', icon: '🤖' },\n",
  ""
);

// ==================== PASSO 3: REMOVER RENDERIZAÇÃO DO CHAT ====================
console.log('✅ Passo 3: Removendo renderização do chat...');
content = content.replace(
  /\{activeTab === 'chat' && \(\r?\n\s*<ChatIA \/>\r?\n\s*\)\r?\n/,
  ""
);

// ==================== PASSO 4: ADICIONAR ESTADOS DOS MODAIS ====================
console.log('✅ Passo 4: Adicionando estados dos modais...');
const modalStates = `
  // Estados dos modais de confirmação
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalInputAberto, setModalInputAberto] = useState(false);
  const [acaoModal, setAcaoModal] = useState(null);
  const [idModal, setIdModal] = useState(null);
`;

const setFiltroTipoMatch = content.match(/const \[financaFiltroTipo, setFinancaFiltroTipo\] = useState\('todos'\);/);
if (setFiltroTipoMatch) {
  const idx = content.indexOf(setFiltroTipoMatch[0]) + setFiltroTipoMatch[0].length;
  content = content.slice(0, idx) + modalStates + content.slice(idx);
} else {
  console.log('⚠️  Não encontrou linha de setFinancaFiltroTipo');
}

// ==================== PASSO 5: SUBSTITUIR FUNÇÕES ====================
console.log('✅ Passo 5: Substituindo funções concluir...');
content = content.replace(
  /const concluirEstudo = async \(id\) => \{\n    const duracao = prompt\('Duração real \(minutos\):'\);\n    if \(duracao\) \{\n      try \{\n        await estudosAPI\.concluir\(id, parseInt\(duracao\)\);\n        carregarDados\(\);\n      \} catch \(error\) \{\n        alert\('Erro ao concluir estudo'\);\n      \}\n    \}\n  \};/,
  `const iniciarConcluirEstudo = (id) => {
    setAcaoModal('concluirEstudo');
    setIdModal(id);
    setModalInputAberto(true);
  };

  const confirmarConcluirEstudo = async (duracao) => {
    if (!duracao) return;
    try {
      await estudosAPI.concluir(idModal, parseInt(duracao));
      carregarDados();
      setModalInputAberto(false);
      setAcaoModal(null);
      setIdModal(null);
    } catch (error) {
      alert('Erro ao concluir estudo');
      setModalInputAberto(false);
    }
  };`
);

content = content.replace(
  /const concluirTreino = async \(id\) => \{\n    if \(window\.confirm\('Marcar treino como concluído\?'\)\) \{\n      try \{\n        await treinosAPI\.concluir\(id\);\n        carregarDados\(\);\n      \} catch \(error\) \{\n        alert\('Erro ao concluir treino'\);\n      \}\n    \}\n  \};/,
  `const iniciarConcluirTreino = (id) => {
    setAcaoModal('concluirTreino');
    setIdModal(id);
    setModalConfirmacaoAberto(true);
  };

  const confirmarConcluirTreino = async () => {
    try {
      await treinosAPI.concluir(idModal);
      carregarDados();
      setModalConfirmacaoAberto(false);
      setAcaoModal(null);
      setIdModal(null);
    } catch (error) {
      alert('Erro ao concluir treino');
      setModalConfirmacaoAberto(false);
    }
  };`
);

// ==================== PASSO 6: ATUALIZAR BOTÕES ====================
console.log('✅ Passo 6: Atualizando botões...');
content = content.replace(
  /onClick=\{\(\) => concluirEstudo\(estudo\.id\)\}/g,
  "onClick={() => iniciarConcluirEstudo(estudo.id)}"
);
content = content.replace(
  /onClick=\{\(\) => concluirTreino\(treino\.id\)\}/g,
  "onClick={() => iniciarConcluirTreino(treino.id)}"
);

// ==================== PASSO 7: ADICIONAR MODAIS NO JSX ====================
console.log('✅ Passo 7: Adicionando elementos de modal no JSX...');
const modaisJSX = `
      {modalInputAberto && (
        <InputModal
          isOpen={modalInputAberto}
          onConfirm={confirmarConcluirEstudo}
          onCancel={() => setModalInputAberto(false)}
          title="CONCLUIR ESTUDO"
          message="Informe a duração real (minutos):"
          placeholder="Ex: 60"
          inputType="number"
        />
      )}

      {modalConfirmacaoAberto && (
        <ConfirmModal
          isOpen={modalConfirmacaoAberto}
          onConfirm={confirmarConcluirTreino}
          onCancel={() => setModalConfirmacaoAberto(false)}
          title="CONCLUIR TREINO"
          message="Tem certeza que deseja marcar este treino como concluído?"
        />
      )}
`;

// Encontrar o fechamento do ErrorBoundary e inserir antes
content = content.replace(
  '</ErrorBoundary>',
  modaisJSX + '\n    </ErrorBoundary>'
);

// ==================== SALVAR ====================
fs.writeFileSync(filePath, content);
console.log('\n✅ App.js atualizado com sucesso!');
console.log('   • Aba IA removida');
console.log('   • Modais importados (ConfirmModal, InputModal)');
console.log('   • Estados de modal adicionados');
console.log('   • Funções concluir substituídas');
console.log('   • Botões atualizados');
console.log('   • Modais inseridos no JSX');
