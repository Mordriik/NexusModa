import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServicoForm } from "./form"

export default async function NovoServicoPage() {
  // 1. Buscamos os dados brutos do banco
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })
  const catalogoBruto = await prisma.catalogoServico.findMany({ orderBy: { nome: 'asc' } })

  // 2. CONVERSÃO: Transformamos o Decimal em number para o Frontend entender
  const catalogo = catalogoBruto.map((item) => ({
    ...item,
    precoBase: item.precoBase.toNumber(), // <--- O segredo está aqui
  }))

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-start">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Registrar Novo Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Agora passamos a lista higienizada (com números simples) */}
          <ServicoForm clientes={clientes} catalogo={catalogo} />
        </CardContent>
      </Card>
    </div>
  )
}