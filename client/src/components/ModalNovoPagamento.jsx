import React, { useState } from 'react';
import { X, DollarSign, User, Calendar, Check, CreditCard } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

export default function ModalNovoPagamento({ isOpen, onClose, pacientes = [], onCreated, defaultPacienteId = '' }) {
  const [formData, setFormData] = useState({
    pacienteId: defaultPacienteId || (pacientes[0]?.id || ''),
    descricao: '',
    valor: '',
    dataVencimento: getTodayDateString(),
    status: 'pendente', // 'pendente' | 'pago'
    dataPagamento: getTodayDateString(),
    formaPagamento: 'pix',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pacienteId) {
      setError('Por favor, selecione o paciente.');
      return;
    }
    if (!formData.descricao.trim()) {
      setError('Por favor, informe a descrição do procedimento ou cobrança.');
      return;
    }
    if (!formData.valor || Number(formData.valor) <= 0) {
      setError('Por favor, informe um valor válido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreated({
        ...formData,
        valor: Number(formData.valor)
      });
      onClose();
    } catch (err) {
      setError('Erro ao salvar cobrança. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Novo Lançamento Financeiro</h3>
              <p className="text-xs text-slate-500">Registre um procedimento, tratamento ou parcela</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Paciente */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>Paciente *</span>
            </label>
            <select
              required
              value={formData.pacienteId}
              onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">Selecione um paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.telefone ? `• ${p.telefone}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição do Procedimento / Tratamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Restauração Resina Dente 16, Parcela 1/3 Tratamento de Canal"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Valor & Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valor (R$) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="350.00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Data de Vencimento *</span>
              </label>
              <input
                type="date"
                required
                value={formData.dataVencimento}
                onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Status Inicial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Situação do Pagamento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pendente' })}
                className={`p-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  formData.status === 'pendente'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                <span>🟡 A Receber (Pendente)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pago' })}
                className={`p-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  formData.status === 'pago'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                <span>🟢 Já foi Pago</span>
              </button>
            </div>
          </div>

          {/* Campos se Já Pago */}
          {formData.status === 'pago' && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Pagamento
                  </label>
                  <input
                    type="date"
                    value={formData.dataPagamento}
                    onChange={(e) => setFormData({ ...formData, dataPagamento: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formData.formaPagamento}
                    onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="pix">Pix</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro em Espécie</option>
                    <option value="boleto">Boleto Bancário</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações
            </label>
            <input
              type="text"
              placeholder="Ex: Parcela referente ao clareamento, pago no balcão..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Lançar no Financeiro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
