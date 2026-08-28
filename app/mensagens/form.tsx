'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { criarModeloMensagem, atualizarModeloMensagem, excluirModeloMensagem } from "./actions"

interface ModeloProps {
  id: string
  titulo: string
  conteudo: string
}

const TAGS_DISPONIVEIS = [
  { tag: "{cliente}", label: "Nome do Cliente" },
  { tag: "{pecas}", label: "Resumo das Peças" },
  { tag: "{valor}", label: "Valor Total" },
  { tag: "{prazo}", label: "Data Prevista" }
]

export function MensagensManager({ modelos }: { modelos: ModeloProps[] }) {
  const [novoTitulo, setNovoTitulo] = useState("")
  const [novoConteudo, setNovoConteudo] = useState("")

  const inserirTagNovo = (tag: string) => {
    setNovoConteudo(prev => prev + tag)
  }

  return (
    <div className="space-y-8">
      
      {/* CARD DE DICAS / TAGS DISPONÍVEIS COM CONTRASTE TOTAL */}
      <div className="bg-pink-50/70 border border-pink-200 p-4 rounded-xl space-y-2 shadow-xs">
        <p className="text-sm font-bold text-pink-950 flex items-center gap-1.5">
          <span>💡</span> Etiquetas Automáticas
        </p>
        <p className="text-xs text-slate-600">
          Clique nas etiquetas abaixo para inseri-las no texto. Quando você enviar a mensagem para o cliente, o sistema substituirá esses campos pelos dados reais do pedido:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {TAGS_DISPONIVEIS.map(item => (
            <Badge 
              key={item.tag} 
              variant="outline"
              onClick={() => inserirTagNovo(item.tag)}
              className="cursor-pointer bg-white text-slate-800 border-pink-200 hover:bg-pink-100 hover:border-pink-300 text-xs py-1 transition-colors shadow-xs"
            >
              <strong className="mr-1 text-pink-700">{item.tag}</strong> ({item.label})
            </Badge>
          ))}
        </div>
      </div>

      {/* FORMULÁRIO DE CADASTRO (BRANCO PURO) */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800">Criar Novo Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => {
            await criarModeloMensagem(formData)
            setNovoTitulo("")
            setNovoConteudo("")
          }} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Título do Modelo</label>
              <Input 
                name="titulo" 
                placeholder="Ex: Aviso de Pedido Pronto, Confirmação de Entrada" 
                value={novoTitulo}
                onChange={e => setNovoTitulo(e.target.value)}
                className="bg-white border-slate-200 focus-visible:ring-pink-200"
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Texto da Mensagem</label>
              <Textarea 
                name="conteudo" 
                placeholder="Ex: Olá {cliente}! Sua peça ({pecas}) já está pronta. O valor é {valor}. Pode vir buscar!" 
                value={novoConteudo}
                onChange={e => setNovoConteudo(e.target.value)}
                className="min-h-27.5 resize-y text-sm bg-white border-slate-200 focus-visible:ring-pink-200"
                required 
              />
            </div>

            {/* Botão com Fundo Rosa Suave + Texto Vinho Escuro Contrastante */}
            <Button 
              type="submit" 
              className="bg-atelier-primary hover:bg-pink-200 text-pink-950 border border-pink-200/80 font-bold w-full md:w-auto shadow-xs transition-colors"
            >
              Salvar Modelo
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* LISTA DE MODELOS EXISTENTES */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Modelos Cadastrados ({modelos.length})</h2>

        {modelos.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum modelo de mensagem cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelos.map(m => (
              <Card key={m.id} className="bg-white shadow-sm border-slate-200 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-800 font-bold">{m.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50/80 rounded-md border border-slate-100 text-sm text-slate-700 whitespace-pre-line font-sans">
                    {m.conteudo}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <EditarModeloDialog modelo={m} />
                    
                    <form action={excluirModeloMensagem.bind(null, m.id)}>
                      <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        Excluir
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function EditarModeloDialog({ modelo }: { modelo: ModeloProps }) {
  const [open, setOpen] = useState(false)
  const [titulo, setTitulo] = useState(modelo.titulo)
  const [conteudo, setConteudo] = useState(modelo.conteudo)

  const inserirTag = (tag: string) => {
    setConteudo(prev => prev + tag)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Editar Modelo de Mensagem</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-1.5 pt-2">
          {TAGS_DISPONIVEIS.map(item => (
            <Badge 
              key={item.tag} 
              variant="outline"
              onClick={() => inserirTag(item.tag)}
              className="cursor-pointer bg-slate-50 text-slate-800 border-pink-200 hover:bg-pink-100 text-xs py-0.5"
            >
              <strong className="mr-1 text-pink-700">{item.tag}</strong>
            </Badge>
          ))}
        </div>

        <form action={async (formData) => {
          await atualizarModeloMensagem(modelo.id, formData)
          setOpen(false)
        }} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Título</label>
            <Input 
              name="titulo" 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              className="bg-white border-slate-200 focus-visible:ring-pink-200"
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Mensagem</label>
            <Textarea 
              name="conteudo" 
              value={conteudo} 
              onChange={e => setConteudo(e.target.value)} 
              className="min-h-27.5 resize-y text-sm bg-white border-slate-200 focus-visible:ring-pink-200"
              required 
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-atelier-primary hover:bg-pink-200 text-pink-950 border border-pink-200/80 font-bold shadow-xs transition-colors"
          >
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}