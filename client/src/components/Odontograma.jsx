import React, { useState } from 'react';
import { Check, AlertCircle, Sparkles, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  higido: { label: 'Hígido (Saudável)', color: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-700', bgSoft: 'bg-emerald-50', icon: ShieldCheck },
  carie: { label: 'Cárie', color: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-700', bgSoft: 'bg-rose-50', icon: AlertTriangle },
  restaurado: { label: 'Restaurado', color: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-700', bgSoft: 'bg-sky-50', icon: Check },
  canal: { label: 'Canal (Endodontia)', color: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-700', bgSoft: 'bg-purple-50', icon: Sparkles },
  extracao: { label: 'Extraído / Ausente', color: 'bg-slate-400', border: 'border-slate-400', text: 'text-slate-600', bgSoft: 'bg-slate-100', icon: XCircle },
  implante: { label: 'Implante', color: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-700', bgSoft: 'bg-amber-50', icon: Sparkles },
  aparelho: { label: 'Ortodontia', color: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-700', bgSoft: 'bg-indigo-50', icon: Check }
};

export default function Odontograma({ odontograma = {}, onUpdateTooth, readOnly = false }) {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [newStatus, setNewStatus] = useState('higido');
  const [toothNote, setToothNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Teeth quadrants (FDI notation)
  const q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Maxilar Direito
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Maxilar Esquerdo
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Mandibular Direito
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Mandibular Esquerdo

  const handleSelectTooth = (toothNumber) => {
    if (readOnly) return;
    const current = odontograma[toothNumber] || { status: 'higido', nota: '' };
    setSelectedTooth(toothNumber);
    setNewStatus(current.status || 'higido');
    setToothNote(current.nota || '');
  };

  const handleSaveTooth = async () => {
    if (!selectedTooth || !onUpdateTooth) return;
    setSaving(true);
    try {
      await onUpdateTooth(selectedTooth, newStatus, toothNote);
      setSelectedTooth(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const renderTooth = (num, isUpper) => {
    const data = odontograma[num] || { status: 'higido' };
    const statusKey = data.status || 'higido';
    const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.higido;
    const isSelected = selectedTooth === num;

    return (
      <button
        key={num}
        type="button"
        onClick={() => handleSelectTooth(num)}
        title={`Dente ${num} - ${config.label}${data.nota ? ` (${data.nota})` : ''}`}
        className={`group relative flex flex-col items-center justify-between p-1.5 rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${isSelected ? 'ring-2 ring-sky-500 scale-105 border-sky-500 shadow-md bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:shadow-sm bg-white'}
        `}
        style={{ minWidth: '42px', minHeight: '68px' }}
      >
        {/* Number on top if Upper, bottom if Lower */}
        {isUpper && (
          <span className="text-[11px] font-bold text-slate-700 tracking-tighter">
            {num}
          </span>
        )}

        {/* Tooth SVG Icon */}
        <div className="relative my-0.5 flex items-center justify-center">
          <svg className="w-6 h-7 transition-transform group-hover:scale-110" viewBox="0 0 24 28" fill="none">
            {/* Tooth crown & roots representation */}
            <path
              d={isUpper 
                ? "M5 10 C3 4, 9 2, 12 2 C15 2, 21 4, 19 10 C18 15, 17 22, 15 26 C14 27, 13 25, 12 21 C11 25, 10 27, 9 26 C7 22, 6 15, 5 10 Z"
                : "M5 18 C3 24, 9 26, 12 26 C15 26, 21 24, 19 18 C18 13, 17 6, 15 2 C14 1, 13 3, 12 7 C11 3, 10 1, 9 2 C7 6, 6 13, 5 18 Z"
              }
              className={`transition-colors duration-150 ${
                statusKey === 'carie' ? 'fill-rose-500 stroke-rose-600' :
                statusKey === 'restaurado' ? 'fill-sky-500 stroke-sky-600' :
                statusKey === 'canal' ? 'fill-purple-500 stroke-purple-600' :
                statusKey === 'implante' ? 'fill-amber-400 stroke-amber-500' :
                statusKey === 'extracao' ? 'fill-slate-300 stroke-slate-400 opacity-60' :
                statusKey === 'aparelho' ? 'fill-indigo-400 stroke-indigo-500' :
                'fill-slate-100 stroke-slate-300'
              }`}
              strokeWidth="1.5"
            />
            {statusKey === 'extracao' && (
              <line x1="4" y1="4" x2="20" y2="24" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>

          {data.nota && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
        </div>

        {!isUpper && (
          <span className="text-[11px] font-bold text-slate-700 tracking-tighter">
            {num}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Odontograma Clínico Interativo</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">FDI Padrão (32 dentes)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Clique em qualquer dente para alterar o estado clínico ou adicionar anotações específicas.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, item]) => (
            <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dental Chart Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[650px] space-y-4">
          {/* Arcada Superior */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-1.5">
              Arcada Superior (Maxila)
            </div>
            <div className="flex items-center justify-center gap-6 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
              {/* Quadrante 1 (18-11) */}
              <div className="flex gap-1.5">
                {q1.map(n => renderTooth(n, true))}
              </div>
              <div className="w-0.5 h-14 bg-sky-200 rounded-full" />
              {/* Quadrante 2 (21-28) */}
              <div className="flex gap-1.5">
                {q2.map(n => renderTooth(n, true))}
              </div>
            </div>
          </div>

          {/* Arcada Inferior */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-1.5">
              Arcada Inferior (Mandíbula)
            </div>
            <div className="flex items-center justify-center gap-6 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
              {/* Quadrante 4 (48-41) */}
              <div className="flex gap-1.5">
                {q4.map(n => renderTooth(n, false))}
              </div>
              <div className="w-0.5 h-14 bg-sky-200 rounded-full" />
              {/* Quadrante 3 (31-38) */}
              <div className="flex gap-1.5">
                {q3.map(n => renderTooth(n, false))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Tooth Quick Edit Drawer/Box */}
      {selectedTooth && !readOnly && (
        <div className="mt-4 p-4 rounded-xl bg-sky-50/70 border border-sky-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {selectedTooth}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Editar Dente {selectedTooth}
                </h4>
                <p className="text-xs text-slate-500">Defina o status e anotações para este dente</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTooth(null)}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded hover:bg-slate-200/50"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Clínico
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(STATUS_CONFIG).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewStatus(key)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition-all
                      ${newStatus === key
                        ? 'border-sky-500 bg-white ring-1 ring-sky-500 text-sky-900 shadow-sm'
                        : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-white'
                      }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Anotação / Procedimento no dente
                </label>
                <textarea
                  value={toothNote}
                  onChange={(e) => setToothNote(e.target.value)}
                  placeholder="Ex: Restauração resina oclusal, cárie incipiente, canal tratado..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTooth(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveTooth}
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
                >
                  {saving ? 'Salvando...' : 'Salvar Alteração'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
