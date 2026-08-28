import { prisma } from "@/lib/prisma"
import { registrarTransacao, excluirTransacao } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import Link from "next/link"

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default async function FinanceiroPage() {
  const transacoes = await prisma.transacao.findMany({
    orderBy: { data: 'desc' },
    take: 50 
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

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Controle Financeiro</h1>
          <p className="text-slate-500">Acompanhe as entradas, saídas e o saldo em caixa.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm">− Nova Despesa</Button>
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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Receitas Totais</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas._sum.valor?.toNumber() || 0)}</div></CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Despesas Totais</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas._sum.valor?.toNumber() || 0)}</div></CardContent>
        </Card>
        <Card className={`shadow-sm ${saldo >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-600">Saldo em Caixa</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-slate-800">{formatCurrency(saldo)}</div></CardContent>
        </Card>
      </div>

      {/* Extrato de Movimentações */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader><CardTitle className="text-xl text-slate-800">Últimas Movimentações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    Nenhuma movimentação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                transacoes.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-slate-600">{format(t.data, "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">{t.observacao}</div>
                      {t.pedidoId && (
                        <Link 
                          href={`/servicos/${t.pedidoId}`} 
                          className="text-xs text-atelier-accent hover:text-atelier-primary font-medium hover:underline inline-block mt-0.5"
                        >
                          Ver Pedido ↗
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded font-medium">
                        {t.categoria}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.tipo === 'ENTRADA' ? '+' : '-'} {formatCurrency(Number(t.valor))}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={excluirTransacao.bind(null, t.id)}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                          ×
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  )
}