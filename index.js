const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const { getConnection } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({   
  secret: 'segredo123',
  resave: false,
  saveUninitialized: true,
}));

// Rota cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  if(!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const conn = await getConnection();

    // Verificar se email já existe
    const result = await conn.execute(
      'SELECT * FROM usuarios WHERE email = :email',
      [email]
    );

    if(result.rows.length > 0){
      conn.close();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar hash da senha
    const hash = await bcrypt.hash(senha, 8);

    // Inserir usuário
    await conn.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)',
      [nome, email, hash],
      { autoCommit: true }
    );

    conn.close();

    res.json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rota login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if(!email || !senha){
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const conn = await getConnection();

    const result = await conn.execute(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = :email',
      [email]
    );

    if(result.rows.length === 0){
      conn.close();
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const [id, nome, emailDb, senhaHash] = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, senhaHash);

    if(!senhaValida){
      conn.close();
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    // Criar sessão
    req.session.userId = id;
    req.session.userName = nome;

    conn.close();

    res.json({ message: 'Login realizado com sucesso!', nome });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
