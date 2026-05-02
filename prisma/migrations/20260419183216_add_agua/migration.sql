-- CreateTable
CREATE TABLE "Agua" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "registros" TEXT NOT NULL,
    "meta" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "Agua_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agua_data_key" ON "Agua"("data");
