'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function criarItemCatalogo(formData: FormData) {
  const nome = formData.get('nome') as string;
  const precoBase = parseFloat(formData.get('precoBase') as string);
  const categoria = formData.get('categoria') as string;

  if (!nome || !precoBase) return
  
  await prisma.catalogoServico.create({
    data: { nome, precoBase, categoria },
  });

  revalidatePath('/catalogo'); // Atualiza a página automaticamente
}

export async function excluirItemCatalogo(id: string) {
  await prisma.catalogoServico.delete({ where: { id } });
  revalidatePath('/catalogo');
}