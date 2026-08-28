import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"

import { marcarComoPronto, marcarComoEntregue } from "./actions"
import { ModalNotificarWhatsApp } from "./modal-notificar"

export default async function DetalhesServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  const [pedido, modelosBrutos] = await Promise.all([
    prisma.pedido.findUnique({
      where: { id },
      include: { 
        cliente: true,
        itens: {
          include: {
            servicos: {
              include: {
                catalogoServico: true
              }
            }
          }
        }
      }
    }),
    prisma.modeloMensagem.findMany({
      orderBy: { criadoEm: 'asc' }
    })
  ])

  if (!pedido) return notFound()

  const modelosSanitizados = modelosBrutos.map(m => ({
    id: m.id,
    titulo: m.titulo,
    conteudo: m.conteudo
  }))

  const pecasNomes = pedido.itens.map(i => i.descricaoPeca)
  const prazoFormatado = pedido.dataEntregaPrevista 
    ? format(new Date(pedido.dataEntregaPrevista), "dd 'de' MMMM", { locale: ptBR }) 
    : "-"

  return (
    <div className="p-6 md:p-8 flex justify-center items-start">
      <Card className="w-full max-w-3xl shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 rounded-t-xl border-b border-slate-200">
          <div className="flex justify-between items-center">
             <CardTitle className="text-xl text-slate-800">Detalhes do Pedido</CardTitle>
             <Badge className={
               pedido.status === 'PENDENTE' ? 'bg-amber-100 text-amber-800 border-amber-200' :
               pedido.status === 'PRONTO' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 
               'bg-emerald-100 text-emerald-800 border-emerald-200'
             }>
               {pedido.status}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Cliente</p>
              <p className="text-lg font-bold text-slate-800">{pedido.cliente?.nome || "Sem Nome"}</p>
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">WhatsApp</p>
               {pedido.cliente?.whatsapp ? (
                 <Link 
                   href={`https://wa.me/55${pedido.cliente.whatsapp.replace(/\D/g, '')}`} 
                   target="_blank"
                   className="text-green-600 hover:underline font-medium flex items-center gap-1"
                 >
                   {pedido.cliente.whatsapp} ↗
                 </Link>
               ) : (
                 <p className="text-slate-400">-</p>
               )}
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Prazo de Entrega</p>
              <p className="font-medium text-slate-700">{prazoFormatado}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm text-slate-500 font-medium mb-3">
              Itens do Pedido ({pedido.itens.length})
            </h3>
            <div className="space-y-4">
              {pedido.itens.map((item, index) => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <p className="font-bold text-slate-800">{index + 1}. {item.descricaoPeca}</p>
                  
                  {item.observacoes && (
                    <p className="text-sm text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                      📝 &quot;{item.observacoes}&quot;
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {item.servicos.map(servico => (
                      <Badge key={servico.id} variant="secondary" className="font-normal text-xs bg-atelier-light text-atelier-primary border border-purple-200/60">
                        {servico.catalogoServico?.nome || "Serviço"} (R$ {Number(servico.precoCobrado).toFixed(2)})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-atelier-primary text-white p-4 rounded-lg flex justify-between items-center shadow-md">
            <span className="font-medium text-purple-200">Valor Total do Pedido</span>
            <span className="text-2xl font-bold">
              R$ {Number(pedido.valorTotal).toFixed(2)}
            </span>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-3 bg-slate-50 rounded-b-xl border-t p-6">
          
          {pedido.status === 'PENDENTE' && (
            <form action={marcarComoPronto} className="w-full">
              <input type="hidden" name="id" value={id} />
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm" size="lg">
                ✅ Marcar como PRONTO
              </Button>
            </form>
          )}

          {pedido.status === 'PRONTO' && (
            <form action={marcarComoEntregue} className="w-full">
              <input type="hidden" name="id" value={id} />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm" size="lg">
                💰 Receber e Entregar
              </Button>
            </form>
          )}

          <ModalNotificarWhatsApp 
            clienteNome={pedido.cliente?.nome || ""}
            clienteWhatsapp={pedido.cliente?.whatsapp || null}
            pecas={pecasNomes}
            valorTotal={Number(pedido.valorTotal)}
            prazoFormatado={prazoFormatado}
            modelos={modelosSanitizados}
          />

          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">Voltar para a Home</Button>
          </Link>
          
        </CardFooter>
      </Card>
    </div>
  )
}