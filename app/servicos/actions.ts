'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Tipagem do que esperamos receber do formulário
interface DadosPedido {
  clienteId: string;
  dataEntrega: string;
  valorTotal: number;
  itens: {
    descricaoPeca: string;
    observacoes: string;
    servicosIds: string[]; // Lista de IDs dos serviços escolhidos
  }[];
}

export async function criarPedido(dados: DadosPedido) {
  if (!dados.clienteId || dados.itens.length === 0) {
    throw new Error("Dados incompletos");
  }

  // Busca os preços base atuais no catálogo para salvar o "precoCobrado" histórico
  const catalogo = await prisma.catalogoServico.findMany();

  // Criação Aninhada (Nested Create) do Prisma
  await prisma.pedido.create({
    data: {
      clienteId: dados.clienteId,
      dataEntregaPrevista: new Date(dados.dataEntrega + "T12:00:00"),
      valorTotal: dados.valorTotal,
      status: "PENDENTE",
      
      // Cria os Itens (Peças de roupa)
      itens: {
        create: dados.itens.map((item) => ({
          descricaoPeca: item.descricaoPeca,
          observacoes: item.observacoes,
          
          // Cria os Serviços para esta peça específica
          servicos: {
            create: item.servicosIds.map((servicoId) => {
              const servicoCatalogo = catalogo.find(c => c.id === servicoId);
              return {
                catalogoServicoId: servicoId,
                precoCobrado: servicoCatalogo ? servicoCatalogo.precoBase : 0
              };
            })
          }
        }))
      }
    }
  });

  revalidatePath("/");
  redirect("/");
}

export async function criarClienteRapido(nome: string, whatsapp: string) {
  const cliente = await prisma.cliente.create({
    data: {
      nome,
      whatsapp: whatsapp.replace(/\D/g, '') // Limpa a formatação, salvando só os números
    }
  })
  return cliente
}