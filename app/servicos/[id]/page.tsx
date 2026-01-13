import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"

// Import das actions (certifique-se de que o arquivo actions.ts existe, 
// mesmo que vazio por enquanto, para não dar erro de import)
import { marcarComoPronto, marcarComoEntregue } from "./actions"

// 1. Mudança na Tipagem: params agora é uma Promise
export default async function DetalhesServicoPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. Mudança na Lógica: Precisamos esperar (await) os parâmetros chegarem
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const servico = await prisma.servico.findUnique({
    where: { id },
    include: { cliente: true, catalogoServico: true }
  })

  if (!servico) return notFound()

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-start">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-slate-100 rounded-t-xl border-b">
          <div className="flex justify-between items-center">
             <CardTitle className="text-xl">Detalhes do Serviço</CardTitle>
             {/* Lógica visual de cores para o badge */}
             <Badge className={
               servico.status === 'PENDENTE' ? 'bg-blue-600' :
               servico.status === 'PRONTO' ? 'bg-green-600' : 'bg-slate-500'
             }>
               {servico.status}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* Dados do Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Cliente</p>
              <p className="text-lg font-bold">{servico.cliente.nome}</p>
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Whatsapp</p>
               {servico.cliente.whatsapp ? (
                 <Link 
                   href={`https://wa.me/55${servico.cliente.whatsapp.replace(/\D/g, '')}`} 
                   target="_blank"
                   className="text-green-600 hover:underline font-medium flex items-center gap-1"
                 >
                   {servico.cliente.whatsapp} ↗
                 </Link>
               ) : (
                 <p className="text-slate-400">-</p>
               )}
            </div>
          </div>

          <Separator />

          {/* Dados do Serviço */}
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Peça / Descrição</p>
            <p className="text-slate-800 bg-slate-50 p-3 rounded-md border">
              {servico.descricaoPeca}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Tipo</p>
              <p>{servico.catalogoServico.nome}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Prazo</p>
              <p>{format(servico.dataEntregaPrevista, "dd 'de' MMMM", { locale: ptBR })}</p>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-4 rounded-lg flex justify-between items-center">
            <span>Valor Total</span>
            <span className="text-xl font-bold">
              R$ {Number(servico.valorCobrado).toFixed(2)}
            </span>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-3 bg-slate-50 rounded-b-xl border-t p-6">
          
          {/* Botões de Ação Condicionais */}
          {servico.status === 'PENDENTE' && (
            <form action={marcarComoPronto.bind(null, id)} className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-black" size="lg">
                ✅ Marcar como PRONTO
              </Button>
            </form>
          )}

          {servico.status === 'PRONTO' && (
            <form action={marcarComoEntregue.bind(null, id)} className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-black" size="lg">
                💰 Receber e Entregar
              </Button>
            </form>
          )}

          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Voltar</Button>
          </Link>
          
        </CardFooter>
      </Card>
    </div>
  )
}