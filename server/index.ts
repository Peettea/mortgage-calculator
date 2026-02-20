import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

// Vytvoř tabulku pokud neexistuje
db.exec(`
  CREATE TABLE IF NOT EXISTS Calculation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loanAmount REAL NOT NULL,
    interestRate REAL NOT NULL,
    loanPeriodYears INTEGER NOT NULL,
    monthlyPayment REAL NOT NULL,
    totalPaid REAL NOT NULL,
    totalInterest REAL NOT NULL,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/calculations — vrátí historii výpočtů (posledních 20)
app.get('/api/calculations', (_req, res) => {
  const rows = db.prepare(
    'SELECT * FROM Calculation ORDER BY createdAt DESC LIMIT 20'
  ).all();
  res.json(rows);
});

// POST /api/calculations — uloží nový výpočet
app.post('/api/calculations', (req, res) => {
  const { loanAmount, interestRate, loanPeriodYears, monthlyPayment, totalPaid, totalInterest } = req.body;

  const result = db.prepare(
    `INSERT INTO Calculation (loanAmount, interestRate, loanPeriodYears, monthlyPayment, totalPaid, totalInterest)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(loanAmount, interestRate, loanPeriodYears, monthlyPayment, totalPaid, totalInterest);

  const row = db.prepare('SELECT * FROM Calculation WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

// DELETE /api/calculations/:id — smaže výpočet
app.delete('/api/calculations/:id', (req, res) => {
  db.prepare('DELETE FROM Calculation WHERE id = ?').run(Number(req.params.id));
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
