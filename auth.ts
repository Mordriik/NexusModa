import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // O nome que aparece no formulário padrão (vamos customizar depois)
      name: "Credenciais",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      // A lógica de verificação
      authorize: async (credentials) => {
        // Verifica se o que foi digitado bate com o que está no .env
        if (
          credentials.username === process.env.ADMIN_USER &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          // Retorna o objeto do usuário se deu certo
          return { id: "1", name: "Admin Nexus", email: "admin@nexus.com" }
        }

        // Retorna null se a senha estiver errada
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login", // Vamos criar essa página personalizada em breve
  },
})