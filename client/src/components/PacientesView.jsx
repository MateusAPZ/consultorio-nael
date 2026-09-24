import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Phone, Calendar, 
  AlertTriangle, CheckCircle2, MessageSquare, ChevronRight, FileText, ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDateBR, calculateAge, getWhatsAppLink } from '../utils/formatters';

export default function PacientesView({ 
  pacientes = [], 
  onSelectPaciente, 
  onOpenNovoPaciente,
  onOpenNovoAgendamento 
}) {
  const [busca, setBusca] = useState('');

  const pacientesFiltrados = pacientes.filter(p => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase().trim();
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.cpf && p.cpf.includes(q)) ||
      (p.telefone && p.telefone.includes(q)) ||
      (p.convenio && p.convenio.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            <span>Pacientes & Prontuários</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie o cadastro, histórico clínico, odontograma e débitos dos pacientes
          </p>
        </div>

        <button
          onClick={onOpenNovoPaciente}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Search & Counter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, telefone ou convênio..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white transition-all"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 self-end sm:self-center">
          Mostrando <strong className="text-slate-800">{pacientesFiltrados.length}</strong> de {pacientes.length} pacientes
        </span>
      </div>

      {/* Patients List */}
      {pacientesFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhum paciente encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Tente buscar com outro termo ou cadastre um novo paciente.
          </p>
          <button
            onClick={onOpenNovoPaciente}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl"
          >
            Cadastrar Paciente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pacientesFiltrados.map((paciente) => {
            const temAtraso = paciente.financeiro?.temAtraso;
            const totalAtrasado = paciente.financeiro?.totalAtrasado || 0;
            const whatsapp = getWhatsAppLink(paciente.telefone, `Olá ${paciente.nome}, Dr. Nael Odontologia.`);

            return (
              <div
                key={paciente.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                        {paciente.nome.charAt(0)}
                      </div>
                      <div>
                        <h3 
                          onClick={() => onSelectPaciente(paciente.id)}
                          className="text-base font-bold text-slate-900 hover:text-sky-600 cursor-pointer transition-colors"
                        >
                          {paciente.nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {paciente.convenio || 'Particular'}
                          </span>
                          {paciente.dataNascimento && (
                            <span className="text-[11px] text-slate-500">
                              {calculateAge(paciente.dataNascimento)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Badge */}
                    {temAtraso ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Atrasado: {formatCurrency(totalAtrasado)}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Em dia</span>
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                    {paciente.telefone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{paciente.telefone}</span>
                      </div>
                    )}
                    {paciente.cpf && (
                      <div className="text-[11px]">
                        CPF: <span className="font-semibold text-slate-700">{paciente.cpf}</span>
                      </div>
                    )}
                  </div>

                  {/* Anamnese alert snippet if any */}
                  {paciente.anamnese?.alergias && paciente.anamnese.alergias.toLowerCase() !== 'nenhuma' && (
                    <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                      <span>⚠️ Alergia: {paciente.anamnese.alergias}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {whatsapp && (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onOpenNovoAgendamento && onOpenNovoAgendamento(paciente.id)}
                      className="p-2 rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
                      title="Agendar Consulta"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectPaciente(paciente.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors"
                  >
                    <span>Abrir Prontuário</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
