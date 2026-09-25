import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, Upload, RotateCcw, Check, Sparkles, 
  Image as ImageIcon, RefreshCw, AlertCircle, FileText 
} from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

const CATEGORIAS = [
  { id: 'Intraoral', label: '🦷 Intraoral (Dentes/Boca)' },
  { id: 'AntesDepois', label: '⚖️ Antes & Depois' },
  { id: 'Radiografia', label: '🩻 Radiografia / Raio-X' },
  { id: 'PerfilFace', label: '👤 Perfil & Face (Estética)' },
  { id: 'Documento', label: '📄 Exame / Documento' }
];

export default function ModalTirarFoto({ isOpen, onClose, paciente, onPhotoSaved }) {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload'
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);

  // Photo details
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Intraoral');
  const [notas, setNotas] = useState('');
  const [dataFoto, setDataFoto] = useState(getTodayDateString());

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize camera stream when in camera mode
  useEffect(() => {
    if (isOpen && activeMode === 'camera' && !capturedImage) {
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, capturedImage, cameraFacing]);

  const startCamera = async (facing) => {
    stopCamera();
    setCameraError('');
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Erro ao acessar câmera:', err);
      setCameraError('Não foi possível acessar a câmera. Você pode fazer upload de uma foto da sua galeria.');
      setActiveMode('upload');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Switch between front and back camera on mobile
  const toggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
  };

  // Capture frame from video stream
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Compress & read chosen file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Max dimension 1280px to keep quality high and payload light
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedData = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(compressedData);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (activeMode === 'camera') {
      startCamera(cameraFacing);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!capturedImage) return;

    setLoading(true);
    try {
      await onPhotoSaved({
        imagem: capturedImage,
        titulo: titulo.trim() || `${categoria} - ${paciente.nome}`,
        categoria,
        notas: notas.trim(),
        data: dataFoto
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Adicionar Foto Clínica</h3>
              <p className="text-xs text-slate-500">Prontuário de: <strong className="text-slate-800">{paciente?.nome}</strong></p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Mode Switcher Tabs */}
          {!capturedImage && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveMode('camera'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'camera'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Tirar com a Câmera</span>
              </button>
              <button
                type="button"
                onClick={() => { stopCamera(); setActiveMode('upload'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMode === 'upload'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Enviar da Galeria / Arquivo</span>
              </button>
            </div>
          )}

          {/* Camera View Area / Capture Screen */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center shadow-inner">
            {capturedImage ? (
              // Preview of captured / selected image
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Pré-visualização"
                  className="w-full h-full object-contain bg-slate-900"
                />
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold hover:bg-slate-900 transition-all shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tirar Outra Foto</span>
                </button>
              </div>
            ) : activeMode === 'camera' ? (
              // Live camera stream
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Flip camera button */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors shadow-md"
                  title="Trocar Câmera (Frontal / Traseira)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Shutter Button */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="w-16 h-16 rounded-full bg-white border-4 border-sky-500 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Capturar Foto"
                  >
                    <div className="w-11 h-11 rounded-full bg-sky-600 hover:bg-sky-500 transition-colors" />
                  </button>
                </div>
              </div>
            ) : (
              // Upload from file
              <div className="p-8 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Selecione uma foto da galeria</p>
                  <p className="text-xs text-slate-400 mt-0.5">Formatos suportados: JPG, PNG, WEBP</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Procurar Foto no Aparelho
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Form Fields: Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria da Foto
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data do Registro
                </label>
                <input
                  type="date"
                  value={dataFoto}
                  onChange={(e) => setDataFoto(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título da Foto (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Antes do Clareamento, Restauração Dente 16..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Anotações Clínicas sobre a Foto
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Aspecto inicial com pigmentação de esmalte, presença de trinca incisal..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { stopCamera(); onClose(); }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!capturedImage || loading}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar no Prontuário'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
