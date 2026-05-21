import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Landmark, PenTool } from 'lucide-react';
import { disposeEvidence } from '../../api/invoke';

export const DispositionDialog = ({ isOpen, onClose, evidenceId, onDispositionSuccess }) => {
  const [dispositionType, setDispositionType] = useState('Destroyed');
  const [magistrateOrderNo, setMagistrateOrderNo] = useState('');
  const [disposedTo, setDisposedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Clear values on open
      setMagistrateOrderNo('');
      setDisposedTo('');
      setNotes('');
      setSignatureText('');
      setError('');
      // Need a small timeout so canvas exists in DOM before clear
      setTimeout(() => {
        clearCanvas();
      }, 50);
    }
  }, [isOpen]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw background grid lines
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 10; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 10; j < canvas.height; j += 20) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!magistrateOrderNo) {
      setError('MAGISTRATE ORDER NUMBER IS REQUIRED');
      return;
    }
    if (!disposedTo) {
      setError('RECIPIENT / DISPOSED TO IS REQUIRED');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get base64 representation of the signature
      const canvas = canvasRef.current;
      let signatureData = signatureText || 'DIGITAL_SIGNATURE';
      if (canvas) {
        signatureData = canvas.toDataURL();
      }

      await disposeEvidence(
        evidenceId,
        dispositionType,
        magistrateOrderNo,
        disposedTo,
        signatureData,
        notes || `Evidence disposed via ${dispositionType}`
      );

      onDispositionSuccess();
    } catch (err) {
      console.error(err);
      setError(String(err).toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-mono text-slate-800">
      <div className="bg-[#f4f7f9] border-2 border-red-500 max-w-xl w-full p-6 shadow-[8px_8px_0px_rgba(239,68,68,0.2)] relative overflow-hidden">
        {/* Corner Marks */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-500 pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-500 pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-500 pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-500 pointer-events-none"></div>

        <div className="flex justify-between items-start border-b border-slate-300 pb-3 mb-4">
          <div>
            <div className="inline-block border border-red-500/40 px-1 py-0.5 text-[8px] text-red-600 font-bold tracking-widest bg-white mb-1">
              BSA COMPLIANT RECORD
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Landmark size={18} className="text-red-600" />
              EVIDENCE_DISPOSITION
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">DISPOSITION_TYPE</label>
              <select
                value={dispositionType}
                onChange={(e) => setDispositionType(e.target.value)}
                className="w-full bg-white border border-slate-400 p-2 font-bold outline-none focus:border-red-500 text-slate-700"
              >
                <option value="Destroyed">Destroyed</option>
                <option value="Auctioned">Auctioned</option>
                <option value="Return to Owner">Return to Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">MAGISTRATE_ORDER_NO *</label>
              <input
                type="text"
                value={magistrateOrderNo}
                onChange={(e) => setMagistrateOrderNo(e.target.value)}
                placeholder="e.g. DHC/2026/M-192"
                required
                className="w-full bg-white border border-slate-400 p-2 font-bold outline-none focus:border-red-500 text-slate-700 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">DISPOSED_TO / RECIPIENT *</label>
            <input
              type="text"
              value={disposedTo}
              onChange={(e) => setDisposedTo(e.target.value)}
              placeholder="e.g. Suresh Kumar (Owner) or Cyber Destruction Committee"
              required
              className="w-full bg-white border border-slate-400 p-2 font-bold outline-none focus:border-red-500 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">DISPOSITION_NOTES / REMARKS</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide details regarding destruction process, auction serial, or verification checks performed..."
              rows={2}
              className="w-full bg-white border border-slate-400 p-2 font-medium outline-none focus:border-red-500 text-slate-700"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[9px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1">
                <PenTool size={10} />
                FORENSIC_OFFICER_SIGNATURE
              </label>
              <button 
                type="button" 
                onClick={clearCanvas}
                className="text-[8px] text-slate-400 hover:text-slate-600 underline uppercase"
              >
                Clear Canvas
              </button>
            </div>
            <div className="border border-slate-400 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={100}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[100px] cursor-crosshair block bg-slate-50"
              />
            </div>
            <input 
              type="text" 
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="Or type full name to sign digitally"
              className="w-full bg-white border-t-0 border-x border-b border-slate-400 p-2 text-[10px] font-mono text-center outline-none focus:border-red-500 text-slate-600"
            />
          </div>

          {error && (
            <div className="p-2 border border-red-500 bg-red-50 text-[10px] font-bold text-red-600">
              [!] {error}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 font-bold tracking-widest text-slate-500 border border-slate-400 hover:bg-slate-200 uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 font-bold tracking-widest bg-red-600 text-white hover:bg-red-500 shadow-[2px_2px_0px_rgba(239,68,68,0.3)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all uppercase flex items-center justify-center gap-2"
            >
              <Check size={14} />
              {loading ? 'RECORDING...' : 'RECORD_DISPOSAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
