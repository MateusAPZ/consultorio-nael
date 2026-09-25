import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static files for client (if built)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// --- API ROUTES ---

// Login / Autenticação Exclusiva Dr. Nael
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const userTrim = (username || '').trim();
  const passTrim = (password || '').trim();

  if (userTrim === 'Naelsrc' && passTrim === '33385458vr') {
    return res.json({
      success: true,
      token: 'nael_auth_' + Buffer.from('Naelsrc:33385458vr').toString('base64'),
      user: {
        nome: 'Dr. Nael Santos',
        usuario: 'Naelsrc',
        cro: 'CRO-SP 104.921',
        cargo: 'Cirurgião-Dentista Responsável'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Usuário ou senha incorretos. Acesso restrito ao Dr. Nael.'
  });
});

// Health & System Info
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'Dr. Nael Odontologia',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('Erro no dashboard:', err);
    res.status(500).json({ error: 'Erro ao carregar estatísticas do dashboard' });
  }
});

// Backup completo do banco de dados (Download JSON)
app.get('/api/backup', (req, res) => {
  try {
    const data = db.exportBackup();
    res.setHeader('Content-disposition', `attachment; filename=backup-consultorio-nael-${new Date().toISOString().slice(0,10)}.json`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar backup' });
  }
});

// Pacientes
app.get('/api/pacientes', (req, res) => {
  try {
    const { q } = req.query;
    const pacientes = db.getPacientes(q);
    res.json(pacientes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar pacientes' });
  }
});

app.get('/api/pacientes/:id', (req, res) => {
  try {
    const paciente = db.getPacienteById(req.params.id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
});

app.post('/api/pacientes', (req, res) => {
  try {
    const novo = db.createPaciente(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar paciente' });
  }
});

app.put('/api/pacientes/:id', (req, res) => {
  try {
    const atualizado = db.updatePaciente(req.params.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
});

app.delete('/api/pacientes/:id', (req, res) => {
  try {
    db.deletePaciente(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover paciente' });
  }
});

// Evolução Clínica
app.post('/api/pacientes/:id/evolucoes', (req, res) => {
  try {
    const evolucao = db.addEvolucao(req.params.id, req.body);
    if (!evolucao) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.status(201).json(evolucao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar evolução clínica' });
  }
});

// Odontograma
app.post('/api/pacientes/:id/odontograma', (req, res) => {
  try {
    const { dente, status, nota } = req.body;
    const odontograma = db.updateOdontograma(req.params.id, dente, status, nota);
    if (!odontograma) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.json(odontograma);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar odontograma' });
  }
});

// Fotos e Exames Clínicos do Paciente (Prontuário)
app.post('/api/pacientes/:id/fotos', (req, res) => {
  try {
    const { imagem, titulo, categoria, notas, data } = req.body || {};
    if (!imagem) {
      return res.status(400).json({ error: 'Nenhuma imagem foi informada.' });
    }
    const foto = db.addFoto(req.params.id, { imagem, titulo, categoria, notas, data });
    if (!foto) {
      return res.status(404).json({ error: 'Paciente não encontrado.' });
    }
    res.status(201).json(foto);
  } catch (err) {
    console.error('Erro ao salvar foto:', err);
    res.status(500).json({ error: 'Erro ao salvar foto no prontuário' });
  }
});

app.delete('/api/pacientes/:id/fotos/:fotoId', (req, res) => {
  try {
    const ok = db.deleteFoto(req.params.id, req.params.fotoId);
    if (!ok) {
      return res.status(404).json({ error: 'Foto não encontrada.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao excluir foto:', err);
    res.status(500).json({ error: 'Erro ao excluir foto' });
  }
});

// Agendamentos
app.get('/api/agendamentos', (req, res) => {
  try {
    const agendamentos = db.getAgendamentos(req.query);
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

app.post('/api/agendamentos', (req, res) => {
  try {
    const novo = db.createAgendamento(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

app.put('/api/agendamentos/:id', (req, res) => {
  try {
    const atualizado = db.updateAgendamento(req.params.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

app.delete('/api/agendamentos/:id', (req, res) => {
  try {
    db.deleteAgendamento(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});

// Financeiro / Pagamentos
app.get('/api/pagamentos', (req, res) => {
  try {
    const pagamentos = db.getPagamentos(req.query);
    res.json(pagamentos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar pagamentos' });
  }
});

app.post('/api/pagamentos', (req, res) => {
  try {
    const novo = db.createPagamento(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao lançar pagamento' });
  }
});

app.put('/api/pagamentos/:id', (req, res) => {
  try {
    const atualizado = db.updatePagamento(req.params.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

app.put('/api/pagamentos/:id/pagar', (req, res) => {
  try {
    const pago = db.marcarComoPago(req.params.id, req.body);
    if (!pago) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    res.json(pago);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao dar baixa no pagamento' });
  }
});

app.delete('/api/pagamentos/:id', (req, res) => {
  try {
    db.deletePagamento(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir pagamento' });
  }
});

// Fallback to client SPA in production
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(404).send('Servidor Dr. Nael Odontologia rodando.');
      }
    });
  }
  next();
});

import os from 'os';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    if (name.toLowerCase().includes('wsl') || name.toLowerCase().includes('vethernet') || name.toLowerCase().includes('radmin') || name.toLowerCase().includes('virtual')) {
      continue;
    }
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '192.168.100.179';
}

const localIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🦷 Dr. Nael Odontologia - Servidor Ativo`);
  console.log(`💻 No Computador: http://localhost:${PORT}`);
  console.log(`📱 No Smartphone (mesmo Wi-Fi): http://${localIp}:${PORT}`);
  console.log(`=======================================================`);
});
