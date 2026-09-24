import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CheckCircle2, AlertTriangle, Clock, Plus, 
  Search, Filter, Printer, MessageSquare, CreditCard, ArrowDownRight, Calendar
} from 'lucide-react';
import { formatCurrency, formatDateBR, getTodayDateString, getWhatsAppLink } from '../utils/formatters';
import { api } from '../services/api';
import ModalBaixaPagamento from './ModalBaixaPagamento';

export default function FinanceiroView({ 
  onSelectPaciente, 
  onOpenNovoPagamento 
}) {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState(''); // '' | 'atrasado' | 'pendente' | 'pago'
  const [busca, setBusca] = useState('');
  const [pagamentoParaBaixa, setPagamentoParaBaixa] = useState(null);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (filtroStatus) filtros.status = filtroStatus;
      const data = await api.getPagamentos(filtros);
      setPagamentos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, [filtroStatus]);

  const handleBaixaConfirmed = async (pagamentoId, dados) => {
    try {
      await api.marcarComoPago(pagamentoId, dados);
      await fetchPagamentos();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered by text
  const pagamentosFiltrados = pagamentos.filter(p => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase().trim();
    return (
      p.pacienteNome.toLowerCase().includes(q) ||
      p.descricao.toLowerCase().includes(q)
    );
  });

  // Calculate totals from complete list
  const totalPago = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);

  const totalAtrasado = pagamentos
    .filter(p => p.status === 'atrasado')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);

  const totalPendente = pagamentos
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + Number(p.valor || 0), 0);

  const countAtrasados = pagamentos.filter(p => p.status === 'atrasado').length;
  const countPendentes = pagamentos.filter(p => p.status === 'pendente').length;
  const countPagos = pagamentos.filter(p => p.status === 'pago').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Gestão Financeira & Cobranças</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de pagamentos: acompanhe o que foi recebido, o que está a vencer e faturas atrasadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
          <button
            onClick={onOpenNovoPagamento}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Recebido (Pago) */}
        <div 
          onClick={() => setFiltroStatus('pago')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filtroStatus === 'pago'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pago / Recebido
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatCurrency(totalPago)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {countPagos} pagamento(s) liquidado(s)
          </div>
        </div>

        {/* Pendente */}
        <div 
          onClick={() => setFiltroStatus('pendente')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filtroStatus === 'pendente'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              A Receber (No Prazo)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {formatCurrency(totalPendente)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {countPendentes} cobrança(s) pendente(s)
          </div>
        </div>

        {/* EM ATRASO */}
        <div 
          onClick={() => setFiltroStatus('atrasado')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            filtroStatus === 'atrasado'
              ? 'bg-rose-100/90 border-rose-500 ring-2 ring-rose-400'
              : totalAtrasado > 0
                ? 'bg-rose-50 border-rose-300 hover:bg-rose-100/70'
                : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              {totalAtrasado > 0 && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
              <span>Débitos em Atraso</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {formatCurrency(totalAtrasado)}
          </div>
          <div className="text-xs font-bold text-rose-700 mt-1">
            ⚠️ {countAtrasados} fatura(s) vencida(s)
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setFiltroStatus('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroStatus === ''
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({pagamentos.length})
            </button>
            <button
              onClick={() => setFiltroStatus('atrasado')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroStatus === 'atrasado'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Atrasados ({countAtrasados})</span>
            </button>
            <button
              onClick={() => setFiltroStatus('pendente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroStatus === 'pendente'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pendentes ({countPendentes})</span>
            </button>
            <button
              onClick={() => setFiltroStatus('pago')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filtroStatus === 'pago'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Pagos ({countPagos})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por paciente ou descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden printable-area">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : pagamentosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Procedimento / Tratamento</th>
                  <th className="px-6 py-3.5">Valor</th>
                  <th className="px-6 py-3.5">Vencimento</th>
                  <th className="px-6 py-3.5">Situação</th>
                  <th className="px-6 py-3.5">Forma / Pagamento</th>
                  <th className="px-6 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pagamentosFiltrados.map((pag) => {
                  return (
                    <tr 
                      key={pag.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        pag.status === 'atrasado' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Paciente */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onSelectPaciente(pag.pacienteId)}
                          className="font-bold text-slate-900 hover:text-sky-600 transition-colors text-left block"
                        >
                          {pag.pacienteNome}
                        </button>
                        <span className="text-[11px] text-slate-400">
                          Código: {pag.pacienteId}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block">{pag.descricao}</span>
                        {pag.observacoes && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">{pag.observacoes}</span>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="px-6 py-4 font-black text-sm text-slate-900">
                        {formatCurrency(pag.valor)}
                      </td>

                      {/* Vencimento */}
                      <td className="px-6 py-4 text-slate-700">
                        {formatDateBR(pag.dataVencimento)}
                      </td>

                      {/* Situação / Status */}
                      <td className="px-6 py-4">
                        {pag.status === 'pago' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PAGO</span>
                          </span>
                        ) : pag.status === 'atrasado' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>ATRASADO ({pag.diasAtraso}d)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>PENDENTE</span>
                          </span>
                        )}
                      </td>

                      {/* Pagamento Detalhes */}
                      <td className="px-6 py-4 text-slate-600">
                        {pag.status === 'pago' ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {formatDateBR(pag.dataPagamento)}
                            </span>
                            <span className="uppercase text-[10px] font-bold text-slate-400 block">
                              {pag.formaPagamento}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Aguardando</span>
                        )}
                      </td>

                      {/* Ação */}
                      <td className="px-6 py-4 text-right">
                        {pag.status !== 'pago' ? (
                          <button
                            onClick={() => setPagamentoParaBaixa(pag)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            Dar Baixa / Receber
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">Liquidado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Baixa */}
      {pagamentoParaBaixa && (
        <ModalBaixaPagamento
          isOpen={Boolean(pagamentoParaBaixa)}
          onClose={() => setPagamentoParaBaixa(null)}
          pagamento={pagamentoParaBaixa}
          onConfirmed={handleBaixaConfirmed}
        />
      )}
    </div>
  );
}
