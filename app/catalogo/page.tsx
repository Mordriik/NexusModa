import { prisma } from "@/lib/prisma"
import { criarItemCatalogo, excluirItemCatalogo } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function CatalogoPage() {
  // Busca os itens no banco de dados ordenados por nome
  const itens = await prisma.catalogoServico.findMany({
    orderBy: { nome: 'asc' },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">Catálogo de Preços</h1>
      
      {/* Formulário de Cadastro */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Serviço Base</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarItemCatalogo} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium">Nome do Serviço</label>
              <Input name="nome" placeholder="Ex: Fazer Barra" required />
            </div>
            
            <div className="w-full md:w-32 space-y-2">
              <label className="text-sm font-medium">Preço (R$)</label>
              <Input name="precoBase" type="number" step="0.01" placeholder="0,00" required />
            </div>

            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-medium">Categoria</label>
               {/* Futuramente podemos transformar isso num Select */}
              <Input name="categoria" placeholder="Ex: Reforma" required />
            </div>

            <Button type="submit">Salvar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Listagem */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço Base</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>R$ {Number(item.precoBase).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <form action={excluirItemCatalogo.bind(null, item.id)}>
                        <Button variant="destructive" size="sm" type="submit">
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