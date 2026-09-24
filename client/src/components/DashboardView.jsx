import React from 'react';
import { 
  Users, Calendar, DollarSign, AlertTriangle, CheckCircle2, 
  Clock, ArrowRight, UserPlus, CalendarPlus, ShieldAlert, 
  MessageSquare, Sparkles, AlertCircle 
} from 'lucide-react';
import { formatCurrency, formatDateBR, getWhatsAppLink } from '../utils/formatters';

export default function DashboardView({ 
  stats, 
  onNavigate, 
  onSelectPaciente, 
  onOpenNovoPaciente, 
  onOpenNovoAgendamento,
  onOpenNovoPagamento
}) {
  if (!stats) return null;

  const {
    totalPacientes = 0,
    agendamentosHojeTotal = 0,
    concluidosHoje = 0,
    confirmadosHoje = 0,
    totalRecebidoMes = 0,
    totalAtrasado = 0,
    totalPendente = 0,
    quantidadeAtrasados = 0,
    quantidadePendentes = 0,
    quantidadePagos = 0,
    proximosAgendamentos = [],
    inadimplentes = []
  } = stats;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Welcome & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel de Controle Odontológico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Consultório Odontológico Dr. Nael
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Você tem <strong className="text-white font-bold">{agendamentosHojeTotal} consultas agendadas para hoje</strong>. 
              {totalAtrasado > 0 ? ` Atenção para ${quantidadeAtrasados} recebimento(s) em atraso.` : ' O fluxo de caixa está em dia.'}
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNovoAgendamento}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sky-800 hover:bg-sky-50 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <CalendarPlus className="w-4 h-4 text-sky-600" />
              <span>Agendar Paciente</span>
            </button>
            <button
              onClick={onOpenNovoPaciente}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600/60 hover:bg-sky-600 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Paciente</span>
            </button>
            <button
              onClick={onOpenNovoPagamento}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-all active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Atendimentos Hoje */}
        <div 
          onClick={() => onNavigate('agenda')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Consultas Hoje
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{agendamentosHojeTotal}</span>
            <span className="text-xs text-slate-500">atendimentos</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{concluidosHoje} concluído(s) hoje</span>
          </div>
        </div>

        {/* Total Recebido no Mês */}
        <div 
          onClick={() => onNavigate('financeiro')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recebido no Mês
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatCurrency(totalRecebidoMes)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{quantidadePagos} títulos liquidados</span>
          </div>
        </div>

        {/* Pendente / A Receber */}
        <div 
          onClick={() => onNavigate('financeiro')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              A Receber (Pendente)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {formatCurrency(totalPendente)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>{quantidadePendentes} cobrança(s) no prazo</span>
          </div>
        </div>

        {/* EM ATRASO (DESTAQUE CRÍTICO) */}
        <div 
          onClick={() => onNavigate('financeiro')}
          className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group ${
            totalAtrasado > 0 
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200/50' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              {totalAtrasado > 0 && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
              <span>Pagamentos em Atraso</span>
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              totalAtrasado > 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {formatCurrency(totalAtrasado)}
          </div>
          <div className="mt-2 text-xs font-semibold text-rose-700 flex items-center gap-1">
            <span>⚠️ {quantidadeAtrasados} fatura(s) vencida(s)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Próximos Pacientes + Alertas de Atraso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Atendimentos Marcados */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">
                Próximos Pacientes Marcados
              </h2>
            </div>
            <button
              onClick={() => onNavigate('agenda')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1">
            {proximosAgendamentos.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhuma consulta agendada para os próximos dias.
              </div>
            ) : (
              proximosAgendamentos.map((ag) => {
                const whatsapp = getWhatsAppLink(ag.pacienteTelefone, `Olá ${ag.pacienteNome}, confirmamos sua consulta odontológica com Dr. Nael.`);
                return (
                  <div 
                    key={ag.id} 
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Horário */}
                      <div className="w-14 h-14 rounded-xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-extrabold text-sky-800 leading-none">
                          {ag.horaInicio}
                        </span>
                        <span className="text-[10px] text-sky-600 mt-0.5">
                          {ag.horaFim}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase">
                          {formatDateBR(ag.data).slice(0, 5)}
                        </span>
                      </div>

                      {/* Info do Paciente */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onSelectPaciente(ag.pacienteId)}
                            className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors text-left"
                          >
                            {ag.pacienteNome}
                          </button>
                          
                          {/* Alerta se o paciente tem pagamento atrasado */}
                          {ag.temAtraso ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Pagamento Atrasado ({formatCurrency(ag.valorAtrasado)})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Financeiro em dia</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {ag.procedimento}
                        </p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{ag.dentista}</span>
                          {ag.valorEstimado > 0 && (
                            <span>• {formatCurrency(ag.valorEstimado)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {whatsapp && (
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onSelectPaciente(ag.pacienteId)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                      >
                        Prontuário
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Alerta de Inadimplência / Pagamentos Vencidos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-rose-900">
                Atenção: Débitos em Atraso
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-600 text-white">
              {inadimplentes.length}
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {inadimplentes.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-600">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold">Nenhum pagamento em atraso!</p>
                <p className="text-slate-400 mt-1">Todos os pacientes estão com as contas em dia.</p>
              </div>
            ) : (
              inadimplentes.map((inad) => {
                const pac = { id: inad.pacienteId, nome: inad.pacienteNome };
                return (
                  <div 
                    key={inad.pacienteId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-rose-200 hover:border-rose-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <button
                          onClick={() => onSelectPaciente(inad.pacienteId)}
                          className="text-xs font-bold text-slate-900 hover:text-sky-600 text-left block"
                        >
                          {inad.pacienteNome}
                        </button>
                        <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
                          Atraso de {inad.maiorAtrasoDias} dia(s)
                        </span>
                      </div>
                      <span className="text-sm font-extrabold text-rose-600">
                        {formatCurrency(inad.totalAtrasado)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => onSelectPaciente(inad.pacienteId)}
                        className="text-[11px] font-bold text-sky-600 hover:underline"
                      >
                        Abrir Prontuário / Cobrar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('financeiro')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900"
            >
              Ver relatório financeiro completo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
