import { prisma } from "@/lib/prisma"
import { criarCliente, excluirCliente } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { servicos: true } } } // Conta quantos serviços o cliente já fez
  })

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-start">
      <div className="w-full max-w-4xl space-y-8">
        
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Meus Clientes</h1>
            <Link href="/">
                <Button variant="outline">Voltar para Home</Button>
            </Link>
        </div>

        {/* Formulário de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle>Novo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={criarCliente} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">Nome Completo</label>
                <Input name="nome" placeholder="Ex: Maria da Silva" required />
              </div>
              
              <div className="w-full md:w-64 space-y-2">
                <label className="text-sm font-medium">WhatsApp (DDD + Número)</label>
                <Input name="whatsapp" placeholder="42999998888" type="tel" />
              </div>

              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Cadastrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead className="text-center">Serviços Feitos</TableHead>
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
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>
                        {cliente.whatsapp ? (
                            <Link 
                                href={`https://wa.me/55${cliente.whatsapp}`} 
                                target="_blank"
                                className="text-green-600 hover:underline"
                            >
                                {cliente.whatsapp}
                            </Link>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">
                            {cliente._count.servicos}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <form action={excluirCliente.bind(null, cliente.id)}>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                type="submit"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={cliente._count.servicos > 0} // Impede excluir se já tiver histórico
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
    </div>
  )
}