import { prisma } from "@/lib/prisma"
import { registrarTransacao, excluirTransacao } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

// Função auxiliar de formatação
const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default async function FinanceiroPage() {
  // 1. Cálculos de Totais (Entradas vs Saídas)
  const transacoes = await prisma.transacao.findMany({
    orderBy: { data: 'desc' },
    take: 50 // Pega as últimas 50 para não pesar a tela
  })

  const totalEntradas = await prisma.transacao.aggregate({
    where: { tipo: 'ENTRADA' },
    _sum: { valor: true }
  })

  const totalSaidas = await prisma.transacao.aggregate({
    where: { tipo: 'SAIDA' },
    _sum: { valor: true }
  })

  const saldo = (totalEntradas._sum.valor?.toNumber() || 0) - (totalSaidas._sum.valor?.toNumber() || 0)

  // 2. Ranking: Qual serviço traz mais dinheiro?
  // Agrupamos por catalogoServicoId e somamos o valor cobrado
  const rankingLucro = await prisma.servico.groupBy({
    by: ['catalogoServicoId'],
    _sum: { valorCobrado: true },
    orderBy: { _sum: { valorCobrado: 'desc' } },
    take: 5,
  })

  // Precisamos buscar os nomes dos serviços (o groupBy só retorna o ID)
  const rankingComNomes = await Promise.all(rankingLucro.map(async (item) => {
    const servico = await prisma.catalogoServico.findUnique({ where: { id: item.catalogoServicoId } })
    return {
      nome: servico?.nome || 'Desconhecido',
      total: item._sum.valorCobrado?.toNumber() || 0
    }
  }))

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Controle Financeiro</h1>
        <div className="flex gap-2">
            <Link href="/"><Button variant="outline">Voltar</Button></Link>
            
            {/* Modal para Adicionar Despesa Manual */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-black">− Nova Despesa</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Despesa / Saída</DialogTitle></DialogHeader>
                <form action={registrarTransacao} className="space-y-4">
                  <input type="hidden" name="tipo" value="SAIDA" />
                  <Input name="descricao" placeholder="Descrição (ex: Pagamento MEI)" required />
                  <Input name="valor" type="number" step="0.01" placeholder="Valor (R$)" required />
                  <Select name="categoria" required>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Insumos">Insumos (Linha, Tecido)</SelectItem>
                      <SelectItem value="Impostos">Impostos / MEI</SelectItem>
                      <SelectItem value="Contas">Água / Luz / Internet</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input name="data" type="date" required />
                  <Button type="submit" className="w-full bg-red-600">Registrar Saída</Button>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Receitas Totais</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas._sum.valor?.toNumber() || 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Despesas Totais</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas._sum.valor?.toNumber() || 0)}</div></CardContent>
        </Card>
        <Card className={saldo >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Saldo em Caixa</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-800">{formatCurrency(saldo)}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Extrato de Movimentações (Ocupa 2 colunas) */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Últimas Movimentações</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{format(t.data, "dd/MM")}</TableCell>
                    <TableCell>
                        <div className="font-medium">{t.observacao}</div>
                        {/* Se tiver serviço vinculado, mostra link */}
                        {t.servicoId && <span className="text-xs text-blue-500">Ref. Serviço</span>}
                    </TableCell>
                    <TableCell><span className="text-xs bg-slate-100 px-2 py-1 rounded">{t.categoria}</span></TableCell>
                    <TableCell className={`text-right font-bold ${t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.tipo === 'ENTRADA' ? '+' : '-'} {formatCurrency(Number(t.valor))}
                    </TableCell>
                    <TableCell>
                        <form action={excluirTransacao.bind(null, t.id)}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-red-600">×</Button>
                        </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Rankings (Ocupa 1 coluna) */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-base">🏆 Serviços + Lucrativos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {rankingComNomes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-300 text-lg">#{index + 1}</span>
                                <span className="text-sm font-medium">{item.nome}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{formatCurrency(item.total)}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Aqui você pode adicionar o outro Ranking (Quantidade) futuramente */}
        </div>
      </div>
    </div>
  )
}