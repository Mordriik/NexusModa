'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarModeloMensagem(formData: FormData) {
  const titulo = formData.get("titulo") as string
  const conteudo = formData.get("conteudo") as string

  if (!titulo?.trim() || !conteudo?.trim()) return

  await prisma.modeloMensagem.create({
    data: {
      titulo: titulo.trim(),
      conteudo: conteudo.trim()
    }
  })

  revalidatePath("/mensagens")
  revalidatePath("/servicos/[id]", "page")
}

export async function atualizarModeloMensagem(id: string, formData: FormData) {
  const titulo = formData.get("titulo") as string
  const conteudo = formData.get("conteudo") as string

  if (!titulo?.trim() || !conteudo?.trim()) return

  await prisma.modeloMensagem.update({
    where: { id },
    data: {
      titulo: titulo.trim(),
      conteudo: conteudo.trim()
    }
  })

  revalidatePath("/mensagens")
  revalidatePath("/servicos/[id]", "page")
}

export async function excluirModeloMensagem(id: string) {
  await prisma.modeloMensagem.delete({
    where: { id }
  })

  revalidatePath("/mensagens")
  revalidatePath("/servicos/[id]", "page")
}