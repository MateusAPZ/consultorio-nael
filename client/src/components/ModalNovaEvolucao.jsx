import React, { useState } from 'react';
import { X, FileText, Sparkles, DollarSign, Calendar, Check } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

export default function ModalNovaEvolucao({ isOpen, onClose, paciente, onCreated }) {
  const [formData, setFormData] = useState({
    data: getTodayDateString(),
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    dente: '',
    procedimento: '',
    descricao: '',
    profissional: 'Dr. Nael Santos',
    valor: '',
    gerarCobranca: false,
    jaPago: true,
    formaPagamento: 'pix'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !paciente) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.procedimento.trim()) {
      setError('Por favor, informe o procedimento realizado.');
      return;
    }
    if (!formData.descricao.trim()) {
      setError('Por favor, descreva os detalhes clínicos do atendimento.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onCreated({
        ...formData,
        valor: Number(formData.valor) || 0
      });
      onClose();
    } catch (err) {
      setError('Erro ao salvar evolução clínica. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nova Evolução Clínica</h3>
              <p className="text-xs text-slate-500">Prontuário de: <strong className="text-slate-800">{paciente.nome}</strong></p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data do Atendimento *
              </label>
              <input
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horário
              </label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dente / Região
              </label>
              <input
                type="text"
                placeholder="Ex: 16, 21 ou Geral"
                value={formData.dente}
                onChange={(e) => setFormData({ ...formData, dente: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procedimento Realizado *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Restauração Resina Oclusal, Remoção de Sutura, Profilaxia..."
              value={formData.procedimento}
              onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Clínica Detalhada *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Descreva a técnica aplicada, anestésico utilizado, materiais restauradores, intercorrências ou orientações pós-operatórias passadas ao paciente..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dentista Responsável
              </label>
              <input
                type="text"
                value={formData.profissional}
                onChange={(e) => setFormData({ ...formData, profissional: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor do Procedimento (R$)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Gerar Cobrança */}
          {Number(formData.valor) > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gerarCobranca}
                  onChange={(e) => setFormData({ ...formData, gerarCobranca: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Registrar este valor automaticamente no Financeiro
                </span>
              </label>

              {formData.gerarCobranca && (
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="statusCob"
                      checked={formData.jaPago}
                      onChange={() => setFormData({ ...formData, jaPago: true })}
                      className="text-emerald-600"
                    />
                    <span>Já foi pago hoje</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="statusCob"
                      checked={!formData.jaPago}
                      onChange={() => setFormData({ ...formData, jaPago: false })}
                      className="text-amber-600"
                    />
                    <span>Ficar pendente a pagar</span>
                  </label>
                </div>
              )}
            </div>
          )}

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
              className="px-6 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Evolução'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
