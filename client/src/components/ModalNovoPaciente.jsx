import React, { useState } from 'react';
import { X, User, Phone, FileText, HeartPulse, ShieldAlert, Check } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

export default function ModalNovoPaciente({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    endereco: '',
    convenio: 'Particular',
    anamnese: {
      alergias: '',
      doencasSistemicas: '',
      medicacoesEmUso: '',
      fumante: false,
      sangramentoGengival: false,
      hipertenso: false,
      diabetico: false,
      observacoesMedicas: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError('Por favor, informe o nome do paciente.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await onCreated(formData);
      onClose();
    } catch (err) {
      setError('Erro ao salvar paciente. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Novo Paciente</h3>
              <p className="text-xs text-slate-500">Cadastre os dados pessoais e anamnese inicial</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Dados Pessoais */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Dados Cadastrais</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Costa ou João Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Convênio
                </label>
                <select
                  value={formData.convenio}
                  onChange={(e) => setFormData({ ...formData, convenio: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Particular">Particular</option>
                  <option value="Unimed Odonto">Unimed Odonto</option>
                  <option value="Amil Dental">Amil Dental</option>
                  <option value="Bradesco Dental">Bradesco Dental</option>
                  <option value="SulAmérica Odonto">SulAmérica Odonto</option>
                  <option value="MetLife">MetLife</option>
                  <option value="Outro">Outro Convênio</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="paciente@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro, cidade"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Anamnese Médica */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Anamnese & Histórico de Saúde</span>
            </h4>

            <div className="space-y-4">
              {/* Alergias com destaque */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Alergias a Medicamentos / Substâncias</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Penicilina, Dipirona, Látex, Anestésicos (ou 'Nenhuma')"
                  value={formData.anamnese.alergias}
                  onChange={(e) => setFormData({
                    ...formData,
                    anamnese: { ...formData.anamnese, alergias: e.target.value }
                  })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              {/* Condições de Risco */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.anamnese.hipertenso}
                    onChange={(e) => setFormData({
                      ...formData,
                      anamnese: { ...formData.anamnese, hipertenso: e.target.checked }
                    })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Hipertenso</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.anamnese.diabetico}
                    onChange={(e) => setFormData({
                      ...formData,
                      anamnese: { ...formData.anamnese, diabetico: e.target.checked }
                    })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Diabético</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.anamnese.fumante}
                    onChange={(e) => setFormData({
                      ...formData,
                      anamnese: { ...formData.anamnese, fumante: e.target.checked }
                    })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Fumante</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.anamnese.sangramentoGengival}
                    onChange={(e) => setFormData({
                      ...formData,
                      anamnese: { ...formData.anamnese, sangramentoGengival: e.target.checked }
                    })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Sangramento</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicamentos de Uso Contínuo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Losartana 50mg, Levotiroxina, Insulina..."
                  value={formData.anamnese.medicacoesEmUso}
                  onChange={(e) => setFormData({
                    ...formData,
                    anamnese: { ...formData.anamnese, medicacoesEmUso: e.target.value }
                  })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Médicas e Queixa Principal
                </label>
                <textarea
                  rows={2}
                  placeholder="Motivo da consulta, sensibilidade, histórico de cirurgias..."
                  value={formData.anamnese.observacoesMedicas}
                  onChange={(e) => setFormData({
                    ...formData,
                    anamnese: { ...formData.anamnese, observacoesMedicas: e.target.value }
                  })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              <span>{loading ? 'Salvando...' : 'Cadastrar Paciente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
