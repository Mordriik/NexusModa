'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function criarItemCatalogo(formData: FormData) {
  const nome = formData.get('nome') as string;
  const precoBase = parseFloat(formData.get('precoBase') as string);
  const categoriaId = formData.get('categoriaId') as string;

  if (!nome || !precoBase || !categoriaId) return;
  
  await prisma.catalogoServico.create({
    data: { 
      nome, 
      precoBase, 
      categoriaId 
    },
  });

  revalidatePath('/catalogo');
}

export async function criarCategoriaRapida(nome: string) {
  if (!nome.trim()) throw new Error("Nome da categoria é obrigatório");

  const categoria = await prisma.categoria.create({
    data: { nome: nome.trim() }
  });

  revalidatePath('/catalogo');
  return categoria;
}

export async function excluirItemCatalogo(id: string) {
  await prisma.catalogoServico.delete({ where: { id } });
  revalidatePath('/catalogo');
}