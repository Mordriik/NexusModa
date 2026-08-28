'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const NAV_ITEMS = [
  { href: "/", label: "Visão Geral", icon: "🏠" },
  { href: "/servicos/novo", label: "Novo Pedido", icon: "✨" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
  { href: "/catalogo", label: "Catálogo", icon: "🏷️" },
  { href: "/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/desempenho", label: "Desempenho", icon: "📊" },
  { href: "/mensagens", label: "Mensagens", icon: "💬" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white text-slate-800 min-h-screen hidden md:flex flex-col fixed left-0 top-0 shadow-sm border-r border-slate-200 z-50">
      
      {/* Logotipo */}
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ateliê Carmen Moda</h2>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Painel de Gestão</p>
      </div>

      {/* Navegação com destaque dinâmico */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start transition-colors font-medium ${
                  isActive
                    ? "bg-atelier-primary text-pink-950 font-bold border border-pink-200/80 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="mr-3">{item.icon}</span> {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => signOut()}
          className="text-sm text-slate-500 hover:text-red-600 flex items-center w-full p-2 rounded-md hover:bg-red-50 transition-colors"
        >
          <span className="mr-3">🚪</span> Sair do Sistema
        </button>
      </div>

    </aside>
  )
}