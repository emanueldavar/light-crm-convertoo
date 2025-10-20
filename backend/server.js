import express from 'express';
import cors from 'cors';
import leadsRouter from './routes/leads.js';
import columnsRouter from './routes/columns.js';
import webhookRouter from './routes/webhook.js';
import { readDb } from './data/store.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  const data = await readDb();
  res.json({ status: 'ok', columns: data.columns.length, leads: data.leads.length });
});

app.use('/api/leads', leadsRouter);
app.use('/api/columns', columnsRouter);
app.use('/api/webhook', webhookRouter);

app.use((err, _req, res, _next) => {
  console.error(err); // eslint-disable-line no-console
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Light CRM Convertoo backend rodando na porta ${PORT}`);
});
