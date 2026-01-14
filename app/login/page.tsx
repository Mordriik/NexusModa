'use client'

import { useActionState } from "react" 
import { useFormStatus } from "react-dom"
import { authenticate } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Componente auxiliar para o botão ficar desabilitado enquanto carrega
function LoginButton() {
  const { pending } = useFormStatus()
 
  return (
    <Button className="w-full bg-slate-900 hover:bg-slate-800" type="submit" disabled={pending}>
      {pending ? "Entrando..." : "Entrar no Sistema"}
    </Button>
  )
}

export default function LoginPage() {
  // O hook conecta o formulário com a Server Action
  // errorMessage vai conter a string de erro se o login falhar
  const [errorMessage, dispatch] = useActionState(authenticate, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">NexusModa Gestão</CardTitle>
          <CardDescription>
            Entre com suas credenciais de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input 
                id="username" 
                name="username" 
                placeholder="admin" 
                required 
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
            </div>
            
            {/* Exibe mensagem de erro se houver */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-center justify-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <LoginButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-slate-400">Sistema Seguro v1.0</p>
        </CardFooter>
      </Card>
    </div>
  )
}