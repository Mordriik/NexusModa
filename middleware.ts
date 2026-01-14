import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isLoginPage = req.nextUrl.pathname.startsWith('/login')

  // Se o usuário não está logado e não está na página de login, manda pro login
  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  // Se já está logado e tenta acessar o login, manda pra home
  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL('/', req.nextUrl))
  }
})

// Configuração para o middleware não rodar em arquivos estáticos (imagens, css, etc)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}