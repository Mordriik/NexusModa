-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDENTE', 'PRONTO', 'ENTREGUE', 'ATRASADO_RETIRADA');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_servicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "precoBase" DECIMAL(10,2) NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "catalogo_servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "catalogoServicoId" TEXT NOT NULL,
    "descricaoPeca" TEXT NOT NULL,
    "valorCobrado" DECIMAL(10,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDENTE',
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEntregaPrevista" TIMESTAMP(3) NOT NULL,
    "dataConclusao" TIMESTAMP(3),
    "dataRetirada" TIMESTAMP(3),

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "categoria" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "servicoId" TEXT,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_catalogoServicoId_fkey" FOREIGN KEY ("catalogoServicoId") REFERENCES "catalogo_servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
