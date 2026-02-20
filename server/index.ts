import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../src/generated/prisma/client.js';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(cors());          // Povolí požadavky z frontendu (jiný port)
app.use(express.json());  // Parsuje JSON body z požadavků

// GET /api/calculations — vrátí historii výpočtů (posledních 20)
app.get('/api/calculations', async (_req, res) => {
  const calculations = await prisma.calculation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json(calculations);
});

// POST /api/calculations — uloží nový výpočet
app.post('/api/calculations', async (req, res) => {
  const { loanAmount, interestRate, loanPeriodYears, monthlyPayment, totalPaid, totalInterest } = req.body;

  const calculation = await prisma.calculation.create({
    data: {
      loanAmount,
      interestRate,
      loanPeriodYears,
      monthlyPayment,
      totalPaid,
      totalInterest,
    },
  });

  res.status(201).json(calculation);
});

// DELETE /api/calculations/:id — smaže výpočet
app.delete('/api/calculations/:id', async (req, res) => {
  await prisma.calculation.delete({
    where: { id: Number(req.params.id) },
  });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
