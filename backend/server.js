import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import leadsRouter from './routes/leads.js';
import columnsRouter from './routes/columns.js';
import webhookRouter from './routes/webhook.js';
import commentsRouter from './routes/comments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Light CRM Convertoo API' });
});

app.use('/api/leads', leadsRouter);
app.use('/api/columns', columnsRouter);
app.use('/api/webhook', webhookRouter);

// Comments endpoints (GET/POST) are defined in routes/comments.js
// They use paths like /api/leads/:id/comments
app.use('/api', commentsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});