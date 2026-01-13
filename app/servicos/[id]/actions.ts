'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function marcarComoPronto(id: string) {
  await prisma.servico.update({
    where: { id },
    data: {
      status: 'PRONTO',
      dataConclusao: new Date() // Salva a data exata que a roupa ficou pronta
    }
  })

  // Atualiza a visualização da tela de detalhes e da Home
  revalidatePath(`/servicos/${id}`)
  revalidatePath('/')
  // Não redirecionamos aqui para ela poder conferir que mudou o status
}

export async function marcarComoEntregue(id: string) {
  // 1. Buscamos o serviço primeiro para saber o valor
  const servico = await prisma.servico.findUnique({
    where: { id },
    select: { valorCobrado: true, descricaoPeca: true }
  })

  if (!servico) throw new Error("Serviço não encontrado")

  // 2. Transação Atômica: Atualiza o serviço E lança no financeiro ao mesmo tempo
  // Usamos o $transaction para garantir que ou faz os dois, ou não faz nenhum (segurança de dados)
  await prisma.$transaction([
    // A. Atualiza o status do serviço
    prisma.servico.update({
      where: { id },
      data: {
        status: 'ENTREGUE',
        dataRetirada: new Date()
      }
    }),

    // B. Cria a entrada no Caixa
    prisma.transacao.create({
      data: {
        tipo: 'ENTRADA',
        valor: servico.valorCobrado,
        categoria: 'Recebimento de Serviço',
        observacao: `Recebimento: ${servico.descricaoPeca}`,
        servicoId: id // Vincula o dinheiro ao serviço
      }
    })
  ])

  revalidatePath('/')
  redirect('/') // Volta para a home pois o serviço foi finalizado
}