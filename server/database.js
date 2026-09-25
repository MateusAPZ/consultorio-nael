import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './seedData.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDiff(fromDateStr, toDateStr) {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

class Database {
  constructor() {
    this.memoryData = null;
    this.isCloud = false;
    this.cloudType = null; // 'mongodb' | 'postgres' | null
    this.mongoClient = null;
    this.mongoDb = null;
    this.pgPool = null;

    this.init();
  }

  async init() {
    // Check if MongoDB cloud is configured
    if (process.env.MONGODB_URI) {
      try {
        const { MongoClient } = await import('mongodb');
        this.mongoClient = new MongoClient(process.env.MONGODB_URI);
        await this.mongoClient.connect();
        this.mongoDb = this.mongoClient.db(process.env.MONGODB_DB || 'sistema_nael');
        this.isCloud = true;
        this.cloudType = 'mongodb';
        console.log('☁️ [DATABASE] Conectado com sucesso ao MongoDB Atlas na Nuvem!');

        // Load or seed
        const storeCol = this.mongoDb.collection('clinica_store');
        const doc = await storeCol.findOne({ _id: 'main_data' });
        if (doc && doc.data) {
          this.memoryData = doc.data;
          console.log('☁️ [DATABASE] Dados carregados do MongoDB Atlas com sucesso.');
        } else {
          console.log('☁️ [DATABASE] Inicializando dados padrão no MongoDB Atlas...');
          this.memoryData = JSON.parse(JSON.stringify(initialData));
          await storeCol.updateOne(
            { _id: 'main_data' },
            { $set: { data: this.memoryData, updatedAt: new Date() } },
            { upsert: true }
          );
        }
        return;
      } catch (err) {
        console.error('⚠️ [DATABASE] Falha ao conectar ao MongoDB, usando fallback local:', err.message);
      }
    }

    // Check if PostgreSQL (Supabase / Neon / Render) is configured
    if (process.env.DATABASE_URL) {
      try {
        const { Pool } = await import('pg');
        this.pgPool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
        });

        // Create table if not exists
        await this.pgPool.query(`
          CREATE TABLE IF NOT EXISTS clinica_store (
            id VARCHAR(50) PRIMARY KEY,
            data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        this.isCloud = true;
        this.cloudType = 'postgres';
        console.log('☁️ [DATABASE] Conectado com sucesso ao PostgreSQL na Nuvem!');

        const res = await this.pgPool.query(`SELECT data FROM clinica_store WHERE id = 'main_data'`);
        if (res.rows.length > 0 && res.rows[0].data) {
          this.memoryData = res.rows[0].data;
          console.log('☁️ [DATABASE] Dados carregados do PostgreSQL com sucesso.');
        } else {
          console.log('☁️ [DATABASE] Inicializando dados padrão no PostgreSQL...');
          this.memoryData = JSON.parse(JSON.stringify(initialData));
          await this.pgPool.query(
            `INSERT INTO clinica_store (id, data, updated_at) VALUES ('main_data', $1, NOW())
             ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
            [JSON.stringify(this.memoryData)]
          );
        }
        return;
      } catch (err) {
        console.error('⚠️ [DATABASE] Falha ao conectar ao PostgreSQL, usando fallback local:', err.message);
      }
    }

    // Fallback: Local JSON file
    if (!fs.existsSync(DB_FILE)) {
      console.log('💾 [DATABASE] Criando banco de dados local com dados demonstrativos...');
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    }

    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      this.memoryData = JSON.parse(content);
      console.log('💾 [DATABASE] Rodando com armazenamento local (server/data/db.json).');
    } catch (e) {
      this.memoryData = JSON.parse(JSON.stringify(initialData));
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    }
  }

  loadData() {
    if (!this.memoryData) {
      if (fs.existsSync(DB_FILE)) {
        try {
          this.memoryData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        } catch {
          this.memoryData = JSON.parse(JSON.stringify(initialData));
        }
      } else {
        this.memoryData = JSON.parse(JSON.stringify(initialData));
      }
    }
    return this.memoryData;
  }

  saveData(data) {
    this.memoryData = data;

    // Async sync to Cloud if enabled
    if (this.isCloud && this.cloudType === 'mongodb' && this.mongoDb) {
      this.mongoDb.collection('clinica_store').updateOne(
        { _id: 'main_data' },
        { $set: { data: this.memoryData, updatedAt: new Date() } },
        { upsert: true }
      ).catch(err => console.error('Erro ao sincronizar com MongoDB:', err));
    } else if (this.isCloud && this.cloudType === 'postgres' && this.pgPool) {
      this.pgPool.query(
        `INSERT INTO clinica_store (id, data, updated_at) VALUES ('main_data', $1, NOW())
         ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
        [JSON.stringify(this.memoryData)]
      ).catch(err => console.error('Erro ao sincronizar com PostgreSQL:', err));
    }

    // Always keep a local copy as backup if filesystem is writable
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // Ignored if in read-only environment
    }
  }

  enrichPayment(pagamento) {
    const today = getTodayString();
    const item = { ...pagamento };

    if (item.status === 'pago') {
      item.diasAtraso = 0;
      return item;
    }

    if (item.dataVencimento < today) {
      item.status = 'atrasado';
      item.diasAtraso = Math.max(1, getDaysDiff(item.dataVencimento, today));
    } else {
      item.status = 'pendente';
      item.diasAtraso = 0;
    }

    return item;
  }

  // --- PACIENTES ---
  getPacientes(query = '') {
    const data = this.loadData();
    let pacientes = data.pacientes || [];
    
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      pacientes = pacientes.filter(p => 
        p.nome.toLowerCase().includes(q) ||
        (p.cpf && p.cpf.includes(q)) ||
        (p.telefone && p.telefone.includes(q)) ||
        (p.convenio && p.convenio.toLowerCase().includes(q))
      );
    }

    const agendamentos = data.agendamentos || [];
    const pagamentos = (data.pagamentos || []).map(p => this.enrichPayment(p));

    return pacientes.map(paciente => {
      const pacAgendamentos = agendamentos.filter(a => a.pacienteId === paciente.id);
      const pacPagamentos = pagamentos.filter(p => p.pacienteId === paciente.id);
      
      const temAtraso = pacPagamentos.some(p => p.status === 'atrasado');
      const totalAtrasado = pacPagamentos
        .filter(p => p.status === 'atrasado')
        .reduce((sum, p) => sum + Number(p.valor || 0), 0);
      const totalPendente = pacPagamentos
        .filter(p => p.status === 'pendente')
        .reduce((sum, p) => sum + Number(p.valor || 0), 0);

      const today = getTodayString();
      const proximos = pacAgendamentos
        .filter(a => a.data >= today && a.status !== 'cancelado')
        .sort((a, b) => (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio));

      return {
        ...paciente,
        totalAgendamentos: pacAgendamentos.length,
        proximoAgendamento: proximos[0] || null,
        financeiro: {
          temAtraso,
          totalAtrasado,
          totalPendente,
          totalLancamentos: pacPagamentos.length
        }
      };
    });
  }

  getPacienteById(id) {
    const data = this.loadData();
    const paciente = data.pacientes.find(p => p.id === id);
    if (!paciente) return null;

    const agendamentos = (data.agendamentos || [])
      .filter(a => a.pacienteId === id)
      .sort((a, b) => (b.data + b.horaInicio).localeCompare(a.data + a.horaInicio));

    const pagamentos = (data.pagamentos || [])
      .filter(p => p.pacienteId === id)
      .map(p => this.enrichPayment(p))
      .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento));

    return {
      ...paciente,
      agendamentos,
      pagamentos
    };
  }

  createPaciente(pacienteData) {
    const data = this.loadData();
    const id = 'pac_' + Date.now();
    const newPaciente = {
      id,
      nome: pacienteData.nome || 'Sem Nome',
      cpf: pacienteData.cpf || '',
      telefone: pacienteData.telefone || '',
      email: pacienteData.email || '',
      dataNascimento: pacienteData.dataNascimento || '',
      endereco: pacienteData.endereco || '',
      convenio: pacienteData.convenio || 'Particular',
      anamnese: {
        alergias: pacienteData.anamnese?.alergias || 'Nenhuma',
        doencasSistemicas: pacienteData.anamnese?.doencasSistemicas || 'Nenhuma',
        medicacoesEmUso: pacienteData.anamnese?.medicacoesEmUso || 'Nenhuma',
        fumante: Boolean(pacienteData.anamnese?.fumante),
        sangramentoGengival: Boolean(pacienteData.anamnese?.sangramentoGengival),
        hipertenso: Boolean(pacienteData.anamnese?.hipertenso),
        diabetico: Boolean(pacienteData.anamnese?.diabetico),
        observacoesMedicas: pacienteData.anamnese?.observacoesMedicas || ''
      },
      odontograma: pacienteData.odontograma || {},
      evolucoes: [],
      fotos: [],
      criadoEm: getTodayString()
    };

    data.pacientes.push(newPaciente);
    this.saveData(data);
    return newPaciente;
  }

  updatePaciente(id, updates) {
    const data = this.loadData();
    const index = data.pacientes.findIndex(p => p.id === id);
    if (index === -1) return null;

    data.pacientes[index] = {
      ...data.pacientes[index],
      ...updates,
      anamnese: {
        ...data.pacientes[index].anamnese,
        ...(updates.anamnese || {})
      },
      odontograma: {
        ...data.pacientes[index].odontograma,
        ...(updates.odontograma || {})
      }
    };

    if (updates.nome) {
      data.agendamentos.forEach(a => {
        if (a.pacienteId === id) a.pacienteNome = updates.nome;
      });
      data.pagamentos.forEach(p => {
        if (p.pacienteId === id) p.pacienteNome = updates.nome;
      });
    }

    if (updates.telefone) {
      data.agendamentos.forEach(a => {
        if (a.pacienteId === id) a.pacienteTelefone = updates.telefone;
      });
    }

    this.saveData(data);
    return data.pacientes[index];
  }

  deletePaciente(id) {
    const data = this.loadData();
    data.pacientes = data.pacientes.filter(p => p.id !== id);
    this.saveData(data);
    return true;
  }

  addEvolucao(pacienteId, evolucaoData) {
    const data = this.loadData();
    const paciente = data.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return null;

    if (!paciente.evolucoes) paciente.evolucoes = [];

    const newEvolucao = {
      id: 'evo_' + Date.now(),
      data: evolucaoData.data || getTodayString(),
      hora: evolucaoData.hora || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dente: evolucaoData.dente || 'Geral',
      procedimento: evolucaoData.procedimento || '',
      descricao: evolucaoData.descricao || '',
      profissional: evolucaoData.profissional || 'Dr. Nael Santos',
      valor: Number(evolucaoData.valor) || 0
    };

    paciente.evolucoes.unshift(newEvolucao);

    if (evolucaoData.gerarCobranca && newEvolucao.valor > 0) {
      const newPagamento = {
        id: 'pag_' + Date.now(),
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        agendamentoId: null,
        descricao: `${newEvolucao.procedimento} (${newEvolucao.dente})`,
        valor: newEvolucao.valor,
        dataVencimento: evolucaoData.dataVencimento || getTodayString(),
        dataPagamento: evolucaoData.jaPago ? getTodayString() : null,
        status: evolucaoData.jaPago ? 'pago' : 'pendente',
        formaPagamento: evolucaoData.formaPagamento || (evolucaoData.jaPago ? 'pix' : null),
        observacoes: `Lançamento automático via evolução clínica em ${newEvolucao.data}.`
      };
      data.pagamentos.push(newPagamento);
    }

    this.saveData(data);
    return newEvolucao;
  }

  updateOdontograma(pacienteId, denteNumero, status, nota = '') {
    const data = this.loadData();
    const paciente = data.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return null;

    if (!paciente.odontograma) paciente.odontograma = {};
    paciente.odontograma[denteNumero] = {
      status,
      nota,
      atualizadoEm: getTodayString()
    };

    this.saveData(data);
    return paciente.odontograma;
  }

  // --- FOTOS DO PACIENTE (PRONTUÁRIO) ---
  addFoto(pacienteId, fotoData) {
    const data = this.loadData();
    const paciente = data.pacientes.find(p => p.id === pacienteId);
    if (!paciente) return null;

    if (!paciente.fotos) paciente.fotos = [];

    const newFoto = {
      id: 'foto_' + Date.now(),
      imagem: fotoData.imagem,
      titulo: fotoData.titulo || 'Foto Clínica',
      categoria: fotoData.categoria || 'Intraoral',
      data: fotoData.data || getTodayString(),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      notas: fotoData.notas || '',
      profissional: fotoData.profissional || 'Dr. Nael Santos'
    };

    paciente.fotos.unshift(newFoto);
    this.saveData(data);
    return newFoto;
  }

  deleteFoto(pacienteId, fotoId) {
    const data = this.loadData();
    const paciente = data.pacientes.find(p => p.id === pacienteId);
    if (!paciente || !paciente.fotos) return false;

    const initialLength = paciente.fotos.length;
    paciente.fotos = paciente.fotos.filter(f => f.id !== fotoId);

    if (paciente.fotos.length !== initialLength) {
      this.saveData(data);
      return true;
    }
    return false;
  }

  // --- AGENDAMENTOS ---
  getAgendamentos(filtros = {}) {
    const data = this.loadData();
    let lista = (data.agendamentos || []).map(a => ({ ...a }));
    const pagamentos = (data.pagamentos || []).map(p => this.enrichPayment(p));

    if (filtros.data) {
      lista = lista.filter(a => a.data === filtros.data);
    }
    if (filtros.pacienteId) {
      lista = lista.filter(a => a.pacienteId === filtros.pacienteId);
    }
    if (filtros.status) {
      lista = lista.filter(a => a.status === filtros.status);
    }

    lista.sort((a, b) => (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio));

    return lista.map(agendamento => {
      const pacPagamentos = pagamentos.filter(p => p.pacienteId === agendamento.pacienteId);
      const temAtraso = pacPagamentos.some(p => p.status === 'atrasado');
      const totalAtrasado = pacPagamentos
        .filter(p => p.status === 'atrasado')
        .reduce((sum, p) => sum + Number(p.valor || 0), 0);

      const pagamentoVinculado = agendamento.id 
        ? pagamentos.find(p => p.agendamentoId === agendamento.id) 
        : null;

      return {
        ...agendamento,
        pagamentoVinculado,
        pacienteFinanceiro: {
          temAtraso,
          totalAtrasado
        }
      };
    });
  }

  createAgendamento(agendamentoData) {
    const data = this.loadData();
    const id = 'age_' + Date.now();
    const paciente = data.pacientes.find(p => p.id === agendamentoData.pacienteId);

    const newAgendamento = {
      id,
      pacienteId: agendamentoData.pacienteId,
      pacienteNome: paciente ? paciente.nome : (agendamentoData.pacienteNome || 'Paciente'),
      pacienteTelefone: paciente ? paciente.telefone : (agendamentoData.pacienteTelefone || ''),
      data: agendamentoData.data || getTodayString(),
      horaInicio: agendamentoData.horaInicio || '09:00',
      horaFim: agendamentoData.horaFim || '10:00',
      procedimento: agendamentoData.procedimento || 'Consulta',
      dentista: agendamentoData.dentista || 'Dr. Nael Santos',
      status: agendamentoData.status || 'agendado',
      observacoes: agendamentoData.observacoes || '',
      valorEstimado: Number(agendamentoData.valorEstimado) || 0
    };

    data.agendamentos.push(newAgendamento);

    if (agendamentoData.gerarCobranca && newAgendamento.valorEstimado > 0) {
      const newPagamento = {
        id: 'pag_' + Date.now(),
        pacienteId: newAgendamento.pacienteId,
        pacienteNome: newAgendamento.pacienteNome,
        agendamentoId: newAgendamento.id,
        descricao: `${newAgendamento.procedimento} (Consulta ${newAgendamento.data})`,
        valor: newAgendamento.valorEstimado,
        dataVencimento: newAgendamento.data,
        dataPagamento: agendamentoData.jaPago ? getTodayString() : null,
        status: agendamentoData.jaPago ? 'pago' : 'pendente',
        formaPagamento: agendamentoData.formaPagamento || (agendamentoData.jaPago ? 'pix' : null),
        observacoes: `Lançamento gerado pelo agendamento da consulta.`
      };
      data.pagamentos.push(newPagamento);
    }

    this.saveData(data);
    return newAgendamento;
  }

  updateAgendamento(id, updates) {
    const data = this.loadData();
    const index = data.agendamentos.findIndex(a => a.id === id);
    if (index === -1) return null;

    data.agendamentos[index] = {
      ...data.agendamentos[index],
      ...updates
    };

    this.saveData(data);
    return data.agendamentos[index];
  }

  deleteAgendamento(id) {
    const data = this.loadData();
    data.agendamentos = data.agendamentos.filter(a => a.id !== id);
    this.saveData(data);
    return true;
  }

  // --- PAGAMENTOS ---
  getPagamentos(filtros = {}) {
    const data = this.loadData();
    let lista = (data.pagamentos || []).map(p => this.enrichPayment(p));

    if (filtros.status) {
      lista = lista.filter(p => p.status === filtros.status);
    }
    if (filtros.pacienteId) {
      lista = lista.filter(p => p.pacienteId === filtros.pacienteId);
    }

    lista.sort((a, b) => {
      const priority = { atrasado: 1, pendente: 2, pago: 3 };
      if (priority[a.status] !== priority[b.status]) {
        return priority[a.status] - priority[b.status];
      }
      return b.dataVencimento.localeCompare(a.dataVencimento);
    });

    return lista;
  }

  createPagamento(pagamentoData) {
    const data = this.loadData();
    const paciente = data.pacientes.find(p => p.id === pagamentoData.pacienteId);

    const isPago = pagamentoData.status === 'pago';
    const newPagamento = {
      id: 'pag_' + Date.now(),
      pacienteId: pagamentoData.pacienteId,
      pacienteNome: paciente ? paciente.nome : (pagamentoData.pacienteNome || 'Paciente'),
      agendamentoId: pagamentoData.agendamentoId || null,
      descricao: pagamentoData.descricao || 'Tratamento Odontológico',
      valor: Number(pagamentoData.valor) || 0,
      dataVencimento: pagamentoData.dataVencimento || getTodayString(),
      dataPagamento: isPago ? (pagamentoData.dataPagamento || getTodayString()) : null,
      status: isPago ? 'pago' : 'pendente',
      formaPagamento: isPago ? (pagamentoData.formaPagamento || 'pix') : null,
      observacoes: pagamentoData.observacoes || ''
    };

    data.pagamentos.push(newPagamento);
    this.saveData(data);
    return this.enrichPayment(newPagamento);
  }

  marcarComoPago(id, dados = {}) {
    const data = this.loadData();
    const index = data.pagamentos.findIndex(p => p.id === id);
    if (index === -1) return null;

    data.pagamentos[index].status = 'pago';
    data.pagamentos[index].dataPagamento = dados.dataPagamento || getTodayString();
    data.pagamentos[index].formaPagamento = dados.formaPagamento || 'pix';
    if (dados.observacoes) {
      data.pagamentos[index].observacoes = dados.observacoes;
    }

    this.saveData(data);
    return this.enrichPayment(data.pagamentos[index]);
  }

  updatePagamento(id, updates) {
    const data = this.loadData();
    const index = data.pagamentos.findIndex(p => p.id === id);
    if (index === -1) return null;

    data.pagamentos[index] = {
      ...data.pagamentos[index],
      ...updates
    };

    this.saveData(data);
    return this.enrichPayment(data.pagamentos[index]);
  }

  deletePagamento(id) {
    const data = this.loadData();
    data.pagamentos = data.pagamentos.filter(p => p.id !== id);
    this.saveData(data);
    return true;
  }

  // --- DASHBOARD STATS ---
  getDashboardStats() {
    const data = this.loadData();
    const today = getTodayString();
    const currentMonth = today.substring(0, 7);

    const pagamentos = (data.pagamentos || []).map(p => this.enrichPayment(p));
    const agendamentos = data.agendamentos || [];
    const pacientes = data.pacientes || [];

    const totalRecebidoMes = pagamentos
      .filter(p => p.status === 'pago' && (p.dataPagamento || p.dataVencimento).startsWith(currentMonth))
      .reduce((sum, p) => sum + Number(p.valor || 0), 0);

    const totalAtrasado = pagamentos
      .filter(p => p.status === 'atrasado')
      .reduce((sum, p) => sum + Number(p.valor || 0), 0);

    const totalPendente = pagamentos
      .filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + Number(p.valor || 0), 0);

    const totalGeralRecebido = pagamentos
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + Number(p.valor || 0), 0);

    const agendamentosHoje = agendamentos.filter(a => a.data === today);
    const concluidosHoje = agendamentosHoje.filter(a => a.status === 'concluido').length;
    const confirmadosHoje = agendamentosHoje.filter(a => a.status === 'confirmado').length;

    const proximosAgendamentos = agendamentos
      .filter(a => a.data >= today && a.status !== 'cancelado')
      .sort((a, b) => (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio))
      .slice(0, 6)
      .map(ag => {
        const pacPagamentos = pagamentos.filter(p => p.pacienteId === ag.pacienteId);
        const temAtraso = pacPagamentos.some(p => p.status === 'atrasado');
        const valorAtrasado = pacPagamentos
          .filter(p => p.status === 'atrasado')
          .reduce((sum, p) => sum + Number(p.valor || 0), 0);

        return {
          ...ag,
          temAtraso,
          valorAtrasado
        };
      });

    const inadimplentesMap = {};
    pagamentos
      .filter(p => p.status === 'atrasado')
      .forEach(p => {
        if (!inadimplentesMap[p.pacienteId]) {
          inadimplentesMap[p.pacienteId] = {
            pacienteId: p.pacienteId,
            pacienteNome: p.pacienteNome,
            totalAtrasado: 0,
            quantidadeTitulos: 0,
            maiorAtrasoDias: 0,
            titulos: []
          };
        }
        inadimplentesMap[p.pacienteId].totalAtrasado += Number(p.valor || 0);
        inadimplentesMap[p.pacienteId].quantidadeTitulos += 1;
        inadimplentesMap[p.pacienteId].maiorAtrasoDias = Math.max(
          inadimplentesMap[p.pacienteId].maiorAtrasoDias,
          p.diasAtraso || 0
        );
        inadimplentesMap[p.pacienteId].titulos.push(p);
      });

    return {
      totalPacientes: pacientes.length,
      agendamentosHojeTotal: agendamentosHoje.length,
      concluidosHoje,
      confirmadosHoje,
      totalRecebidoMes,
      totalGeralRecebido,
      totalAtrasado,
      totalPendente,
      quantidadeAtrasados: pagamentos.filter(p => p.status === 'atrasado').length,
      quantidadePendentes: pagamentos.filter(p => p.status === 'pendente').length,
      quantidadePagos: pagamentos.filter(p => p.status === 'pago').length,
      proximosAgendamentos,
      inadimplentes: Object.values(inadimplentesMap),
      hoje: today,
      cloudStatus: this.isCloud ? `Nuvem (${this.cloudType})` : 'Local (db.json)'
    };
  }

  // Backup / Export
  exportBackup() {
    return this.loadData();
  }
}

export const db = new Database();
