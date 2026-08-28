'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function marcarComoPronto(formData: FormData) {
  const id = formData.get("id") as string
  if (!id) return

  await prisma.pedido.update({
    where: { id },
    data: {
      status: 'PRONTO',
      dataConclusao: new Date()
    }
  })

  revalidatePath(`/servicos/${id}`)
  revalidatePath('/')
}

export async function marcarComoEntregue(formData: FormData) {
  const id = formData.get("id") as string
  if (!id) return

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: true,
      itens: {
        include: {
          servicos: {
            include: {
              catalogoServico: {
                include: {
                  categoria: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!pedido) throw new Error("Pedido não encontrado")

  const categoriasSet = new Set<string>()
  pedido.itens.forEach(item => {
    item.servicos.forEach(s => {
      if (s.catalogoServico?.categoria?.nome) {
        categoriasSet.add(s.catalogoServico.categoria.nome)
      }
    })
  })

  const categoriasArray = Array.from(categoriasSet)
  let rotuloCategoria = "Serviço"

  if (categoriasArray.length === 1) {
    rotuloCategoria = categoriasArray[0]
  } else if (categoriasArray.length > 1) {
    rotuloCategoria = "Misto"
  }

  const descricaoFormatada = `${rotuloCategoria}: ${pedido.cliente.nome}`

  await prisma.$transaction([
    prisma.pedido.update({
      where: { id },
      data: {
        status: 'ENTREGUE',
        dataRetirada: new Date()
      }
    }),

    prisma.transacao.create({
      data: {
        tipo: 'ENTRADA',
        valor: pedido.valorTotal,
        categoria: 'Recebimento de Serviço',
        observacao: descricaoFormatada,
        pedidoId: id
      }
    })
  ])

  revalidatePath('/financeiro')
  revalidatePath('/')
  redirect('/')
}