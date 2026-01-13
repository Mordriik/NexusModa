'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarCliente(formData: FormData) {
  const nome = formData.get("nome") as string
  const whatsappRaw = formData.get("whatsapp") as string

  // Pequena limpeza no WhatsApp (remove espaços, traços, parênteses)
  const whatsapp = whatsappRaw.replace(/\D/g, '')

  if (!nome) return

  await prisma.cliente.create({
    data: { nome, whatsapp }
  })

  revalidatePath("/clientes")
  // Também revalida o formulário de novo serviço para o cliente aparecer lá na hora
  revalidatePath("/servicos/novo") 
}

export async function excluirCliente(id: string) {
  // O ideal seria verificar se o cliente tem serviços antes de excluir
  // Mas para o MVP, vamos deixar o Prisma lançar erro se tiver restrição de chave estrangeira
  try {
    await prisma.cliente.delete({ where: { id } })
    revalidatePath("/clientes")
    revalidatePath("/servicos/novo")
  } catch (error) {
    console.error("Erro ao excluir cliente com serviços vinculados")
  }
}