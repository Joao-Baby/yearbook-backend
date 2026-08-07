import prisma from '../prisma/client.js'; // importa o singleton do Prisma

// select que omite senhaHash — reutilizado em todas as queries de alunos
const selectSemSenha = {
  id: true,
  nome: true,
  email: true,
  cidade: true,
  frase: true,
  planosFuturos: true,
  fotoUrl: true,
  role: true,
  criadoEm: true,
  // senhaHash NÃO está aqui — nunca retornado pela API
};

// GET /alunos — lista todos os alunos
export async function listarAlunos(req, res, next) {  // adicione next aos parâmetros
  try {
    const alunos = await prisma.aluno.findMany({
      select: selectSemSenha,
    });
    res.json(alunos);
  } catch (erro) {
    next(erro);  // passa o erro para o middleware global
  }
}

export async function buscarAluno(req, res, next) {
  try {
    const { id } = req.params;
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(id) }
    });

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (erro) {
    next(erro);
  }
}

export async function criarAluno(req, res, next) {
  try {
    const { nome, email, fotoUrl, role, senhaHash, cidade } = req.body;
    
    const aluno = await prisma.aluno.create({
      data: { nome, email, fotoUrl, role, senhaHash, cidade }
    });

    // Separamos o senhaHash do resto das propriedades do aluno
    const { senhaHash: _, ...alunoSemSenha } = aluno;
    
    // Retornamos apenas o objeto SEM a senha
    res.status(201).json(alunoSemSenha);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarAluno(req, res, next) {
  try {
    const { id } = req.params;
    
    // Dica: Se quiser permitir atualizar cidade, frase, etc., adicione-os aqui
    const { nome, email, fotoUrl, role, senhaHash, cidade } = req.body;
    
    const alunoAtualizado = await prisma.aluno.update({
      where: { id: Number(id) },
      data: { nome, email, fotoUrl, role, senhaHash, cidade }
    });
    
    // 1. Separamos o senhaHash do resto das propriedades
    const { senhaHash: _, ...alunoSemSenha } = alunoAtualizado;
    
    // 2. Retornamos o objeto limpo
    return res.json(alunoSemSenha);
    
  } catch (erro) {
    if (erro.code === 'P2025') {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    next(erro);
  }
}

export async function deletarAluno(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.aluno.delete({ 
      where: { id: Number(id) } 
    });

    return res.status(204).end();
  } catch (erro) {
    if (erro.code === 'P2025') {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }
    next(erro);
  }
}