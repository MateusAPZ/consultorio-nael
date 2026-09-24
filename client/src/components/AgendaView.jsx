import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Phone, CheckCircle2, AlertTriangle, 
  MessageSquare, Plus, Filter, Sparkles, XCircle, PlayCircle, Check 
} from 'lucide-react';
import { formatCurrency, formatDateBR, getTodayDateString, getWhatsAppLink } from '../utils/formatters';
import { api } from '../services/api';

export default function AgendaView({ 
  onSelectPaciente, 
  onOpenNovoAgendamento 
}) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(getTodayDateString());
  const [statusFiltro, setStatusFiltro] = useState('');
  const [visualizacaoRapida, setVisualizacaoRapida] = useState('hoje'); // 'hoje' | 'todos' | 'custom'

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (visualizacaoRapida === 'hoje') {
        filtros.data = getTodayDateString();
      } else if (visualizacaoRapida === 'custom') {
        if (dataFiltro) filtros.data = dataFiltro;
      }
      if (statusFiltro) filtros.status = statusFiltro;

      const data = await api.getAgendamentos(filtros);
      setAgendamentos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [visualizacaoRapida, dataFiltro, statusFiltro]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.updateAgendamento(id, { status: newStatus });
      await fetchAgendamentos();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'concluido':
        return { label: 'Concluído', class: 'bg-emerald-100 text-emerald-800' };
      case 'confirmado':
        return { label: 'Confirmado', class: 'bg-sky-100 text-sky-800' };
      case 'em_atendimento':
        return { label: 'Em Atendimento', class: 'bg-purple-100 text-purple-800 animate-pulse' };
      case 'cancelado':
        return { label: 'Cancelado', class: 'bg-slate-200 text-slate-700' };
      case 'faltou':
        return { label: 'Faltou', class: 'bg-rose-100 text-rose-800' };
      default:
        return { label: 'Agendado', class: 'bg-amber-100 text-amber-800' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-600" />
            <span>Agenda Odontológica</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe os próximos pacientes marcados, horários e situação de pagamento
          </p>
        </div>

        <button
          onClick={() => onOpenNovoAgendamento()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Marcar Novo Paciente</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Date Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setVisualizacaoRapida('hoje');
                setDataFiltro(getTodayDateString());
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                visualizacaoRapida === 'hoje'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Hoje ({formatDateBR(getTodayDateString())})
            </button>
            <button
              onClick={() => setVisualizacaoRapida('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                visualizacaoRapida === 'todos'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Agendamentos
            </button>
            <button
              onClick={() => setVisualizacaoRapida('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                visualizacaoRapida === 'custom'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Escolher Data
            </button>
          </div>

          {/* Date Picker if custom */}
          {visualizacaoRapida === 'custom' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Data:</span>
              <input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">Todos os status</option>
              <option value="agendado">Agendados</option>
              <option value="confirmado">Confirmados</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="concluido">Concluídos</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin" />
        </div>
      ) : agendamentos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum paciente agendado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Não há consultas marcadas para os filtros selecionados.
          </p>
          <button
            onClick={() => onOpenNovoAgendamento()}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
          >
            Agendar Paciente Agora
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((ag) => {
            const statusConfig = getStatusBadge(ag.status);
            const whatsapp = getWhatsAppLink(ag.pacienteTelefone, `Olá ${ag.pacienteNome}, Dr. Nael Odontologia confirmando sua consulta para o dia ${formatDateBR(ag.data)} às ${ag.horaInicio}.`);
            const temAtraso = ag.pacienteFinanceiro?.temAtraso;
            const valorAtrasado = ag.pacienteFinanceiro?.totalAtrasado || 0;

            return (
              <div
                key={ag.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Time & Patient Info */}
                <div className="flex items-start gap-4">
                  {/* Horário Box */}
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-sm font-black text-sky-800 leading-none">
                      {ag.horaInicio}
                    </span>
                    <span className="text-[10px] text-sky-600 mt-1 font-semibold">
                      até {ag.horaFim}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 mt-1">
                      {formatDateBR(ag.data).slice(0, 5)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onSelectPaciente(ag.pacienteId)}
                        className="text-base font-extrabold text-slate-900 hover:text-sky-600 transition-colors text-left"
                      >
                        {ag.pacienteNome}
                      </button>

                      {/* Consulta Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusConfig.class}`}>
                        {statusConfig.label}
                      </span>

                      {/* Pagamento Status Alert Badge */}
                      {temAtraso ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Pagamento em Atraso: {formatCurrency(valorAtrasado)}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Financeiro em dia</span>
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      {ag.procedimento}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Profissional: <strong className="text-slate-700">{ag.dentista}</strong></span>
                      {ag.pacienteTelefone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ag.pacienteTelefone}</span>
                        </span>
                      )}
                      {ag.valorEstimado > 0 && (
                        <span>Valor: <strong className="text-slate-800">{formatCurrency(ag.valorEstimado)}</strong></span>
                      )}
                    </div>

                    {ag.observacoes && (
                      <p className="text-xs text-slate-500 italic pt-0.5">
                        Obs: {ag.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  {/* WhatsApp */}
                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      title="Enviar lembrete WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}

                  {/* Status Actions */}
                  {ag.status === 'agendado' && (
                    <button
                      onClick={() => handleUpdateStatus(ag.id, 'confirmado')}
                      className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
                    >
                      Confirmar
                    </button>
                  )}

                  {ag.status === 'confirmado' && (
                    <button
                      onClick={() => handleUpdateStatus(ag.id, 'em_atendimento')}
                      className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Atender</span>
                    </button>
                  )}

                  {ag.status === 'em_atendimento' && (
                    <button
                      onClick={() => handleUpdateStatus(ag.id, 'concluido')}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Concluir Consulta</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectPaciente(ag.pacienteId)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
                  >
                    Ver Prontuário
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
