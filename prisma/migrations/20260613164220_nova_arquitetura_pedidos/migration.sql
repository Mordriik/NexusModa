/*
  Warnings:

  - You are about to drop the column `servicoId` on the `transacoes` table. All the data in the column will be lost.
  - You are about to drop the `servicos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "servicos" DROP CONSTRAINT "servicos_catalogoServicoId_fkey";

-- DropForeignKey
ALTER TABLE "servicos" DROP CONSTRAINT "servicos_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "transacoes" DROP CONSTRAINT "transacoes_servicoId_fkey";

-- AlterTable
ALTER TABLE "transacoes" DROP COLUMN "servicoId",
ADD COLUMN     "pedidoId" TEXT;

-- DropTable
DROP TABLE "servicos";

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDENTE',
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEntregaPrevista" TIMESTAMP(3) NOT NULL,
    "dataConclusao" TIMESTAMP(3),
    "dataRetirada" TIMESTAMP(3),

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "descricaoPeca" TEXT NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos_item" (
    "id" TEXT NOT NULL,
    "itemPedidoId" TEXT NOT NULL,
    "catalogoServicoId" TEXT NOT NULL,
    "precoCobrado" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "servicos_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos_item" ADD CONSTRAINT "servicos_item_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "itens_pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos_item" ADD CONSTRAINT "servicos_item_catalogoServicoId_fkey" FOREIGN KEY ("catalogoServicoId") REFERENCES "catalogo_servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
