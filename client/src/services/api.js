const API_BASE = '/api';

export const api = {
  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Falha ao carregar dashboard');
    return res.json();
  },

  // Pacientes
  getPacientes: async (q = '') => {
    const url = q ? `${API_BASE}/pacientes?q=${encodeURIComponent(q)}` : `${API_BASE}/pacientes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar pacientes');
    return res.json();
  },

  getPacienteById: async (id) => {
    const res = await fetch(`${API_BASE}/pacientes/${id}`);
    if (!res.ok) throw new Error('Falha ao buscar detalhes do paciente');
    return res.json();
  },

  createPaciente: async (data) => {
    const res = await fetch(`${API_BASE}/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao criar paciente');
    return res.json();
  },

  updatePaciente: async (id, data) => {
    const res = await fetch(`${API_BASE}/pacientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao atualizar paciente');
    return res.json();
  },

  deletePaciente: async (id) => {
    const res = await fetch(`${API_BASE}/pacientes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir paciente');
    return res.json();
  },

  addEvolucao: async (pacienteId, data) => {
    const res = await fetch(`${API_BASE}/pacientes/${pacienteId}/evolucoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao adicionar evolução');
    return res.json();
  },

  updateOdontograma: async (pacienteId, { dente, status, nota }) => {
    const res = await fetch(`${API_BASE}/pacientes/${pacienteId}/odontograma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dente, status, nota })
    });
    if (!res.ok) throw new Error('Falha ao atualizar dente no odontograma');
    return res.json();
  },

  // Agendamentos
  getAgendamentos: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.data) params.append('data', filtros.data);
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/agendamentos?${qs}` : `${API_BASE}/agendamentos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar agendamentos');
    return res.json();
  },

  createAgendamento: async (data) => {
    const res = await fetch(`${API_BASE}/agendamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao criar agendamento');
    return res.json();
  },

  updateAgendamento: async (id, data) => {
    const res = await fetch(`${API_BASE}/agendamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao atualizar agendamento');
    return res.json();
  },

  deleteAgendamento: async (id) => {
    const res = await fetch(`${API_BASE}/agendamentos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir agendamento');
    return res.json();
  },

  // Financeiro / Pagamentos
  getPagamentos: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.pacienteId) params.append('pacienteId', filtros.pacienteId);

    const qs = params.toString();
    const url = qs ? `${API_BASE}/pagamentos?${qs}` : `${API_BASE}/pagamentos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar pagamentos');
    return res.json();
  },

  createPagamento: async (data) => {
    const res = await fetch(`${API_BASE}/pagamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao criar pagamento');
    return res.json();
  },

  marcarComoPago: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/pagamentos/${id}/pagar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao dar baixa no pagamento');
    return res.json();
  },

  deletePagamento: async (id) => {
    const res = await fetch(`${API_BASE}/pagamentos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir pagamento');
    return res.json();
  }
};
