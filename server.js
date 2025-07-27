import express from 'express';
import { PrismaClient } from '@prisma/client';  
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();

app.post('/produto', async (req, res) => {
    try {
        const produto = await prisma.usuario.create({
            data: {
                nome: req.body.nome,
                preco: req.body.preco
            }
        });

        res.status(201).json({ mensagem: 'Produto criado com sucesso!', produto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar produto' });
    }
});

app.get('/', async(req , res) => {
    try {
        const produtos = await prisma.usuario.findMany();
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar produtos" });
    }
});

app.put('/produto/:id', async (req, res) => {
  const { nome, preco } = req.body;
    
  try {
    const produto = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { nome, preco }
    });
    res.json({ mensagem: 'Produto atualizado com sucesso!', produto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

app.delete('/produto/:id', async (req, res) => {
    try {
        const produto = await prisma.usuario.delete({
            where: { id: req.params.id }
        });
       res.json({ mensagem: 'Produto deletado com sucesso!', produto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao deletar produto' });
    }
});
