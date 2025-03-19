const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const port = 3000;

// Configura o Express para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configura o Express para usar JSON
app.use(express.json());

// String de conexão do MongoDB Atlas
const uri = 'mongodb+srv://willwss15:oQF6JYtTH3ce6tIg@mentaly.rmg1j.mongodb.net/?retryWrites=true&w=majority&appName=Mentaly'; // Substitua pela sua URI
const client = new MongoClient(uri);

// Conecta ao MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB Atlas');
    return client.db('mentally'); // Nome do banco de dados
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }
}

// Inicia a conexão com o MongoDB
let db;
connectToMongoDB().then((database) => {
  db = database;
});

// Rotas da API

// Registro de usuário
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = db.collection('users');
    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: 'Nome de usuário já existe.' });
    }

    const result = await users.insertOne({ username, password });
    res.json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de usuário
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = db.collection('users');
    const user = await users.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    }

    res.json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-salvar elementos
app.post('/auto-save', async (req, res) => {
  const { userId, elements } = req.body;

  try {
    const elementsCollection = db.collection('elements');

    // Remove os elementos antigos do usuário
    await elementsCollection.deleteMany({ user_id: userId });

    // Insere os novos elementos
    const elementsToInsert = elements.map((element) => ({
      user_id: userId,
      type: element.type,
      content: element.content,
      position: element.position,
      width: element.width || null,
      height: element.height || null,
    }));

    await elementsCollection.insertMany(elementsToInsert);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Salvar um elemento
app.post('/save', async (req, res) => {
  const { userId, type, content, position } = req.body;

  try {
    const elements = db.collection('elements');
    const result = await elements.insertOne({
      user_id: userId,
      type,
      content,
      position,
    });
    res.json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Carregar elementos
app.get('/load', async (req, res) => {
  const { userId } = req.query;

  try {
    const elements = db.collection('elements');
    const userElements = await elements.find({ user_id: userId }).toArray();
    res.json(userElements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para servir outras páginas HTML
app.get('/:page', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, 'public', `${page}.html`));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});