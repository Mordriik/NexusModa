'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { criarItemCatalogo, criarCategoriaRapida } from "./actions"

interface CatalogoFormProps {
  categorias: { id: string; nome: string }[]
}

export function CatalogoForm({ categorias }: CatalogoFormProps) {
  const [listaCategorias, setListaCategorias] = useState(categorias)
  const [categoriaId, setCategoriaId] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState("")
  const [isSalvando, setIsSalvando] = useState(false)

  const handleCriarCategoria = async () => {
    if (!novaCategoria.trim()) return
    setIsSalvando(true)
    try {
      const criada = await criarCategoriaRapida(novaCategoria)
      setListaCategorias(prev => [...prev, criada].sort((a, b) => a.nome.localeCompare(b.nome)))
      setCategoriaId(criada.id)
      setNovaCategoria("")
      setIsModalOpen(false)
    } catch (error) {
      console.error("Erro ao criar categoria", error)
    } finally {
      setIsSalvando(false)
    }
  }

  return (
    <form action={criarItemCatalogo} className="flex flex-col md:flex-row gap-4 items-end">
      
      {/* Campo: Nome do Serviço */}
      <div className="flex-1 space-y-2 w-full">
        <label className="text-sm font-medium text-slate-700">Nome do Serviço</label>
        <Input 
          name="nome" 
          placeholder="Ex: Fazer Barra" 
          className="bg-white border-slate-200 focus-visible:ring-pink-200" 
          required 
        />
      </div>
      
      {/* Campo: Preço Base */}
      <div className="w-full md:w-32 space-y-2">
        <label className="text-sm font-medium text-slate-700">Preço (R$)</label>
        <Input 
          name="precoBase" 
          type="number" 
          step="1" 
          min="0" 
          placeholder="0,00" 
          className="bg-white border-slate-200 focus-visible:ring-pink-200" 
          required 
        />
      </div>

      {/* Campo: Categoria + Modal */}
      <div className="w-full md:w-56 space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">Categoria</label>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button 
                type="button" 
                className="text-xs text-pink-700 hover:text-pink-900 font-bold flex items-center gap-0.5 transition-colors"
              >
                + Nova
              </button>
            </DialogTrigger>
            
            {/* Modal com Fundo Branco */}
            <DialogContent className="sm:max-w-md bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-slate-900">Nova Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nome da Categoria</label>
                  <Input 
                    value={novaCategoria} 
                    onChange={e => setNovaCategoria(e.target.value)} 
                    placeholder="Ex: Reforma, Confecção, Bordado" 
                    className="bg-white border-slate-200 focus-visible:ring-pink-200"
                  />
                </div>
                
                {/* Botão de Destaque no Modal (Fundo Rosa Suave + Texto Vinho/Escuro) */}
                <Button 
                  type="button" 
                  onClick={handleCriarCategoria} 
                  disabled={isSalvando} 
                  className="w-full bg-atelier-primary text-pink-950 hover:bg-pink-200 border border-pink-200/80 font-bold shadow-xs transition-colors"
                >
                  {isSalvando ? "Salvando..." : "Salvar Categoria"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <input type="hidden" name="categoriaId" value={categoriaId} />
        
        <Select value={categoriaId} onValueChange={setCategoriaId} required>
          <SelectTrigger className="w-full bg-white border-slate-200 focus:ring-pink-200">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            {listaCategorias.map(cat => (
              <SelectItem key={cat.id} value={cat.id} className="focus:bg-pink-50 focus:text-pink-950">
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão Salvar Serviço (Fundo Rosa Suave + Texto Vinho/Escuro) */}
      <Button 
        type="submit" 
        className="bg-atelier-primary hover:bg-pink-200 text-pink-950 border border-pink-200/80 w-full md:w-auto font-bold shadow-xs transition-colors"
      >
        Salvar Serviço
      </Button>
    </form>
  )
}