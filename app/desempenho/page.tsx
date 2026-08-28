import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default async function DesempenhoPage() {
  // 1. Agrupa todos os serviços feitos no histórico
  const servicosAgrupados = await prisma.servicoItem.groupBy({
    by: ['catalogoServicoId'],
    _sum: { precoCobrado: true }, // Soma o dinheiro gerado
    _count: { id: true },         // Conta quantas vezes foi feito
  })

  // 2. Busca o catálogo para traduzir o ID em Nome do Serviço
  const catalogo = await prisma.catalogoServico.findMany()

  // 3. Monta o array de dados combinando os agrupamentos com os nomes
  const dadosFormatados = servicosAgrupados.map(item => {
    const servicoBase = catalogo.find(c => c.id === item.catalogoServicoId)
    return {
      nome: servicoBase?.nome || 'Serviço Excluído',
      lucro: item._sum.precoCobrado?.toNumber() || 0,
      quantidade: item._count.id
    }
  })

  // 4. Ordena para criar os Ranks (Top 5)
  const rankingLucro = [...dadosFormatados].sort((a, b) => b.lucro - a.lucro).slice(0, 5)
  const rankingVolume = [...dadosFormatados].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5)

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Desempenho do Ateliê</h1>
        <p className="text-slate-500">Análise de produtividade e rentabilidade dos serviços.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RANKING DE RECEITA */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-green-50/50 border-b border-green-100 rounded-t-xl pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              🏆 Top 5: Maior Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {rankingLucro.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Nenhum dado suficiente ainda.</p>
            ) : (
              <div className="space-y-4">
                {rankingLucro.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-500 text-sm">
                        {index + 1}º
                      </span>
                      <span className="font-medium text-slate-700">{item.nome}</span>
                    </div>
                    <span className="font-bold text-green-700">{formatCurrency(item.lucro)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RANKING DE VOLUME */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 rounded-t-xl pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              🔥 Top 5: Mais Pedidos (Volume)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {rankingVolume.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Nenhum dado suficiente ainda.</p>
            ) : (
              <div className="space-y-4">
                {rankingVolume.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-500 text-sm">
                        {index + 1}º
                      </span>
                      <span className="font-medium text-slate-700">{item.nome}</span>
                    </div>
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
                      {item.quantidade}x vezes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}