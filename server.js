import express from 'express';
import { PrismaClient } from '@prisma/client'; 
import  { MongoClient } from 'mongodb';
import cors from 'cors';

const PORT = process.env.PORT || 3000;
const app = express();
const client = new MongoClient("mongodb+srv://benj2:pER1waJdCGKdYhED@benj2.jt75d69.mongodb.net/Usuario?retryWrites=true&w=majority&appName=benj2")
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

let changeStream;
const clients = [];

// Função para iniciar o Change Stream e enviar eventos SSE
async function startChangeStream() {
  try {
    await client.connect();
    const db = client.db("Usuario"); // nome do DB
    const collection = db.collection("Usuario"); // coleção MongoDB

    // Watch só inserções
    changeStream = collection.watch([
      { $match: { operationType: { $in: ["insert", "update", "delete"] } } }
    ]);

    changeStream.on("change", (change) => {
      const data = JSON.stringify({ sinal: "mudanca", tipo: change.operationType });

      clients.forEach(res => {
        res.write(`data: ${data}\n\n`);
      });
    });

    console.log("Change stream ativo, escutando inserts no MongoDB...");
  } catch (error) {
    console.error("Erro no Change Stream:", error);
  }
}

// Endpoint SSE para clientes se conectarem
app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Conexão inicial
  res.write(": conectado\n\n");

  // Envia ping a cada 15 segundos para manter conexão aberta
  const keepAlive = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 15000);

  clients.push(res);

  req.on("close", () => {
    clearInterval(keepAlive);  // limpa o ping quando cliente desconectar
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
});

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    startChangeStream();
  });

//endpoints CRUD Prisma
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

app.get('/produto', async(req , res) => {
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
