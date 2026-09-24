import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, User, Check, Sparkles } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

const PROCEDIMENTOS_RAPIDOS = [
  'Consulta de Avaliação',
  'Limpeza / Profilaxia',
  'Restauração em Resina',
  'Tratamento de Canal',
  'Extração de Siso',
  'Manutenção Ortodôntica',
  'Clareamento Dental',
  'Prótese / Coroa',
  'Instalação de Implante'
];

export default function ModalNovoAgendamento({ isOpen, onClose, pacientes = [], onCreated, defaultPacienteId = '' }) {
  const [formData, setFormData] = useState({
    pacienteId: defaultPacienteId || (pacientes[0]?.id || ''),
    data: getTodayDateString(),
    horaInicio: '09:00',
    horaFim: '10:00',
    procedimento: 'Consulta de Avaliação',
    dentista: 'Dr. Nael Santos',
    status: 'agendado',
    valorEstimado: '',
    observacoes: '',
    gerarCobranca: true,
    jaPago: false,
    formaPagamento: 'pix'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pacienteId) {
      setError('Por favor, selecione um paciente.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await onCreated({
        ...formData,
        valorEstimado: Number(formData.valorEstimado) || 0
      });
      onClose();
    } catch (err) {
      setError('Erro ao salvar agendamento. Tente novamente.');
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
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Novo Agendamento</h3>
              <p className="text-xs text-slate-500">Marque uma nova consulta na agenda da clínica</p>
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

          {/* Data e Horários */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Data *</span>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Início *</span>
              </label>
              <input
                type="time"
                required
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>Término</span>
              </label>
              <input
                type="time"
                value={formData.horaFim}
                onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Procedimento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Procedimento / Tratamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Restauração em Resina"
              value={formData.procedimento}
              onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {/* Chips rápidos */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PROCEDIMENTOS_RAPIDOS.slice(0, 5).map((proc) => (
                <button
                  key={proc}
                  type="button"
                  onClick={() => setFormData({ ...formData, procedimento: proc })}
                  className="px-2 py-0.5 text-[11px] rounded-full bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 transition-colors"
                >
                  {proc}
                </button>
              ))}
            </div>
          </div>

          {/* Dentista & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dentista Responsável
              </label>
              <input
                type="text"
                value={formData.dentista}
                onChange={(e) => setFormData({ ...formData, dentista: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Inicial
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="agendado">📅 Agendado</option>
                <option value="confirmado">✅ Confirmado</option>
                <option value="em_atendimento">⏳ Em Atendimento</option>
                <option value="concluido">🎯 Concluído</option>
              </select>
            </div>
          </div>

          {/* Integração Financeira */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gerarCobranca}
                  onChange={(e) => setFormData({ ...formData, gerarCobranca: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Lançar cobrança no Financeiro
                </span>
              </label>
              <span className="text-[11px] text-slate-500">Controle automático</span>
            </div>

            {formData.gerarCobranca && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    <span>Valor da Consulta (R$)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={formData.valorEstimado}
                    onChange={(e) => setFormData({ ...formData, valorEstimado: e.target.value })}
                    className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Situação do Pagamento
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jaPago: false })}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        !formData.jaPago
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Pendente
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, jaPago: true })}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        formData.jaPago
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Já Pago
                    </button>
                  </div>
                </div>

                {formData.jaPago && (
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formData.formaPagamento}
                      onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="pix">Pix</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="dinheiro">Dinheiro</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Trazer radiografia, paciente tem preferência de horário..."
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
              className="px-6 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Agendando...' : 'Confirmar Agendamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
