// index.js
require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar pasta para arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Config Oracle DB
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECT_STRING // exemplo: "localhost/XEPDB1"
};

// Rota cadastro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere usuário no banco
    await connection.execute(
      `INSERT INTO clientes (username, password) VALUES (:username, :password)`,
      [username, hashedPassword],
      { autoCommit: true }
    );

    await connection.close();
    res.json({ message: 'Cadastro realizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no cadastro' });
  }
});

// Rota login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Busca usuário no banco
    const result = await connection.execute(
      `SELECT password FROM clientes WHERE username = :username`,
      [username]
    );

    await connection.close();

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const hashedPassword = result.rows[0][0];

    // Compara senha
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    res.json({ message: `Bem-vindo, ${username}!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
