const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = require('./Mentrix/server/data/database.json');

async function main() {

  for (const t of data.tarefas) {
    await prisma.tarefa.create({
      data: { ...t, tags: JSON.stringify(t.tags) }
    });
  }

  for (const e of data.estudos) {
    await prisma.estudo.create({ data: e });
  }

  for (const t of data.treinos) {
    await prisma.treino.create({
      data: { ...t, exercicios: JSON.stringify(t.exercicios) }
    });
  }

  for (const c of data.conversas) {
    await prisma.conversa.create({ data: c });
  }

  const conversasIds = new Set(data.conversas.map(c => c.id));
  for (const m of data.mensagens) {
    if (conversasIds.has(m.conversa_id)) {
      await prisma.mensagem.create({ data: m });
    }
  }

  for (const f of data.financas) {
    await prisma.financa.create({
      data: {
        id: f.id,
        tipo: f.tipo,
        valor: f.valor,
        valorTotal: f.valorTotal ?? null,
        data: f.data,
        descricao: f.descricao,
        descricaoBase: f.descricaoBase ?? null,
        categoria: f.categoria,
        banco: f.banco ?? null,
        tipoPagamento: f.tipoPagamento ?? null,
        parcelado: f.parcelado ?? null,
        parcelaAtual: f.parcelaAtual ?? null,
        parcelasTotal: f.parcelasTotal ?? null,
        grupoParcela: f.grupoParcela ?? null,
        assinatura: f.assinatura ?? null,
        frequenciaAssinatura: f.frequenciaAssinatura ?? null,
        grupoAssinaturaId: f.grupoAssinaturaId ?? null,
        geradaAutomaticamente: f.geradaAutomaticamente ?? null,
        created_at: f.created_at,
        updated_at: f.updated_at,
      }
    });
  }

}

main()
  .then(() => console.log("Import concluído"))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());