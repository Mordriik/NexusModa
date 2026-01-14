'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    // Tenta logar usando o provider 'credentials' que configuramos no auth.ts
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Usuário ou senha incorretos."
        default:
          return "Algo deu errado. Tente novamente."
      }
    }
    // O NextAuth lança um erro para fazer o redirecionamento.
    // Precisamos deixar esse erro passar (re-throw) para o redirect funcionar.
    throw error
  }
}