const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'App.js');

console.log('Lendo App.js...');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar imports dos modais após os outros imports
console.log('1. Adicionando imports de modais...');
if (!content.includes("import ConfirmModal from './components/ConfirmModal'")) {
  content = content.replace(
    "import ErrorBoundary from './components/ErrorBoundary';",
    "import ErrorBoundary from './components/ErrorBoundary';\nimport ConfirmModal from './components/ConfirmModal';\nimport InputModal from './components/InputModal';"
  );
}

// 2. Remover aba IA do tabs array
console.log('2. Removendo aba IA...');
content = content.replace(
  "{ id: 'chat', label: '🤖 IA', icon: '🤖' },\n",
  ""
);

// 3. Remover renderização do chat
console.log('3. Removendo renderização do chat...');
content = content.replace(
  /\{activeTab === 'chat' && \(\r?\n\s*<ChatIA \/>\r?\n\s*\)\r?\n/,
  ""
);

// 4. Adicionar estados dos modais após os estados de filtro
console.log('4. Adicionando estados dos modais...');
const modalStates = `
  // Estados dos modais de confirmação
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalInputAberto, setModalInputAberto] = useState(false);
  const [acaoModal, setAcaoModal] = useState(null);
  const [idModal, setIdModal] = useState(null);
`;

// Encontrar posição após setFinancaFiltroTipo
const setFiltroTipoMatch = content.match(/const \[financaFiltroTipo, setFinancaFiltroTipo\] = useState\('todos'\);/);
if (setFiltroTipoMatch) {
  const idx = content.indexOf(setFiltroTipoMatch[0]) + setFiltroTipoMatch[0].length;
  content = content.slice(0, idx) + modalStates + content.slice(idx);
}

// 5. Substituir funções concluirEstudo e concluirTreino
console.log('5. Substituindo funções de conclusão...');
const novasFuncoes = `
  // ==================== MODAIS ====================
  const iniciarConcluirEstudo = (id) => {
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
  };

  const iniciarConcluirTreino = (id) => {
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
  };
`;

// Remover funções antigas
content = content.replace(
  /const concluirEstudo = async \(id\) => \{[\s\S]*?\n  \};[\s\n]*const concluirTreino = async \(id\) => \{[\s\S]*?\n  \};/,
  novasFuncoes
);

// 6. Atualizar chamadas dos botões
console.log('6. Atualizando chamadas dos botões...');
content = content.replace(
  /onClick=\{\(\) => concluirEstudo\(estudo\.id\)\}/g,
  "onClick={() => iniciarConcluirEstudo(estudo.id)}"
);
content = content.replace(
  /onClick=\{\(\) => concluirTreino\(treino\.id\)\}/g,
  "onClick={() => iniciarConcluirTreino(treino.id)}"
);

// 7. Adicionar modais no JSX antes de </ErrorBoundary>
console.log('7. Adicionando elementos de modal no JSX...');
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

content = content.replace('</ErrorBoundary>', modaisJSX + '\n    </ErrorBoundary>');

fs.writeFileSync(filePath, content);
console.log('✅ App.js atualizado com sucesso!');
console.log('   - Aba IA removida');
console.log('   - Modais importados');
console.log('   - Estados de modal adicionados');
console.log('   - Funções concluir substituídas');
console.log('   - Modais inseridos no JSX');
