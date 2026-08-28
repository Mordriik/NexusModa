'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-xl shadow-sm border border-red-200 text-center space-y-4">
      <div className="text-3xl">⚠️</div>
      <h2 className="text-xl font-bold text-slate-800">Não foi possível carregar este pedido</h2>
      <p className="text-sm text-slate-600">
        {error.message || "Ocorreu um problema ao buscar as informações do pedido no servidor."}
      </p>
      <div className="flex gap-3 justify-center pt-2">
        <Button variant="outline" onClick={() => reset()}>
          Tentar Novamente
        </Button>
        <Link href="/">
          <Button className="bg-atelier-primary text-white">Voltar para a Home</Button>
        </Link>
      </div>
    </div>
  )
}