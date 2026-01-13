'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function registrarTransacao(formData: FormData) {
  const tipo = formData.get("tipo") as "ENTRADA" | "SAIDA"
  const descricao = formData.get("descricao") as string
  const valor = parseFloat(formData.get("valor") as string)
  const categoria = formData.get("categoria") as string
  const data = formData.get("data") as string // YYYY-MM-DD

  if (!descricao || !valor || !data) return

  await prisma.transacao.create({
    data: {
      tipo,
      observacao: descricao, // Usamos o campo 'observacao' do banco como descrição
      valor,
      categoria,
      data: new Date(data + "T12:00:00"),
    }
  })

  revalidatePath("/financeiro")
}

export async function excluirTransacao(id: string) {
  await prisma.transacao.delete({ where: { id } })
  revalidatePath("/financeiro")
}