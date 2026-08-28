import { prisma } from "@/lib/prisma"
import { excluirItemCatalogo } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CatalogoForm } from "./form"

export default async function CatalogoPage() {
  const [itens, categorias] = await Promise.all([
    prisma.catalogoServico.findMany({
      orderBy: { nome: 'asc' },
      include: { categoria: true }
    }),
    prisma.categoria.findMany({
      orderBy: { nome: 'asc' }
    })
  ])

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Catálogo de Preços</h1>
        <p className="text-slate-500">Gerencie os serviços, valores base e categorias do ateliê.</p>
      </div>
      
      {/* Card 1: Formulário de Adicionar Serviço (Branco Puro) */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Adicionar Novo Serviço Base</CardTitle>
        </CardHeader>
        <CardContent>
          <CatalogoForm categorias={categorias} />
        </CardContent>
      </Card>

      {/* Card 2: Tabela de Itens (Branco Puro) */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-semibold text-slate-700">Serviço</TableHead>
                <TableHead className="font-semibold text-slate-700">Categoria</TableHead>
                <TableHead className="font-semibold text-slate-700">Preço Base</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                itens.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="font-medium text-slate-700">{item.nome}</TableCell>
                    <TableCell>
                      {/* Badge com Rosa Suave + Texto Vinho Contrastante */}
                      <span className="bg-atelier-primary text-pink-950 px-2.5 py-1 rounded-md text-xs font-bold border border-pink-200/80 inline-block shadow-xs">
                        {item.categoria.nome}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">
                      R$ {Number(item.precoBase).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={excluirItemCatalogo.bind(null, item.id)}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          type="submit"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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