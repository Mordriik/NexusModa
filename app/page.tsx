import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função auxiliar para formatar dinheiro
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default async function Home() {
  // 1. Busca pedidos pendentes (O que ela tem para costurar hoje/amanhã)
  const filaTrabalho = await prisma.pedido.findMany({
    where: { status: "PENDENTE" },
    orderBy: { dataEntregaPrevista: "asc" },
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
    },
  });

  // 2. Busca pedidos prontos aguardando retirada (O "dinheiro parado")
  const aguardandoRetirada = await prisma.pedido.findMany({
    where: { status: "PRONTO" },
    orderBy: { dataEntregaPrevista: "asc" },
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
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      {/* Cabeçalho Limpo */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Visão Geral do Dia</h1>
        <p className="text-slate-500">Resumo de pedidos e entregas do ateliê.</p>
      </div>

      {/* Seção 1: Fila de Trabalho (Prioridade) */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>🧵 Fila de Produção</span>
            <Badge variant="secondary">{filaTrabalho.length} pendentes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Entrega</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviços Listados</TableHead>
                <TableHead>Peças</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filaTrabalho.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Nenhum serviço pendente. Tudo em dia! 🎉
                  </TableCell>
                </TableRow>
              ) : (
                filaTrabalho.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">
                      {format(pedido.dataEntregaPrevista, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{pedido.cliente.nome}</TableCell>
                    
                    {/* Lista os serviços únicos de todas as roupas do pedido */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(pedido.itens.flatMap(i => i.servicos.map(s => s.catalogoServico.nome)))).map((nomeSvc, idx) => (
                          <Badge key={idx} variant="outline">{nomeSvc as string}</Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Lista as roupas do pedido */}
                    <TableCell className="text-slate-600 max-w-50 truncate">
                      {pedido.itens.map(i => i.descricaoPeca).join(", ")}
                    </TableCell>

                    <TableCell className="text-right font-bold text-slate-700">
                      {formatCurrency(Number(pedido.valorTotal))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/servicos/${pedido.id}`}>
                        <Button variant="ghost" size="sm">Detalhes</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Seção 2: Aguardando Retirada (Só aparece se tiver itens) */}
      {aguardandoRetirada.length > 0 && (
        <Card className="border-l-4 border-l-green-500 shadow-sm bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-slate-700 flex justify-between items-center">
              <span>📦 Aguardando Retirada (Prontos)</span>
              <Badge className="bg-green-600">{aguardandoRetirada.length} prontos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prazo Original</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Peças</TableHead>
                  <TableHead className="text-right">A Receber</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aguardandoRetirada.map((pedido) => (
                  <TableRow key={pedido.id} className="opacity-90 hover:opacity-100">
                    <TableCell>
                      {format(pedido.dataEntregaPrevista, "dd/MM (EEE)", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{pedido.cliente.nome}</TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {pedido.itens.length} peça(s)
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(Number(pedido.valorTotal))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/servicos/${pedido.id}`}>
                        <Button size="sm" variant="secondary">Entregar</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}