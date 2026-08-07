import prisma from '../prisma/client.js';

export async function listarMensagens(req, res, next) {
  try {
    const mensagens = await prisma.mensagem.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        autor: {
          select: {
            nome: true,
            fotoUrl: true,
          },
        },
      },
    });
    res.json(mensagens);
  } catch (erro) {
    next(erro);
  }
}

export async function criarMensagem(req, res, next) {
  try {
    const { texto, imagemUrl, autorId } = req.body;

    if (!texto || texto.trim() === '') {
      return res.status(400).json({ erro: 'O texto da mensagem é obrigatório.' });
    }

    const novaMensagem = await prisma.mensagem.create({
      data: {
        texto,
        imagemUrl,
        autorId: Number(autorId),
      },
    });

    res.status(201).json(novaMensagem);
  } catch (erro) {
    next(erro);
  }
}

export async function deletarMensagem(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.mensagem.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (erro) {
    if (erro.code === 'P2025') {
      return res.status(404).json({ erro: 'Mensagem não encontrada' });
    }
    next(erro);
  }
}