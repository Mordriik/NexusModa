import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/ui/Sidebar";
import { auth } from "@/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ateliê NexusModa",
  description: "Gestão de ateliê de costura",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {session ? (
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 md:ml-64">
              {children}
            </main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}