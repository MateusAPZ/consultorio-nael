import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, DollarSign, LayoutDashboard, 
  Plus, AlertTriangle, ShieldCheck, HeartPulse, Sparkles,
  Menu, X, CheckCircle2, ChevronRight, Phone, LogOut
} from 'lucide-react';
import LoginPage from './components/LoginPage';
import DashboardView from './components/DashboardView';
import AgendaView from './components/AgendaView';
import PacientesView from './components/PacientesView';
import ProntuarioView from './components/ProntuarioView';
import FinanceiroView from './components/FinanceiroView';
import ModalNovoPaciente from './components/ModalNovoPaciente';
import ModalNovoAgendamento from './components/ModalNovoAgendamento';
import ModalNovoPagamento from './components/ModalNovoPagamento';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('drnael_auth_user');
      const savedToken = localStorage.getItem('drnael_auth_token');
      return savedUser && savedToken ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  const [stats, setStats] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modais
  const [isNovoPacienteOpen, setIsNovoPacienteOpen] = useState(false);
  const [isNovoAgendamentoOpen, setIsNovoAgendamentoOpen] = useState(false);
  const [isNovoPagamentoOpen, setIsNovoPagamentoOpen] = useState(false);
  const [defaultPacienteId, setDefaultPacienteId] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('drnael_auth_token');
    localStorage.removeItem('drnael_auth_user');
    setUser(null);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [dashData, pacList] = await Promise.all([
        api.getDashboard(),
        api.getPacientes()
      ]);
      setStats(dashData);
      setPacientes(pacList);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  if (!user) {
    return <LoginPage onLoginSuccess={(loggedUser) => setUser(loggedUser)} />;
  }

  const handleSelectPaciente = (pacienteId) => {
    setSelectedPacienteId(pacienteId);
    setCurrentView('prontuario');
  };

  const handleOpenAgendamento = (pacienteId = '') => {
    setDefaultPacienteId(pacienteId);
    setIsNovoAgendamentoOpen(true);
  };

  const handleOpenPagamento = (pacienteId = '') => {
    setDefaultPacienteId(pacienteId);
    setIsNovoPagamentoOpen(true);
  };

  const handleCreatedPaciente = async (data) => {
    const novo = await api.createPaciente(data);
    await loadInitialData();
    handleSelectPaciente(novo.id);
  };

  const handleCreatedAgendamento = async (data) => {
    await api.createAgendamento(data);
    await loadInitialData();
  };

  const handleCreatedPagamento = async (data) => {
    await api.createPagamento(data);
    await loadInitialData();
  };

  const handleDeletePaciente = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o paciente "${nome}"?\n\nEsta ação removerá todos os dados do prontuário, consultas e histórico financeiro associados.`)) {
      return;
    }
    try {
      await api.deletePaciente(id);
      await loadInitialData();
      if (selectedPacienteId === id) {
        setSelectedPacienteId(null);
        setCurrentView('pacientes');
      }
    } catch (err) {
      alert('Erro ao excluir paciente: ' + (err.message || 'Erro inesperado'));
    }
  };

  const totalAtrasadosCount = stats?.quantidadeAtrasados || 0;
  const agendamentosHojeCount = stats?.agendamentosHojeTotal || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 1.5 8 2.5 11.5.5 1.5 1.5 2.5 3 2.5 1 0 1.5-.5 2-1 .5.5 1 1 2 1 1.5 0 2.5-1 3-2.5C19.5 16 21 11.5 21 8c0-3.5-2.5-6-6-6h-3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
                  Dr. Nael
                </h1>
                <p className="text-[11px] font-medium text-sky-400">
                  Odontologia Especializada
                </p>
              </div>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Painel Geral</span>
              </div>
            </button>

            <button
              onClick={() => { setCurrentView('agenda'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'agenda'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>Agenda de Consultas</span>
              </div>
              {agendamentosHojeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/30 text-sky-300">
                  {agendamentosHojeCount} hoje
                </span>
              )}
            </button>

            <button
              onClick={() => { setCurrentView('pacientes'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'pacientes' || currentView === 'prontuario'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Pacientes & Prontuários</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {pacientes.length}
              </span>
            </button>

            <button
              onClick={() => { setCurrentView('financeiro'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentView === 'financeiro'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4" />
                <span>Financeiro / Pagamentos</span>
              </div>
              {totalAtrasadosCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                  {totalAtrasadosCount} atrasados
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User / Clinic info & Backup at bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-bold text-xs">
                DN
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-200">Dr. Nael Santos</p>
                <p className="text-[10px] text-slate-500">CRO-SP 104.921</p>
              </div>
            </div>

            {stats?.cloudStatus && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60" title="Banco de dados ativo">
                {stats.cloudStatus}
              </span>
            )}
          </div>

          <a
            href="/api/backup"
            download
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-colors"
            title="Baixar cópia de segurança de todos os dados"
          >
            <span>💾 Fazer Backup (Download)</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-900/40 transition-colors cursor-pointer"
            title="Encerrar sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-lg text-slate-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-sm">Dr. Nael Odontologia</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNovoAgendamentoOpen(true)}
              className="p-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold"
            >
              + Consulta
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              title="Sair do Sistema"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-600">Carregando sistema clínico...</p>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  onNavigate={setCurrentView}
                  onSelectPaciente={handleSelectPaciente}
                  onOpenNovoPaciente={() => setIsNovoPacienteOpen(true)}
                  onOpenNovoAgendamento={() => handleOpenAgendamento()}
                  onOpenNovoPagamento={() => handleOpenPagamento()}
                />
              )}

              {currentView === 'agenda' && (
                <AgendaView
                  onSelectPaciente={handleSelectPaciente}
                  onOpenNovoAgendamento={() => handleOpenAgendamento()}
                />
              )}

              {currentView === 'pacientes' && (
                <PacientesView
                  pacientes={pacientes}
                  onSelectPaciente={handleSelectPaciente}
                  onOpenNovoPaciente={() => setIsNovoPacienteOpen(true)}
                  onOpenNovoAgendamento={handleOpenAgendamento}
                  onDeletePaciente={handleDeletePaciente}
                />
              )}

              {currentView === 'prontuario' && (
                <ProntuarioView
                  pacienteId={selectedPacienteId}
                  onBack={() => setCurrentView('pacientes')}
                  onOpenNovoAgendamento={handleOpenAgendamento}
                  onDeletePaciente={handleDeletePaciente}
                />
              )}

              {currentView === 'financeiro' && (
                <FinanceiroView
                  onSelectPaciente={handleSelectPaciente}
                  onOpenNovoPagamento={() => handleOpenPagamento()}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modais Globais */}
      {isNovoPacienteOpen && (
        <ModalNovoPaciente
          isOpen={isNovoPacienteOpen}
          onClose={() => setIsNovoPacienteOpen(false)}
          onCreated={handleCreatedPaciente}
        />
      )}

      {isNovoAgendamentoOpen && (
        <ModalNovoAgendamento
          isOpen={isNovoAgendamentoOpen}
          onClose={() => setIsNovoAgendamentoOpen(false)}
          pacientes={pacientes}
          defaultPacienteId={defaultPacienteId}
          onCreated={handleCreatedAgendamento}
        />
      )}

      {isNovoPagamentoOpen && (
        <ModalNovoPagamento
          isOpen={isNovoPagamentoOpen}
          onClose={() => setIsNovoPagamentoOpen(false)}
          pacientes={pacientes}
          defaultPacienteId={defaultPacienteId}
          onCreated={handleCreatedPagamento}
        />
      )}
    </div>
  );
}
