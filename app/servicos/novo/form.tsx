'use client' // <--- Isso indica que roda no navegador

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { criarServico } from "../actions" // Importamos a Server Action aqui


// Definimos os tipos dos dados que virão do banco
interface ServicoFormProps {
  clientes: { id: string; nome: string }[]
  catalogo: { id: string; nome: string; precoBase: number }[]
}

export function ServicoForm({ clientes, catalogo }: ServicoFormProps) {
  return (
    <form action={criarServico} className="space-y-6">
      {/* Seleção de Cliente */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Cliente</label>
        {clientes.length > 0 ? (
          <Select name="clienteId" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente..." />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded text-sm">
            ⚠️ Nenhum cliente cadastrado.
          </div>
        )}
      </div>

      {/* Seleção do Tipo de Serviço */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo de Serviço</label>
        <Select name="catalogoServicoId" required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o serviço..." />
          </SelectTrigger>
          <SelectContent>
            {catalogo.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nome} - R$ {Number(item.precoBase).toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Descrição da Peça */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Descrição da Peça</label>
        <Textarea 
          name="descricaoPeca" 
          placeholder="Ex: Calça Jeans Azul com rasgo no joelho" 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Valor Cobrado */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Valor Total (R$)</label>
          <Input name="valorCobrado" type="number" step="0.01" placeholder="0.00" required />
        </div>

        {/* Data de Entrega */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data de Entrega</label>
          <Input name="dataEntrega" type="date" required />
        </div>
      </div>

      <div className="pt-4 grid grid-cols-2 gap-4">
        <Button type="submit" className="w-full">
          Salvar Serviço
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          className="w-full" 
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}