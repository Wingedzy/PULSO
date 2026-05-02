-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "prioridade" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Estudo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assunto" TEXT NOT NULL,
    "topico" TEXT NOT NULL,
    "duracao_planejada" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "duracao_real" INTEGER NOT NULL,
    "concluido" INTEGER NOT NULL,
    "observacoes" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "exercicios" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "duracao" INTEGER NOT NULL,
    "intensidade" TEXT NOT NULL,
    "concluido" INTEGER NOT NULL,
    "observacoes" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "created_at" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversa_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    CONSTRAINT "Mensagem_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "Conversa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Financa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "valorTotal" REAL,
    "data" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "descricaoBase" TEXT,
    "categoria" TEXT NOT NULL,
    "banco" TEXT,
    "tipoPagamento" TEXT,
    "parcelado" BOOLEAN,
    "parcelaAtual" INTEGER,
    "parcelasTotal" INTEGER,
    "grupoParcela" TEXT,
    "assinatura" BOOLEAN,
    "frequenciaAssinatura" TEXT,
    "grupoAssinaturaId" TEXT,
    "geradaAutomaticamente" BOOLEAN,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);
