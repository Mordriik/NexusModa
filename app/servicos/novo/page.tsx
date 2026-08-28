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
    precoBase: item.precoBase.toNumber(),
  }))

  return (
    <div className="p-6 md:p-8 flex justify-center items-start">
      {/* Aumentei o max-w-4xl para caberem melhor os cards duplos do formulário */}
      <Card className="w-full max-w-4xl shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">Registrar Novo Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Agora passamos a lista higienizada (com números simples) */}
          <ServicoForm clientes={clientes} catalogo={catalogo} />
        </CardContent>
      </Card>
    </div>
  )
}