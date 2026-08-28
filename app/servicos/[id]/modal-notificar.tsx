'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ModeloMensagemItem {
  id: string
  titulo: string
  conteudo: string
}

interface ModalNotificarWhatsAppProps {
  clienteNome: string
  clienteWhatsapp: string | null
  pecas: string[]
  valorTotal: number
  prazoFormatado: string
  modelos: ModeloMensagemItem[]
}

// Função pura de substituição de tags dinâmicas fora do componente
function formatarMensagem(
  template: string,
  cliente: string,
  pecas: string[],
  valor: number,
  prazo: string
) {
  return template
    .replaceAll("{cliente}", cliente)
    .replaceAll("{pecas}", pecas.join(", "))
    .replaceAll("{valor}", `R$ ${valor.toFixed(2)}`)
    .replaceAll("{prazo}", prazo)
}

export function ModalNotificarWhatsApp({
  clienteNome,
  clienteWhatsapp,
  pecas,
  valorTotal,
  prazoFormatado,
  modelos
}: ModalNotificarWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState(modelos[0]?.id || "")
  
  // Inicialização direta do estado sem useEffect
  const [textoFinal, setTextoFinal] = useState(() => {
    if (modelos.length > 0) {
      return formatarMensagem(modelos[0].conteudo, clienteNome, pecas, valorTotal, prazoFormatado)
    }
    return ""
  })

  // Disparado ao abrir/fechar o Dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && modelos.length > 0) {
      const modeloAtual = modelos.find(m => m.id === modeloSelecionadoId) || modelos[0]
      setTextoFinal(formatarMensagem(modeloAtual.conteudo, clienteNome, pecas, valorTotal, prazoFormatado))
    }
  }

  // Disparado ao escolher outro modelo no Select
  const handleTrocarModelo = (novoId: string) => {
    setModeloSelecionadoId(novoId)
    const modelo = modelos.find(m => m.id === novoId)
    if (modelo) {
      setTextoFinal(formatarMensagem(modelo.conteudo, clienteNome, pecas, valorTotal, prazoFormatado))
    }
  }

  const handleEnviarWhatsApp = () => {
    if (!clienteWhatsapp) return

    const numeroLimpo = clienteWhatsapp.replace(/\D/g, "")
    const ddi = numeroLimpo.length <= 11 ? `55${numeroLimpo}` : numeroLimpo
    const linkWhatsApp = `https://wa.me/${ddi}?text=${encodeURIComponent(textoFinal)}`

    window.open(linkWhatsApp, "_blank")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 font-semibold gap-2 shadow-sm"
        >
          <span>📲</span> Notificar no WhatsApp
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <span>📲</span> Enviar Mensagem para {clienteNome}
          </DialogTitle>
        </DialogHeader>

        {modelos.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm space-y-2">
            <p className="font-semibold">Nenhum modelo cadastrado.</p>
            <p>Acesse o menu <strong>Mensagens</strong> na barra lateral para criar seus textos prontos.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500">Escolha o Modelo</label>
              <Select value={modeloSelecionadoId} onValueChange={handleTrocarModelo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase text-slate-500">Prévia da Mensagem</label>
                <span className="text-[11px] text-slate-400">Você pode ajustar o texto antes de enviar</span>
              </div>
              <Textarea 
                value={textoFinal} 
                onChange={e => setTextoFinal(e.target.value)}
                className="min-h-35 resize-y text-sm bg-slate-50"
              />
            </div>

            {!clienteWhatsapp && (
              <p className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-200">
                ⚠️ Este cliente não possui WhatsApp cadastrado no sistema.
              </p>
            )}

            <Button 
              type="button" 
              onClick={handleEnviarWhatsApp} 
              disabled={!clienteWhatsapp || !textoFinal.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold gap-2 py-5 shadow-md shadow-green-600/20"
            >
              <span>🚀</span> Abrir conversa no WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}