const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

// Configura o Express para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configura o Express para usar JSON
app.use(express.json());

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Cria a tabela de usuários
db.serialize(() => {
    
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS elements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      position TEXT,
      width TEXT, 
      height TEXT, 
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
});

// Rotas da API
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Nome de usuário já existe.' });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT id FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err || !row) {
        return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
      }
      res.json({ userId: row.id });
    }
  );
});
app.post('/auto-save', (req, res) => {
    const { userId, elements } = req.body;
  
    // Remove os elementos antigos do usuário
    db.run('DELETE FROM elements WHERE user_id = ?', [userId], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // Insere os novos elementos
      const stmt = db.prepare(`
        INSERT INTO elements (user_id, type, content, position, width, height)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      elements.forEach((element) => {
        stmt.run(
          userId,
          element.type,
          element.content,
          element.position,
          element.width || null, // Garante que o valor não seja undefined
          element.height || null // Garante que o valor não seja undefined
        );
      });
      stmt.finalize();
  
      res.json({ success: true });
    });
  });
  
app.post('/save', (req, res) => {
  const { userId, type, content, position } = req.body;

  db.run(
    'INSERT INTO elements (user_id, type, content, position) VALUES (?, ?, ?, ?)',
    [userId, type, content, position],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/load', (req, res) => {
  const { userId } = req.query;

  db.all(
    'SELECT * FROM elements WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get('/user-info', (req, res) => {
  const { userId } = req.query;

  db.get(
    'SELECT username, image FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      res.json(row); // Retorna { username: 'Nome do Usuário', image: 'caminho/da/imagem' }
    }
  );
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