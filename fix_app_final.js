const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'App.js');
const backupPath = path.join(__dirname, 'client', 'src', 'App.js.bak');

// Fazer backup antes de começar
fs.copyFileSync(filePath, backupPath);
console.log('✅ Backup criado:', backupPath);

let content = fs.readFileSync(filePath, 'utf8');

// ==================== 1. IMPORTS ====================
console.log('1️⃣  Adicionando imports de modais...');
content = content.replace(
  "import ErrorBoundary from './components/ErrorBoundary';",
  "import ErrorBoundary from './components/ErrorBoundary';\nimport ConfirmModal from './components/ConfirmModal';\nimport InputModal from './components/InputModal';"
);

// ==================== 2. REMOVER CHAT DO TABS ====================
console.log('2️⃣  Removendo aba IA do menu...');
// A aba IA está no array tabs
const tabsArrayRegex = /const tabs = \[[\s\S]*?\];/;
let tabsMatch = content.match(tabsArrayRegex);
if (tabsMatch) {
  let tabs = tabsMatch[0];
  // Remover a linha com o chat
  tabs = tabs.replace(/\{ id: 'chat', label: '🤖 IA', icon: '🤖' \},\n/, '');
  content = content.replace(tabsArrayRegex, tabs);
}

// ==================== 3. REMOVER RENDERIZAÇÃO DO CHAT ====================
console.log('3️⃣  Removendo renderização do chat (JSX)...');
content = content.replace(
  /\{activeTab === 'chat' && \(\r?\n\s*<ChatIA \/>\r?\n\s*\)\r?\n/,
  ""
);

// ==================== 4. ADICIONAR ESTADOS DOS MODAIS ====================
console.log('4️⃣  Adicionando estados dos modais...');
const setFiltroTipoLine = "const [financaFiltroTipo, setFinancaFiltroTipo] = useState('todos');";
const pos = content.indexOf(setFiltroTipoLine);
if (pos !== -1) {
  const insertPos = pos + setFiltroTipoLine.length;
  const modalStates = `

  // Estados dos modais de confirmação
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalInputAberto, setModalInputAberto] = useState(false);
  const [acaoModal, setAcaoModal] = useState(null);
  const [idModal, setIdModal] = useState(null);`;
  content = content.slice(0, insertPos) + modalStates + content.slice(insertPos);
} else {
  console.log('❌ Não encontrou linha de setFinancaFiltroTipo!');
}

// ==================== 5. SUBSTITUIR FUNÇÕES CONCLUIR ====================
console.log('5️⃣  Substituindo funções concluirEstudo/concluirTreino...');

// Remover funções antigas
content = content.replace(
  /const concluirEstudo = async \(id\) => \{\n    const duracao = prompt\('Duração real \(minutos\):'\);\n    if \(duracao\) \{\n      try \{\n        await estudosAPI\.concluir\(id, parseInt\(duracao\)\);\n        carregarDados\(\);\n      \} catch \(error\) \{\n        alert\('Erro ao concluir estudo'\);\n      \}\n    \}\n  \};[\s\n]*const concluirTreino = async \(id\) => \{\n    if \(window\.confirm\('Marcar treino como concluído\?'\)\) \{\n      try \{\n        await treinosAPI\.concluir\(id\);\n        carregarDados\(\);\n      \} catch \(error\) \{\n        alert\('Erro ao concluir treino'\);\n      \}\n    \}\n  \};/,
  `  // ==================== FUNÇÕES DE MODAL ====================
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
  };`
);

// ==================== 6. ATUALIZAR BOTÕES ====================
console.log('6️⃣  Atualizando onClick dos botões...');
content = content.replace(
  /onClick=\{\(\) => concluirEstudo\(estudo\.id\)\}/g,
  "onClick={() => iniciarConcluirEstudo(estudo.id)}"
);
content = content.replace(
  /onClick=\{\(\) => concluirTreino\(treino\.id\)\}/g,
  "onClick={() => iniciarConcluirTreino(treino.id)}"
);

// ==================== 7. ADICIONAR MODAIS NO JSX ====================
console.log('7️⃣  Inserindo modais no JSX (antes de </ErrorBoundary>)...');
const modaisJSX = `
      {/* ==================== MODAIS ==================== */}
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

// ==================== SALVAR ====================
fs.writeFileSync(filePath, content);
console.log('\n✅ App.js atualizado com sucesso!');
console.log('   • Chat/IA removido completamente');
console.log('   • ConfirmModal importado');
console.log('   • InputModal importado');
console.log('   • Estados de modal adicionados');
console.log('   • Funções concluir substituídas');
console.log('   • Botões atualizados');
console.log('   • Modais inseridos no JSX');
console.log('\n📝 Verificações:');

// Verificações
const hasChat = content.includes('ChatIA');
const hasModalImports = content.includes("import ConfirmModal") && content.includes("import InputModal");
const hasModalStates = content.includes('modalConfirmacaoAberto') && content.includes('modalInputAberto');
const hasIniciarConcluir = content.includes('iniciarConcluirEstudo') && content.includes('iniciarConcluirTreino');
const hasModalJSX = content.includes('<InputModal') && content.includes('<ConfirmModal');
const hasOldConfirm = content.includes("window.confirm('Marcar treino");
const hasOldPrompt = content.includes("prompt('Duração real");

console.log(`   ${hasChat ? '❌' : '✅'} ChatIA removido: ${hasChat ? 'AINDA PRESENTE!' : 'OK'}`);
console.log(`   ${hasModalImports ? '✅' : '❌'} Imports de modais: ${hasModalImports ? 'OK' : 'FALTANDO!'}`);
console.log(`   ${hasModalStates ? '✅' : '❌'} Estados dos modais: ${hasModalStates ? 'OK' : 'FALTANDO!'}`);
console.log(`   ${hasIniciarConcluir ? '✅' : '❌'} Funções de modal: ${hasIniciarConcluir ? 'OK' : 'FALTANDO!'}`);
console.log(`   ${hasModalJSX ? '✅' : '❌'} Modais no JSX: ${hasModalJSX ? 'OK' : 'FALTANDO!'}`);
console.log(`   ${!hasOldConfirm ? '✅' : '❌'} window.confirm removido: ${!hasOldConfirm ? 'OK' : 'AINDA PRESENTE!'}`);
console.log(`   ${!hasOldPrompt ? '✅' : '❌'} prompt removido: ${!hasOldPrompt ? 'OK' : 'AINDA PRESENTE!'}`);
