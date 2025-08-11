require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

pool.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  )
`);

app.post("/cadastro", async (req, res) => {
  const { email, senha } = req.body;
  const hash = await bcrypt.hash(senha, 10);
  try {
    await pool.query("INSERT INTO usuarios (email, senha) VALUES ($1, $2)", [email, hash]);
    res.redirect("/");
  } catch {
    res.send("Erro: usuário já existe.");
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const result = await pool.query("SELECT * FROM usuarios WHERE email=$1", [email]);
  if (result.rows.length === 0) return res.send("Usuário não encontrado");

  const match = await bcrypt.compare(senha, result.rows[0].senha);
  if (match) res.send(`Bem-vindo, ${email}`);
  else res.send("Senha incorreta");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
