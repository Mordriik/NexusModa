import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { signOut } from "@/auth"

// Função auxiliar para formatar dinheiro
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default async function Home() {
  // 1. Busca serviços pendentes (O que ela tem para costurar hoje/amanhã)
  const filaTrabalho = await prisma.servico.findMany({
    where: { status: "PENDENTE" },
    orderBy: { dataEntregaPrevista: "asc" },
    include: { 
      cliente: true, 
      catalogoServico: true 
    },
  });

  // 2. Busca serviços prontos aguardando retirada (O "dinheiro parado")
  const aguardandoRetirada = await prisma.servico.findMany({
    where: { status: "PRONTO" },
    orderBy: { dataEntregaPrevista: "asc" },
    include: { 
      cliente: true, 
      catalogoServico: true 
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">
      {/* Cabeçalho com Botões de Ação */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Ateliê Carmen Moda</h1>
          <p className="text-slate-500">Visão Geral do Dia</p>
          <form action={async () => {
            'use server'
            await signOut()
          }}>
            <button className="text-xs text-red-500 hover:underline flex items-center gap-1 mt-1">
              Sair do Sistema
            </button>
          </form>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/servicos/novo" className="w-full md:w-auto">
            <Button size="lg" className="w-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-black">
              + Novo Serviço
            </Button>
          </Link>
          <Link href="/clientes" className="w-full md:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              Clientes
            </Button>
          </Link>
          <Link href="/catalogo" className="w-full md:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              Catálogo
            </Button>
          </Link>
          <Link href="/financeiro" className="w-full md:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              💰 Financeiro
            </Button>
          </Link>
        </div>
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
                <TableHead>Serviço</TableHead>
                <TableHead>Descrição</TableHead>
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
                filaTrabalho.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {format(item.dataEntregaPrevista, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{item.cliente.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.catalogoServico.nome}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-[200px] truncate">
                      {item.descricaoPeca}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">
                      {formatCurrency(Number(item.valorCobrado))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/servicos/${item.id}`}>
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
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">A Receber</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aguardandoRetirada.map((item) => (
                  <TableRow key={item.id} className="opacity-90 hover:opacity-100">
                    <TableCell>
                      {format(item.dataEntregaPrevista, "dd/MM (EEE)", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{item.cliente.nome}</TableCell>
                    <TableCell>{item.catalogoServico.nome}</TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(Number(item.valorCobrado))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/servicos/${item.id}`}>
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