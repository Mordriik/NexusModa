import { prisma } from "@/lib/prisma"
import { criarCliente, excluirCliente } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function ClientesPage() {
  // ATUALIZAÇÃO: Mudamos de 'servicos' para 'pedidos' na contagem
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { pedidos: true } } } 
  })

  return (
    // Limpeza de layout: apenas o padding necessário, pois o background e menu estão na Sidebar
    <div className="p-6 md:p-8 space-y-8">
      
      {/* Cabeçalho Limpo */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Meus Clientes</h1>
        <p className="text-slate-500">Gerencie contatos e histórico de pedidos.</p>
      </div>

      {/* Formulário de Cadastro */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarCliente} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-slate-700">Nome Completo</label>
              <Input name="nome" placeholder="Ex: Maria da Silva" required />
            </div>
            
            <div className="w-full md:w-64 space-y-2">
              <label className="text-sm font-medium text-slate-700">WhatsApp (DDD + Número)</label>
              <Input name="whatsapp" placeholder="42999998888" type="tel" />
            </div>

            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto">
              Cadastrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="text-center">Pedidos Realizados</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-700">{cliente.nome}</TableCell>
                    <TableCell>
                      {cliente.whatsapp ? (
                          <Link 
                              href={`https://wa.me/55${cliente.whatsapp}`} 
                              target="_blank"
                              className="text-green-600 hover:text-green-700 hover:underline font-medium"
                          >
                              {cliente.whatsapp}
                          </Link>
                      ) : <span className="text-slate-400">-</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                          {/* ATUALIZAÇÃO: Mostra a contagem de pedidos */}
                          {cliente._count.pedidos}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={excluirCliente.bind(null, cliente.id)}>
                          <Button 
                              variant="ghost" 
                              size="sm" 
                              type="submit"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              // ATUALIZAÇÃO: Impede excluir se já tiver pedidos
                              disabled={cliente._count.pedidos > 0} 
                          >
                              Excluir
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