const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'App.js');
let content = fs.readFileSync(filePath, 'utf8');

// Substituir bloco das funções concluir
const regex = /const concluirEstudo = async \(id\) => \{\n    const duracao = prompt\('Duração real \(minutos\):'\);\n    if \(duracao\) \{\n      try \{\n        await estudosAPI\.concluir\(id, parseInt\(duracao\)\);\n        carregarDados\(\);\n      \} catch \(error\) \{\n        alert\('Erro ao concluir estudo'\);\n      \}\n    \}\n  \};\n\n  const concluirTreino = async \(id\) => \{\n    if \(window\.confirm\('Marcar treino como concluído\?'\)\) \{\n      try \{\n        await treinosAPI\.concluir\(id\);\n        carregarDados\(\);\n      \} catch \(error\) \{\n        alert\('Erro ao concluir treino'\);\n      \}\n    \}\n  \};/;

const newFuncs = `  // ==================== MODAIS ====================
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
  };`;

content = content.replace(regex, newFuncs);

// Atualizar botões
content = content.replace(/onClick=\{\(\) => concluirEstudo\(estudo\.id\)\}/g, "onClick={() => iniciarConcluirEstudo(estudo.id)}");
content = content.replace(/onClick=\{\(\) => concluirTreino\(treino\.id\)\}/g, "onClick={() => iniciarConcluirTreino(treino.id)}");

fs.writeFileSync(filePath, content);
console.log('✅ Funções substituídas e botões atualizados');
