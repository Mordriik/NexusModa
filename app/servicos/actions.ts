'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function criarServico(formData: FormData) {
  const clienteId = formData.get("clienteId") as string
  const catalogoServicoId = formData.get("catalogoServicoId") as string
  const dataEntrega = formData.get("dataEntrega") as string // Vem como YYYY-MM-DD
  const valorCobrado = formData.get("valorCobrado") as string
  const descricaoPeca = formData.get("descricaoPeca") as string

  // Validação básica
  if (!clienteId || !catalogoServicoId || !dataEntrega) {
    throw new Error("Campos obrigatórios faltando")
  }

  await prisma.servico.create({
    data: {
      clienteId,
      catalogoServicoId,
      descricaoPeca,
      valorCobrado: parseFloat(valorCobrado),
      dataEntregaPrevista: new Date(dataEntrega + "T12:00:00"), // Fixando meio-dia para evitar problemas de fuso
      status: "PENDENTE"
    }
  })

  revalidatePath("/") // Atualiza a Home (Fila de Trabalho)
  redirect("/") // Volta para a tela inicial após salvar
}