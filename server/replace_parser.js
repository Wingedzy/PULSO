#!/usr/bin/env node
// Script para substituir a classe FinanceParser no index.js
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.js');
const parserPath = path.join(__dirname, 'finance_parser_final.js');

console.log('Lendo arquivos...');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const parserClass = fs.readFileSync(parserPath, 'utf8');

// Encontrar a classe FinanceParser no index.js
const classStart = indexContent.indexOf('class FinanceParser {');
if (classStart === -1) {
  console.error('Classe FinanceParser não encontrada no index.js');
  process.exit(1);
}

// Encontrar o fim da classe (antes de "const financeParser = new FinanceParser();")
const instanceLine = indexContent.indexOf('const financeParser = new FinanceParser();');
if (instanceLine === -1) {
  console.error('Linha de instância não encontrada');
  process.exit(1);
}

// A classe termina antes da linha de instância
const beforeClass = indexContent.substring(0, classStart);
const afterClass = indexContent.substring(instanceLine);

// Construir novo conteúdo
const newContent = beforeClass + parserClass + '\n\n' + afterClass;

// Escrever de volta
fs.writeFileSync(indexPath, newContent, 'utf8');
console.log('Classe FinanceParser substituída com sucesso!');
