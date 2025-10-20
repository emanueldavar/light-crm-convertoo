import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'backend', 'data', 'db.json');

const defaultData = {
  columns: [
    {
      id: 'column-novo-lead',
      name: 'Novo Lead',
      color: '#6366F1',
      order: 0
    },
    {
      id: 'column-contato',
      name: 'Contato Inicial',
      color: '#22D3EE',
      order: 1
    },
    {
      id: 'column-proposta',
      name: 'Proposta Enviada',
      color: '#FBBF24',
      order: 2
    },
    {
      id: 'column-fechado',
      name: 'Fechado',
      color: '#34D399',
      order: 3
    }
  ],
  leads: []
};

async function ensureDb() {
  try {
    await readFile(DB_PATH, 'utf-8');
  } catch (error) {
    await writeFile(DB_PATH, JSON.stringify(defaultData, null, 2));
  }
}

export async function readDb() {
  await ensureDb();
  const content = await readFile(DB_PATH, 'utf-8');
  return JSON.parse(content);
}

export async function writeDb(data) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2));
  return data;
}

export async function resetDb() {
  await writeFile(DB_PATH, JSON.stringify(defaultData, null, 2));
}

export async function getFirstColumnId() {
  const data = await readDb();
  const sorted = [...data.columns].sort((a, b) => a.order - b.order);
  return sorted[0]?.id;
}
