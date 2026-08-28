import { prisma } from "@/lib/prisma"
import { MensagensManager } from "./form"

export default async function MensagensPage() {
  const modelos = await prisma.modeloMensagem.findMany({
    orderBy: { criadoEm: 'asc' }
  })

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Modelos de Mensagens</h1>
        <p className="text-slate-500">Cadastre e personalize os textos automáticos enviados no WhatsApp dos clientes.</p>
      </div>

      <MensagensManager modelos={modelos} />
    </div>
  )
}