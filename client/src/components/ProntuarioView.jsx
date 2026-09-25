import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, ShieldAlert, HeartPulse, 
  Calendar, DollarSign, Plus, Printer, FileText, CheckCircle2, 
  AlertTriangle, Clock, MessageSquare, AlertCircle, Edit, ExternalLink,
  Camera, Image as ImageIcon, Trash2, Download, Maximize2, X
} from 'lucide-react';
import Odontograma from './Odontograma';
import ModalNovaEvolucao from './ModalNovaEvolucao';
import ModalBaixaPagamento from './ModalBaixaPagamento';
import ModalTirarFoto from './ModalTirarFoto';
import { formatCurrency, formatDateBR, calculateAge, getWhatsAppLink } from '../utils/formatters';
import { api } from '../services/api';

export default function ProntuarioView({ pacienteId, onBack, onOpenNovoAgendamento }) {
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('odontograma'); // 'odontograma' | 'anamnese' | 'evolucoes' | 'fotos' | 'financeiro' | 'agendamentos'
  const [isNovaEvolucaoOpen, setIsNovaEvolucaoOpen] = useState(false);
  const [pagamentoParaBaixa, setPagamentoParaBaixa] = useState(null);
  const [isTirarFotoOpen, setIsTirarFotoOpen] = useState(false);
  const [selectedFotoLightbox, setSelectedFotoLightbox] = useState(null);
  const [filtroCategoriaFoto, setFiltroCategoriaFoto] = useState('todas');

  const fetchPaciente = async () => {
    try {
      setLoading(true);
      const data = await api.getPacienteById(pacienteId);
      setPaciente(data);
    } catch (err) {
      console.error('Erro ao carregar prontuário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) fetchPaciente();
  }, [pacienteId]);

  const handleUpdateTooth = async (dente, status, nota) => {
    try {
      await api.updateOdontograma(pacienteId, { dente, status, nota });
      await fetchPaciente();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatedEvolucao = async (dados) => {
    try {
      await api.addEvolucao(pacienteId, dados);
      await fetchPaciente();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBaixaConfirmed = async (pagamentoId, dados) => {
    try {
      await api.marcarComoPago(pagamentoId, dados);
      await fetchPaciente();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoSaved = async (dadosFoto) => {
    try {
      await api.addFoto(pacienteId, dadosFoto);
      await fetchPaciente();
    } catch (err) {
      console.error('Erro ao salvar foto:', err);
    }
  };

  const handleDeleteFoto = async (fotoId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto do prontuário?')) return;
    try {
      await api.deleteFoto(pacienteId, fotoId);
      if (selectedFotoLightbox?.id === fotoId) {
        setSelectedFotoLightbox(null);
      }
      await fetchPaciente();
    } catch (err) {
      console.error('Erro ao excluir foto:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Carregando prontuário eletrônico...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600">Paciente não encontrado.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm text-white bg-sky-600 rounded-xl"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  const pagamentos = paciente.pagamentos || [];
  const totalAtrasado = pagamentos
    .filter(p => p.status === 'atrasado')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);
  const totalPendente = pagamentos
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);
  const temAtraso = totalAtrasado > 0;

  const whatsappLink = getWhatsAppLink(paciente.telefone, `Olá ${paciente.nome}, Dr. Nael Odontologia entrando em contato.`);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Pacientes</span>
        </button>

        <div className="flex items-center gap-2">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Prontuário</span>
          </button>
          <button
            onClick={() => onOpenNovoAgendamento && onOpenNovoAgendamento(paciente.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Agendar Consulta</span>
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {paciente.nome.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {paciente.nome}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  {paciente.convenio || 'Particular'}
                </span>
                {temAtraso && (
                  <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Possui débitos em atraso: {formatCurrency(totalAtrasado)}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500">
                {paciente.dataNascimento && (
                  <span>
                    Nascimento: <strong className="text-slate-700">{formatDateBR(paciente.dataNascimento)}</strong> ({calculateAge(paciente.dataNascimento)})
                  </span>
                )}
                {paciente.cpf && (
                  <span>
                    CPF: <strong className="text-slate-700">{paciente.cpf}</strong>
                  </span>
                )}
                {paciente.telefone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <strong className="text-slate-700">{paciente.telefone}</strong>
                  </span>
                )}
                {paciente.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700">{paciente.email}</span>
                  </span>
                )}
              </div>

              {paciente.endereco && (
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{paciente.endereco}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Summary Pill Boxes */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-initial p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-[120px]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Consultas</span>
              <span className="text-lg font-bold text-slate-800">{(paciente.agendamentos || []).length}</span>
            </div>
            <div className="flex-1 lg:flex-initial p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-[120px]">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Evoluções</span>
              <span className="text-lg font-bold text-slate-800">{(paciente.evolucoes || []).length}</span>
            </div>
            <div className={`flex-1 lg:flex-initial p-3 rounded-xl border min-w-[140px] ${
              temAtraso ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-[11px] font-semibold uppercase tracking-wider block text-slate-500">
                Situação Financeira
              </span>
              <span className={`text-sm font-bold flex items-center gap-1 mt-0.5 ${
                temAtraso ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {temAtraso ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Em Atraso</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Em Dia</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de Alergia Crítico */}
        {paciente.anamnese?.alergias && paciente.anamnese.alergias.toLowerCase() !== 'nenhuma' && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs font-semibold">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="uppercase tracking-wider font-extrabold text-[10px] bg-rose-200/80 px-1.5 py-0.5 rounded mr-2">Atenção Médica: Alergia Detectada</span>
              <span>{paciente.anamnese.alergias}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('odontograma')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'odontograma'
              ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <span>🦷 Odontograma</span>
        </button>

        <button
          onClick={() => setActiveTab('anamnese')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'anamnese'
              ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Ficha de Anamnese</span>
        </button>

        <button
          onClick={() => setActiveTab('evolucoes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'evolucoes'
              ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evolução Clínica ({(paciente.evolucoes || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fotos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'fotos'
              ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Fotos & Exames ({(paciente.fotos || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financeiro')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'financeiro'
              ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financeiro do Paciente</span>
          {temAtraso && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'agendamentos'
              ? 'border-sky-600 text-sky-600 bg-white shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Consultas ({(paciente.agendamentos || []).length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="printable-area">
        {/* TAB 1: ODONTOGRAMA */}
        {activeTab === 'odontograma' && (
          <div className="space-y-4">
            <Odontograma
              odontograma={paciente.odontograma || {}}
              onUpdateTooth={handleUpdateTooth}
            />

            {/* Resumo dos dentes alterados */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Histórico & Procedimentos Registrados por Dente
              </h4>
              {Object.keys(paciente.odontograma || {}).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Nenhum dente com anotação ou alteração clínica cadastrada ainda. Clique em um dente acima para registrar.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(paciente.odontograma || {}).map(([dente, info]) => (
                    <div key={dente} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                          Dente {dente}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 capitalize">
                          {info.status}
                        </span>
                      </div>
                      {info.nota && (
                        <p className="text-xs text-slate-600 mt-1">{info.nota}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ANAMNESE */}
        {activeTab === 'anamnese' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Ficha de Anamnese e Saúde Geral</h3>
                <p className="text-xs text-slate-500">Histórico patológico, hábitos e restrições clínicas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alergias */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Alergias a Medicamentos
                </span>
                <p className="text-sm font-semibold text-slate-800">
                  {paciente.anamnese?.alergias || 'Nenhuma informada'}
                </p>
              </div>

              {/* Medicamentos em Uso */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Medicamentos de Uso Contínuo
                </span>
                <p className="text-sm text-slate-800">
                  {paciente.anamnese?.medicacoesEmUso || 'Nenhum medicamento informado'}
                </p>
              </div>

              {/* Indicadores Sistêmicos */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                  Condições de Saúde & Fatores de Risco
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${paciente.anamnese?.hipertenso ? 'bg-rose-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-medium text-slate-700">
                      Hipertensão: <strong>{paciente.anamnese?.hipertenso ? 'Sim' : 'Não'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${paciente.anamnese?.diabetico ? 'bg-rose-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-medium text-slate-700">
                      Diabetes: <strong>{paciente.anamnese?.diabetico ? 'Sim' : 'Não'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${paciente.anamnese?.fumante ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-medium text-slate-700">
                      Fumante: <strong>{paciente.anamnese?.fumante ? 'Sim' : 'Não'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${paciente.anamnese?.sangramentoGengival ? 'bg-rose-500' : 'bg-slate-300'}`} />
                    <span className="text-xs font-medium text-slate-700">
                      Sangramento: <strong>{paciente.anamnese?.sangramentoGengival ? 'Sim' : 'Não'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Doenças Sistêmicas & Observações */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 md:col-span-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Observações Médicas & Queixa Principal
                </span>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {paciente.anamnese?.observacoesMedicas || 'Sem observações adicionais.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVOLUÇÕES CLÍNICAS */}
        {activeTab === 'evolucoes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Histórico de Evolução Clínica</h3>
                <p className="text-xs text-slate-500">Registro cronológico dos procedimentos realizados</p>
              </div>
              <button
                onClick={() => setIsNovaEvolucaoOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Evolução Clínica</span>
              </button>
            </div>

            {(!paciente.evolucoes || paciente.evolucoes.length === 0) ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Nenhuma evolução registrada</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Clique no botão acima para registrar o primeiro atendimento deste paciente.
                </p>
                <button
                  onClick={() => setIsNovaEvolucaoOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200"
                >
                  Registrar Atendimento Agora
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paciente.evolucoes.map((evo) => (
                  <div key={evo.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                          {evo.dente || 'Geral'}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{evo.procedimento}</h4>
                          <span className="text-xs text-slate-500">
                            {formatDateBR(evo.data)} {evo.hora ? `às ${evo.hora}` : ''} • Por {evo.profissional || 'Dr. Nael'}
                          </span>
                        </div>
                      </div>

                      {evo.valor > 0 && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {formatCurrency(evo.valor)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed pl-1">
                      {evo.descricao}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: FOTOS & EXAMES CLÍNICOS */}
        {activeTab === 'fotos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-sky-600" />
                  <span>Galeria de Fotos Clínicas & Exames</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Fotos intraorais, antes e depois, raio-x e registros estéticos de <strong>{paciente.nome}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsTirarFotoOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center"
              >
                <Camera className="w-4 h-4" />
                <span>Tirar Foto / Adicionar</span>
              </button>
            </div>

            {/* Filter Pills */}
            {(paciente.fotos || []).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                {[
                  { id: 'todas', label: 'Todas as Fotos' },
                  { id: 'Intraoral', label: '🦷 Intraoral' },
                  { id: 'AntesDepois', label: '⚖️ Antes & Depois' },
                  { id: 'Radiografia', label: '🩻 Radiografias' },
                  { id: 'PerfilFace', label: '👤 Face / Perfil' },
                  { id: 'Documento', label: '📄 Exames' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFiltroCategoriaFoto(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filtroCategoriaFoto === cat.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Photos Grid */}
            {(!paciente.fotos || paciente.fotos.length === 0) ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Nenhuma foto registrada</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Tire fotos do sorriso, dentes, restaurações ou envie exames e radiografias para acompanhar a evolução clínica do paciente.
                </p>
                <button
                  onClick={() => setIsTirarFotoOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tirar Primeira Foto do Paciente</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(paciente.fotos || [])
                  .filter(f => filtroCategoriaFoto === 'todas' || f.categoria === filtroCategoriaFoto)
                  .map((foto) => (
                    <div 
                      key={foto.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col group"
                    >
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setSelectedFotoLightbox(foto)}>
                        <img
                          src={foto.imagem}
                          alt={foto.titulo || 'Foto do Paciente'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Category Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
                            {foto.categoria === 'Intraoral' ? '🦷 Intraoral' :
                             foto.categoria === 'AntesDepois' ? '⚖️ Antes & Depois' :
                             foto.categoria === 'Radiografia' ? '🩻 Radiografia' :
                             foto.categoria === 'PerfilFace' ? '👤 Face' : '📄 Exame'}
                          </span>
                        </div>

                        {/* Hover Overlay Buttons */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedFotoLightbox(foto); }}
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110"
                            title="Visualizar em Tela Cheia"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <a
                            href={foto.imagem}
                            download={`foto-${paciente.nome.replace(/\s+/g, '_')}-${foto.data}.jpg`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110"
                            title="Baixar Foto"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteFoto(foto.id); }}
                            className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-transform hover:scale-110"
                            title="Excluir Foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 
                            onClick={() => setSelectedFotoLightbox(foto)}
                            className="text-xs font-bold text-slate-900 hover:text-sky-600 cursor-pointer line-clamp-1"
                          >
                            {foto.titulo || 'Foto Clínica'}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {formatDateBR(foto.data)} {foto.hora ? `às ${foto.hora}` : ''}
                          </span>
                        </div>

                        {foto.notas && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 pt-2 border-t border-slate-100">
                            {foto.notas}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FINANCEIRO DO PACIENTE */}
        {activeTab === 'financeiro' && (
          <div className="space-y-4">
            {/* Header com Totais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Pago</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                  {formatCurrency(
                    pagamentos
                      .filter(p => p.status === 'pago')
                      .reduce((sum, p) => sum + Number(p.valor || 0), 0)
                  )}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">A Vencer / Pendente</span>
                <span className="text-xl font-extrabold text-amber-600 mt-1 block">
                  {formatCurrency(totalPendente)}
                </span>
              </div>

              <div className={`p-4 rounded-2xl border shadow-sm ${
                temAtraso ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'
              }`}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                  {temAtraso && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                  <span>Total em Atraso</span>
                </span>
                <span className={`text-xl font-extrabold mt-1 block ${
                  temAtraso ? 'text-rose-600' : 'text-slate-700'
                }`}>
                  {formatCurrency(totalAtrasado)}
                </span>
              </div>
            </div>

            {/* Tabela de Lançamentos */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Extrato Financeiro do Paciente</h3>
                <span className="text-xs text-slate-500">{pagamentos.length} lançamento(s)</span>
              </div>

              {pagamentos.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Nenhum registro financeiro encontrado para este paciente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-3">Descrição / Procedimento</th>
                        <th className="px-6 py-3">Valor</th>
                        <th className="px-6 py-3">Vencimento</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Pagamento</th>
                        <th className="px-6 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {pagamentos.map((pag) => (
                        <tr key={pag.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-3.5">
                            <span className="font-semibold text-slate-900 block">{pag.descricao}</span>
                            {pag.observacoes && (
                              <span className="text-[11px] text-slate-400 block">{pag.observacoes}</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-800">
                            {formatCurrency(pag.valor)}
                          </td>
                          <td className="px-6 py-3.5 text-slate-600">
                            {formatDateBR(pag.dataVencimento)}
                          </td>
                          <td className="px-6 py-3.5">
                            {pag.status === 'pago' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Pago</span>
                              </span>
                            ) : pag.status === 'atrasado' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Atrasado ({pag.diasAtraso}d)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                <span>Pendente</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-slate-600">
                            {pag.dataPagamento ? (
                              <span>
                                {formatDateBR(pag.dataPagamento)} <span className="uppercase text-[10px] text-slate-400">({pag.formaPagamento})</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            {pag.status !== 'pago' && (
                              <button
                                onClick={() => setPagamentoParaBaixa(pag)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                              >
                                Receber / Dar Baixa
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AGENDAMENTOS DO PACIENTE */}
        {activeTab === 'agendamentos' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Consultas Agendadas e Realizadas</h3>
                <p className="text-xs text-slate-500">Histórico de visitas deste paciente à clínica</p>
              </div>
              <button
                onClick={() => onOpenNovoAgendamento && onOpenNovoAgendamento(paciente.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Marcar Próxima Consulta</span>
              </button>
            </div>

            {(!paciente.agendamentos || paciente.agendamentos.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-4">Nenhum agendamento encontrado.</p>
            ) : (
              <div className="space-y-3">
                {paciente.agendamentos.map((ag) => (
                  <div key={ag.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex flex-col items-center justify-center font-bold text-xs">
                        <span>{ag.data.slice(8, 10)}</span>
                        <span className="text-[9px] uppercase">{ag.data.slice(5, 7)}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ag.procedimento}</h4>
                        <span className="text-xs text-slate-500">
                          {formatDateBR(ag.data)} às {ag.horaInicio} - {ag.horaFim} • {ag.dentista}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ag.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                        ag.status === 'confirmado' ? 'bg-sky-100 text-sky-800' :
                        ag.status === 'cancelado' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ag.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Nova Evolução */}
      {isNovaEvolucaoOpen && (
        <ModalNovaEvolucao
          isOpen={isNovaEvolucaoOpen}
          onClose={() => setIsNovaEvolucaoOpen(false)}
          paciente={paciente}
          onCreated={handleCreatedEvolucao}
        />
      )}

      {/* Modal Baixa de Pagamento */}
      {pagamentoParaBaixa && (
        <ModalBaixaPagamento
          isOpen={Boolean(pagamentoParaBaixa)}
          onClose={() => setPagamentoParaBaixa(null)}
          pagamento={pagamentoParaBaixa}
          onConfirmed={handleBaixaConfirmed}
        />
      )}

      {/* Modal Tirar Foto / Upload */}
      {isTirarFotoOpen && (
        <ModalTirarFoto
          isOpen={isTirarFotoOpen}
          onClose={() => setIsTirarFotoOpen(false)}
          paciente={paciente}
          onPhotoSaved={handlePhotoSaved}
        />
      )}

      {/* Lightbox / Visualizador de Foto em Tela Cheia */}
      {selectedFotoLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedFotoLightbox(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white">
              <div>
                <h3 className="text-base font-bold text-white">{selectedFotoLightbox.titulo || 'Foto Clínica'}</h3>
                <span className="text-xs text-slate-400">
                  {formatDateBR(selectedFotoLightbox.data)} {selectedFotoLightbox.hora ? `às ${selectedFotoLightbox.hora}` : ''} • {selectedFotoLightbox.categoria}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedFotoLightbox.imagem}
                  download={`foto-${paciente.nome.replace(/\s+/g, '_')}-${selectedFotoLightbox.data}.jpg`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Foto</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDeleteFoto(selectedFotoLightbox.id)}
                  className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                  title="Excluir Foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFotoLightbox(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-4">
              <img
                src={selectedFotoLightbox.imagem}
                alt={selectedFotoLightbox.titulo || 'Foto Clínica'}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Bottom Details */}
            {selectedFotoLightbox.notas && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Anotações Clínicas:</span>
                <p>{selectedFotoLightbox.notas}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
