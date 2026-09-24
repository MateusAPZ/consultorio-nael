import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency, getTodayDateString } from '../utils/formatters';

export default function ModalBaixaPagamento({ isOpen, onClose, pagamento, onConfirmed }) {
  const [dataPagamento, setDataPagamento] = useState(getTodayDateString());
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !pagamento) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirmed(pagamento.id, {
        dataPagamento,
        formaPagamento,
        observacoes: observacoes.trim() || pagamento.observacoes || 'Pagamento recebido na recepção.'
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dar Baixa no Pagamento</h3>
              <p className="text-xs text-emerald-700">Confirmar recebimento do valor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Card Resumo do Pagamento */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs text-slate-500 font-medium">Paciente</div>
            <div className="text-sm font-bold text-slate-900">{pagamento.pacienteNome}</div>
            
            <div className="text-xs text-slate-500 font-medium pt-1">Descrição</div>
            <div className="text-xs font-semibold text-slate-700">{pagamento.descricao}</div>

            <div className="pt-2 flex items-baseline justify-between border-t border-slate-200">
              <span className="text-xs text-slate-600 font-semibold">Valor a Receber:</span>
              <span className="text-xl font-extrabold text-emerald-600">
                {formatCurrency(pagamento.valor)}
              </span>
            </div>

            {pagamento.status === 'atrasado' && (
              <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-1.5">
                <span>⚠️ Este pagamento está em atraso há {pagamento.diasAtraso} dias.</span>
              </div>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Forma de Pagamento *</span>
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="pix">⚡ Pix (Instantâneo)</option>
              <option value="cartao_debito">💳 Cartão de Débito</option>
              <option value="cartao_credito">💳 Cartão de Crédito</option>
              <option value="dinheiro">💵 Dinheiro em Espécie</option>
              <option value="boleto">📄 Boleto Compensado</option>
            </select>
          </div>

          {/* Data do Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Data do Recebimento</span>
            </label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Recebido comprovante no WhatsApp..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Confirmando...' : 'Confirmar Recebimento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
