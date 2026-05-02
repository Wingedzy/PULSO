-- CreateTable
CREATE TABLE "RegistroEmocional" (
    "id" TEXT NOT NULL,
    "emocao" TEXT NOT NULL,
    "texto" TEXT,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "RegistroEmocional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDesejo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "link" TEXT,
    "prioridade" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "ItemDesejo_pkey" PRIMARY KEY ("id")
);
