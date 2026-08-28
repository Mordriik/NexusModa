'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { criarPedido, criarClienteRapido } from "../actions"

interface ServicoFormProps {
  clientes: { id: string; nome: string }[]
  catalogo: { id: string; nome: string; precoBase: number }[]
}

interface ItemRoupa {
  idLocal: number;
  descricaoPeca: string;
  observacoes: string;
  servicosSelecionados: string[];
}

export function ServicoForm({ clientes, catalogo }: ServicoFormProps) {
  const dataLocal = new Date()
  dataLocal.setMinutes(dataLocal.getMinutes() - dataLocal.getTimezoneOffset())
  const hoje = dataLocal.toISOString().split('T')[0]

  const [listaClientes, setListaClientes] = useState(clientes)
  const [clienteId, setClienteId] = useState("")
  const [dataEntrega, setDataEntrega] = useState(hoje)
  const [itens, setItens] = useState<ItemRoupa[]>([
    { idLocal: 1, descricaoPeca: "", observacoes: "", servicosSelecionados: [] }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [novoNome, setNovoNome] = useState("")
  const [novoWhatsapp, setNovoWhatsapp] = useState("")
  const [isSalvandoCliente, setIsSalvandoCliente] = useState(false)

  const adicionarPeca = () => {
    setItens([...itens, { idLocal: Date.now(), descricaoPeca: "", observacoes: "", servicosSelecionados: [] }])
  }

  const removerPeca = (idLocal: number) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.idLocal !== idLocal))
    }
  }

  const atualizarPeca = (idLocal: number, campo: keyof ItemRoupa, valor: string) => {
    setItens(itens.map(item => item.idLocal === idLocal ? { ...item, [campo]: valor } : item))
  }

  const adicionarServicoNaPeca = (idLocal: number, servicoId: string) => {
    setItens(itens.map(item => {
      if (item.idLocal === idLocal && !item.servicosSelecionados.includes(servicoId)) {
        return { ...item, servicosSelecionados: [...item.servicosSelecionados, servicoId] }
      }
      return item
    }))
  }

  const removerServicoDaPeca = (idLocal: number, servicoId: string) => {
    setItens(itens.map(item => {
      if (item.idLocal === idLocal) {
        return { ...item, servicosSelecionados: item.servicosSelecionados.filter(id => id !== servicoId) }
      }
      return item
    }))
  }

  const valorTotalCalculado = itens.reduce((total, item) => {
    const totalDoItem = item.servicosSelecionados.reduce((somaServicos, servicoId) => {
      const servico = catalogo.find(c => c.id === servicoId)
      return somaServicos + (servico ? servico.precoBase : 0)
    }, 0)
    return total + totalDoItem
  }, 0)

  const [precoFinal, setPrecoFinal] = useState(valorTotalCalculado.toFixed(2))

  useEffect(() => {
    setPrecoFinal(valorTotalCalculado.toFixed(2))
  }, [valorTotalCalculado])

  const handleCriarCliente = async () => {
    if (!novoNome) return
    setIsSalvandoCliente(true)
    try {
      const clienteCadastrado = await criarClienteRapido(novoNome, novoWhatsapp)
      setListaClientes([...listaClientes, clienteCadastrado])
      setClienteId(clienteCadastrado.id)
      setIsModalOpen(false)
      setNovoNome("")
      setNovoWhatsapp("")
    } catch (error) {
      console.error("Erro ao salvar cliente", error)
    } finally {
      setIsSalvandoCliente(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dadosEnvio = {
      clienteId,
      dataEntrega,
      valorTotal: Number(precoFinal),
      itens: itens.map(i => ({
        descricaoPeca: i.descricaoPeca,
        observacoes: i.observacoes,
        servicosIds: i.servicosSelecionados
      }))
    }
    await criarPedido(dadosEnvio)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* CABEÇALHO DO PEDIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Cliente</label>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <button type="button" className="text-xs text-pink-700 hover:text-pink-900 font-bold transition-colors">
                  + Novo Cliente
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader><DialogTitle>Cadastro Rápido</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm">Nome Completo</label>
                    <Input value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Maria da Silva" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">WhatsApp (DDD + Número)</label>
                    <Input value={novoWhatsapp} onChange={e => setNovoWhatsapp(e.target.value)} type="tel" placeholder="42999998888" />
                  </div>
                  <Button type="button" onClick={handleCriarCliente} disabled={isSalvandoCliente} className="w-full bg-atelier-primary hover:bg-pink-200 text-pink-950 font-bold border border-pink-200">
                    {isSalvandoCliente ? "Salvando..." : "Salvar e Selecionar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Select value={clienteId} onValueChange={setClienteId} required>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione o cliente..." /></SelectTrigger>
            <SelectContent className="bg-white">
              {listaClientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Data de Entrega</label>
          <Input type="date" value={dataEntrega} onChange={e => setDataEntrega(e.target.value)} required className="bg-white" />
        </div>
      </div>

      {/* CARDS DE PEÇAS */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
          Peças de Roupa <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border border-slate-200">{itens.length} peça(s)</Badge>
        </h3>

        {itens.map((item, index) => (
          <Card key={item.idLocal} className="bg-white border border-slate-200 border-l-4 border-l-pink-300 shadow-xs relative">
            {itens.length > 1 && (
              <Button 
                type="button" variant="ghost" size="sm" 
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 h-6 px-2 text-xs"
                onClick={() => removerPeca(item.idLocal)}
              >
                ✕ Remover
              </Button>
            )}
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-sm text-slate-400 font-bold uppercase tracking-wider">Peça #{index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Qual é a peça?</label>
                  <Input 
                    placeholder="Ex: Calça Militar" required className="h-9 text-sm bg-white"
                    value={item.descricaoPeca}
                    onChange={e => atualizarPeca(item.idLocal, 'descricaoPeca', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">Adicionar Serviço nesta peça</label>
                  <Select onValueChange={(val) => adicionarServicoNaPeca(item.idLocal, val)}>
                    <SelectTrigger className="h-9 text-sm bg-white"><SelectValue placeholder="+ Escolher serviço..." /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {catalogo.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome} (R$ {c.precoBase.toFixed(2)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {item.servicosSelecionados.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-pink-50/50 rounded-md border border-pink-100">
                  {item.servicosSelecionados.map(servicoId => {
                    const servico = catalogo.find(c => c.id === servicoId)
                    return (
                      <Badge key={servicoId} variant="default" className="bg-atelier-primary text-pink-950 hover:bg-pink-200 border border-pink-200 cursor-pointer text-xs font-medium" onClick={() => removerServicoDaPeca(item.idLocal, servicoId)}>
                        {servico?.nome} <span className="ml-1 font-bold text-pink-700">×</span>
                      </Badge>
                    )
                  })}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">Observações do Serviço</label>
                <Textarea 
                  placeholder="Como o serviço deve ser feito?" 
                  value={item.observacoes}
                  onChange={e => atualizarPeca(item.idLocal, 'observacoes', e.target.value)}
                  className="min-h-10 h-10 text-sm resize-y bg-white"
                />
              </div>

            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full border-dashed border-2 py-4 bg-white/60 text-slate-500 hover:text-pink-900 hover:border-pink-300 hover:bg-pink-50" onClick={adicionarPeca}>
          + Adicionar outra peça de roupa
        </Button>
      </div>

      {/* RODAPÉ FLUTUANTE EM BRANCO PURO COM DESTAQUE ROSA */}
      <div className="sticky bottom-4 bg-white text-slate-800 p-4 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 z-10 border border-slate-200">
        <div className="flex flex-col items-start w-full md:w-auto">
          <p className="text-xs text-slate-500 font-medium mb-1">Valor Total (Editável / Descontos)</p>
          
          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-3 py-1 transition-colors focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100">
            <span className="text-xl font-bold text-slate-700 mr-1">R$</span>
            <Input
              type="number"
              step="1"
              min="0"
              value={precoFinal}
              onChange={(e) => setPrecoFinal(e.target.value)}
              className="text-2xl font-bold bg-transparent border-none text-slate-900 h-10 w-32 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto"
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button type="button" variant="outline" className="w-full md:w-auto border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
            Confirmar Pedido
          </Button>
        </div>
      </div>

    </form>
  )
}