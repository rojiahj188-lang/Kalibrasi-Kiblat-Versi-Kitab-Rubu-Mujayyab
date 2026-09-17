import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QiblaResult } from '../types/qibla';
import { Compass, RotateCcw, Crosshair, HelpCircle, Eye, EyeOff, BookOpen, Sparkles, Sliders } from 'lucide-react';
import { RubuGuideModal } from './RubuGuideModal';
import { useTheme } from '../context/ThemeContext';

interface RubuCanvasProps {
  qiblaData: QiblaResult;
  onAngleChange?: (angle: number) => void;
}

export const RubuCanvas: React.FC<RubuCanvasProps> = ({ qiblaData, onAngleChange }) => {
  const { isNaskah } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active angle of the Khoith (thread) on the instrument: 0 to 90 degrees
  // Default to the calculated inhiraf
  const [threadAngle, setThreadAngle] = useState<number>(qiblaData.inhiraf.rawDegrees || 25);
  const [muriFraction, setMuriFraction] = useState<number>(1.0); // 0 to 1 along thread
  const [isDraggingThread, setIsDraggingThread] = useState<boolean>(false);
  const [showGridNumbers, setShowGridNumbers] = useState<boolean>(true);
  const [showHourCurves, setShowHourCurves] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Sync with calculated Qibla inhiraf when location changes
  useEffect(() => {
    if (qiblaData?.inhiraf?.rawDegrees) {
      setThreadAngle(Math.min(90, Math.max(0, qiblaData.inhiraf.rawDegrees)));
    }
  }, [qiblaData?.inhiraf?.rawDegrees]);

  // Derived mathematical values on the Rubu' Mujayyab
  const angleRad = (threadAngle * Math.PI) / 180;
  const jaibMabsuth = 60 * Math.cos(angleRad); // Horizontal axis projection
  const jaibMankus = 60 * Math.sin(angleRad); // Vertical axis projection
  const zhill12 = threadAngle > 0 ? 12 / Math.tan(angleRad) : 0;
  const zhill7 = threadAngle > 0 ? 7 / Math.tan(angleRad) : 0;

  // Render Rubu' Mujayyab onto Canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Instrument setup parameters:
    // Markaz (center / vertex) at bottom-left corner with padding
    const padding = 55;
    const radius = Math.min(width - padding * 1.5, height - padding * 1.5);
    const originX = padding;
    const originY = height - padding;

    // Background brass instrument board
    ctx.save();
    
    // Gradient for authentic brass/bronze plate or antique parchment
    const bgGrad = ctx.createRadialGradient(originX + radius * 0.4, originY - radius * 0.4, 20, originX + radius * 0.5, originY - radius * 0.5, radius * 1.3);
    if (isNaskah) {
      bgGrad.addColorStop(0, '#faf4e8');
      bgGrad.addColorStop(0.5, '#edd9b7');
      bgGrad.addColorStop(1, '#dec195');
    } else {
      bgGrad.addColorStop(0, '#3a2b16');
      bgGrad.addColorStop(0.5, '#281c0c');
      bgGrad.addColorStop(1, '#171008');
    }

    // Draw quadrant background path
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + radius, originY);
    ctx.arc(originX, originY, radius, 0, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Outer double rim border with brass engraving
    ctx.strokeStyle = isNaskah ? '#945d1d' : '#b48a3c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + radius + 14, originY);
    ctx.arc(originX, originY, radius + 14, 0, -Math.PI / 2, true);
    ctx.closePath();
    ctx.strokeStyle = isNaskah ? '#6e3e11' : '#6d4f1b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ==========================================
    // 1. Grid of Sittin (60 divisions): Khuthuth al-Juyub
    // ==========================================
    const step = radius / 60;

    // Horizontal lines (Jayb Mabsuth lines)
    for (let i = 1; i <= 60; i++) {
      const y = originY - i * step;
      // Calculate intersection with circle: x = sqrt(R^2 - y_rel^2)
      const yRel = i * step;
      const xSpan = Math.sqrt(Math.max(0, radius * radius - yRel * yRel));

      ctx.beginPath();
      ctx.moveTo(originX, y);
      ctx.lineTo(originX + xSpan, y);

      if (i % 5 === 0) {
        ctx.strokeStyle = isNaskah
          ? (i % 15 === 0 ? 'rgba(110, 60, 20, 0.65)' : 'rgba(140, 80, 25, 0.45)')
          : (i % 15 === 0 ? 'rgba(217, 170, 84, 0.45)' : 'rgba(180, 138, 60, 0.3)');
        ctx.lineWidth = i % 15 === 0 ? 1.2 : 0.8;
      } else {
        ctx.strokeStyle = isNaskah ? 'rgba(110, 60, 20, 0.22)' : 'rgba(180, 138, 60, 0.12)';
        ctx.lineWidth = 0.5;
      }
      ctx.stroke();

      // Number labels along vertical axis
      if (showGridNumbers && i % 5 === 0) {
        ctx.fillStyle = isNaskah
          ? (i % 15 === 0 ? '#381c06' : '#613914')
          : (i % 15 === 0 ? '#f0c775' : '#a88544');
        ctx.font = '10px "Plus Jakarta Sans", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i}`, originX - 6, y);
      }
    }

    // Vertical lines (Jayb Mankus lines)
    for (let i = 1; i <= 60; i++) {
      const x = originX + i * step;
      const xRel = i * step;
      const ySpan = Math.sqrt(Math.max(0, radius * radius - xRel * xRel));

      ctx.beginPath();
      ctx.moveTo(x, originY);
      ctx.lineTo(x, originY - ySpan);

      if (i % 5 === 0) {
        ctx.strokeStyle = isNaskah
          ? (i % 15 === 0 ? 'rgba(110, 60, 20, 0.65)' : 'rgba(140, 80, 25, 0.45)')
          : (i % 15 === 0 ? 'rgba(217, 170, 84, 0.45)' : 'rgba(180, 138, 60, 0.3)');
        ctx.lineWidth = i % 15 === 0 ? 1.2 : 0.8;
      } else {
        ctx.strokeStyle = isNaskah ? 'rgba(110, 60, 20, 0.22)' : 'rgba(180, 138, 60, 0.12)';
        ctx.lineWidth = 0.5;
      }
      ctx.stroke();

      // Number labels along horizontal axis
      if (showGridNumbers && i % 5 === 0) {
        ctx.fillStyle = isNaskah
          ? (i % 15 === 0 ? '#381c06' : '#613914')
          : (i % 15 === 0 ? '#f0c775' : '#a88544');
        ctx.font = '10px "Plus Jakarta Sans", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${i}`, x, originY + 6);
      }
    }

    // ==========================================
    // 2. Murabba' az-Zhill (Shadow Scale Square)
    // Scale 12 (Zhill Asabi') on upper/right area
    // ==========================================
    const zhillScale = (radius * 12) / 60;
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(originX, originY - zhillScale, zhillScale, zhillScale);
    ctx.restore();

    // ==========================================
    // 3. Hour Curves (Khuthuth as-Sa'at az-Zamaniyah)
    // Classical 6 curved lines for unequal hours
    // ==========================================
    if (showHourCurves) {
      ctx.save();
      ctx.strokeStyle = 'rgba(190, 150, 90, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      for (let h = 1; h <= 6; h++) {
        ctx.beginPath();
        const factor = Math.sin((h * 15 * Math.PI) / 180);
        for (let a = 0; a <= 90; a += 2) {
          const rA = (a * Math.PI) / 180;
          const rCurve = radius * factor * Math.sin(rA);
          const px = originX + rCurve * Math.cos(rA);
          const py = originY - rCurve * Math.sin(rA);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ==========================================
    // 4. Qous at-Tis'in (Arc of 90 degrees with degree tick marks)
    // ==========================================
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(originX, originY, radius, 0, -Math.PI / 2, true);
    ctx.stroke();

    // Graduation marks on the rim
    for (let deg = 0; deg <= 90; deg++) {
      const rad = (deg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      let tickLen = 5;
      if (deg % 10 === 0) tickLen = 14;
      else if (deg % 5 === 0) tickLen = 9;

      const innerX = originX + radius * cos;
      const innerY = originY - radius * sin;
      const outerX = originX + (radius + tickLen) * cos;
      const outerY = originY - (radius + tickLen) * sin;

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.strokeStyle = deg % 5 === 0 ? '#f5d061' : 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = deg % 10 === 0 ? 1.5 : deg % 5 === 0 ? 1.0 : 0.6;
      ctx.stroke();

      // Degree Labels
      if (deg % 10 === 0) {
        const textX = originX + (radius + 26) * cos;
        const textY = originY - (radius + 26) * sin;
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${deg}°`, textX, textY);
      }
    }

    // ==========================================
    // 5. Inhiraf Qiblah Marker on Arc (Target indicator)
    // ==========================================
    const qiblaAngle = Math.min(90, Math.max(0, qiblaData.inhiraf.rawDegrees));
    const qiblaRad = (qiblaAngle * Math.PI) / 180;
    const qX = originX + radius * Math.cos(qiblaRad);
    const qY = originY - radius * Math.sin(qiblaRad);

    // Draw Qibla highlight sector & glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(originX, originY, radius, -qiblaRad - 0.02, -qiblaRad + 0.02);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Ka'bah marker label near arc
    const kX = originX + (radius + 38) * Math.cos(qiblaRad);
    const kY = originY - (radius + 38) * Math.sin(qiblaRad);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Kiblat: ${qiblaAngle.toFixed(1)}°`, kX, kY);
    ctx.restore();

    // ==========================================
    // 6. Interactive Sine / Cosine Projection Lines
    // ==========================================
    const tRad = (threadAngle * Math.PI) / 180;
    const tX = originX + radius * Math.cos(tRad);
    const tY = originY - radius * Math.sin(tRad);

    // Muri Position (bead along the thread)
    const muriR = radius * muriFraction;
    const muriX = originX + muriR * Math.cos(tRad);
    const muriY = originY - muriR * Math.sin(tRad);

    // Projected horizontal & vertical dash lines from Muri to axes
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);

    // Down to horizontal axis (Jayb Mabsuth / Tamam)
    ctx.beginPath();
    ctx.moveTo(muriX, muriY);
    ctx.lineTo(muriX, originY);
    ctx.stroke();

    // Left to vertical axis (Jayb Mankus / Sin)
    ctx.beginPath();
    ctx.moveTo(muriX, muriY);
    ctx.lineTo(originX, muriY);
    ctx.stroke();
    ctx.restore();

    // ==========================================
    // 7. Al-Khoith (Silk Thread) & Al-Muri (Marker Bead)
    // ==========================================
    ctx.save();
    // Silk thread from Markaz
    ctx.strokeStyle = isNaskah ? '#b91c1c' : '#fef08a';
    ctx.shadowColor = isNaskah ? 'rgba(185, 28, 28, 0.4)' : 'rgba(251, 191, 36, 0.6)';
    ctx.shadowBlur = isNaskah ? 3 : 6;
    ctx.lineWidth = 2.0;

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(tX, tY);
    ctx.stroke();

    // Plumb line extension past the arc
    const extLen = 35;
    const endX = originX + (radius + extLen) * Math.cos(tRad);
    const endY = originY - (radius + extLen) * Math.sin(tRad);

    ctx.beginPath();
    ctx.moveTo(tX, tY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = isNaskah ? '#991b1b' : '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Asy-Syakul (Plumb bob / Bandul Pemberat) at the end of thread
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fillStyle = isNaskah ? '#78350f' : '#d97706';
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Al-Muri (The sliding bead on the string)
    ctx.beginPath();
    ctx.arc(muriX, muriY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = isNaskah ? '#381c06' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // ==========================================
    // 8. Markaz (Center Pivot / Pin)
    // ==========================================
    ctx.save();
    ctx.beginPath();
    ctx.arc(originX, originY, 8, 0, Math.PI * 2);
    const pinGrad = ctx.createRadialGradient(originX - 2, originY - 2, 1, originX, originY, 8);
    pinGrad.addColorStop(0, '#fef08a');
    pinGrad.addColorStop(0.7, '#d97706');
    pinGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = pinGrad;
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels at axes
    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px "Amiri", serif';
    ctx.textAlign = 'left';
    ctx.fillText('جَيْبُ الْمَبْسُوْط (Jaib Mabsuth)', originX + radius * 0.4, originY + 36);

    ctx.save();
    ctx.translate(originX - 36, originY - radius * 0.4);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('جَيْبُ الْمَنْكُوْس (Jaib Mankus)', 0, 0);
    ctx.restore();

    ctx.restore();
  }, [threadAngle, muriFraction, showGridNumbers, showHourCurves, qiblaData.inhiraf.rawDegrees]);

  // Redraw when parameters or size changes
  useEffect(() => {
    render();
  }, [render]);

  // Handle ResizeObserver for responsive high DPI canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const side = Math.min(rect.width, 580);

      canvas.width = side * dpr;
      canvas.height = side * dpr;
      canvas.style.width = `${side}px`;
      canvas.style.height = `${side}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  // Mouse & Touch interaction to pull the Khoith (thread)
  const calculateAngleFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const padding = 55;
    const originX = padding;
    const originY = rect.height - padding;

    const dx = x - originX;
    const dy = originY - y; // upward is positive

    if (dx <= 0 && dy <= 0) return;

    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI;
    deg = Math.max(0, Math.min(90, deg));

    // Calculate distance for muriFraction
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(rect.width - padding * 1.5, rect.height - padding * 1.5);
    const fraction = Math.min(1.0, Math.max(0.1, dist / radius));

    setThreadAngle(deg);
    setMuriFraction(fraction);
    if (onAngleChange) onAngleChange(deg);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingThread(true);
    calculateAngleFromEvent(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingThread) {
      calculateAngleFromEvent(e);
    }
  };

  const handleMouseUp = () => setIsDraggingThread(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDraggingThread(true);
    calculateAngleFromEvent(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDraggingThread) {
      calculateAngleFromEvent(e);
    }
  };

  const handleTouchEnd = () => setIsDraggingThread(false);

  // Set thread to exact Qibla inhiraf
  const handleSnapToQibla = () => {
    const qAngle = Math.min(90, Math.max(0, qiblaData.inhiraf.rawDegrees));
    setThreadAngle(qAngle);
    setMuriFraction(1.0);
    if (onAngleChange) onAngleChange(qAngle);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Interactive Guide Banner Trigger */}
      <button
        onClick={() => setShowGuideModal(true)}
        className={`w-full max-w-[560px] mb-3 flex items-center justify-between p-3 border rounded-2xl text-xs transition-all shadow-md group cursor-pointer ${
          isNaskah
            ? 'bg-gradient-to-r from-[#edd9b7] via-[#f5ebd9] to-[#edd9b7] hover:from-[#e3ccaa] hover:to-[#e3ccaa] border-[#b08453]'
            : 'bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 hover:from-amber-900/90 hover:to-amber-900/90 border-amber-600/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
            isNaskah
              ? 'bg-[#dec195]/40 border-[#b08453] text-[#8c4e1a]'
              : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
          }`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className={`font-bold flex items-center gap-1.5 ${
              isNaskah ? 'text-[#2c1a0e]' : 'text-amber-200'
            }`}>
              <span>Panduan Interaktif Busur Kuadran & Manik Muri</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                isNaskah
                  ? 'bg-[#dec195]/40 text-[#8c4e1a] border-[#b08453]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                Step-by-Step
              </span>
            </div>
            <p className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              Pelajari cara membaca busur 90°, memosisikan Muri, dan menghitung sinus 60 Sittin
            </p>
          </div>
        </div>
        <span className={`font-bold text-xs flex items-center gap-1 shrink-0 ${
          isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
        }`}>
          Buka Panduan &rarr;
        </span>
      </button>

      {/* Interactive Controls Bar */}
      <div className={`w-full max-w-[560px] flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl mb-3 border transition-colors ${
        isNaskah
          ? 'bg-[#faf5eb] border-[#d8c5a8]'
          : 'bg-stone-900/90 border-amber-900/40'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSnapToQibla}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer ${
              isNaskah
                ? 'bg-[#196336] hover:bg-[#14532d] text-white'
                : 'bg-emerald-700 hover:bg-emerald-600 text-emerald-50'
            }`}
            title="Arahkan benang tepat ke sudut inhiraf kiblat lokasi saat ini"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Tepatkan ke Kiblat ({qiblaData.inhiraf.rawDegrees.toFixed(2)}°)</span>
          </button>

          <button
            onClick={() => {
              setThreadAngle(45);
              setMuriFraction(1.0);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              isNaskah
                ? 'bg-[#ede2cd] hover:bg-[#dfceb5] text-[#2c1a0e]'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
            title="Reset ke 45°"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset 45°</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowGridNumbers(!showGridNumbers)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showGridNumbers
                ? (isNaskah ? 'bg-[#ede0c8] border-[#b08453] text-[#8c4e1a]' : 'bg-amber-950/60 border-amber-600/60 text-amber-300')
                : (isNaskah ? 'bg-[#f4ebd9] border-[#d8c5a8] text-[#785c47]' : 'bg-stone-800/80 border-stone-700 text-stone-400')
            }`}
          >
            {showGridNumbers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Angka 60</span>
          </button>

          <button
            onClick={() => setShowHourCurves(!showHourCurves)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              showHourCurves
                ? (isNaskah ? 'bg-[#ede0c8] border-[#b08453] text-[#8c4e1a]' : 'bg-amber-950/60 border-amber-600/60 text-amber-300')
                : (isNaskah ? 'bg-[#f4ebd9] border-[#d8c5a8] text-[#785c47]' : 'bg-stone-800/80 border-stone-700 text-stone-400')
            }`}
          >
            <span>Garis Jam</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-[560px] aspect-square flex items-center justify-center p-2 rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          isNaskah
            ? 'bg-[#f4ebd9] border-[#b08453]'
            : 'bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-amber-700/30'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="cursor-crosshair touch-none select-none rounded-xl"
        />

        {/* Subtle overlay hint */}
        <div className={`absolute top-4 right-4 pointer-events-none backdrop-blur-sm border px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 shadow-md ${
          isNaskah
            ? 'bg-[#faf5eb]/90 border-[#b08453] text-[#3e2717]'
            : 'bg-stone-950/80 border-amber-500/20 text-amber-200/90'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Tarik benang / ketuk busur</span>
        </div>
      </div>

      {/* Real-time Instrument Readings (Sittin / Sexagesimal Falak Output) */}
      <div className="w-full max-w-[560px] grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        <div className={`p-2.5 rounded-xl border transition-colors ${
          isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/80 border-amber-800/30'
        }`}>
          <div className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Sudut Benang (Qous)</div>
          <div className={`text-base font-bold font-mono ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`}>
            {threadAngle.toFixed(2)}°
          </div>
          <div className={`text-[10px] font-serif ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400/70'}`}>قَوْسُ الإِرْتِفَاع</div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-colors ${
          isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/80 border-amber-800/30'
        }`}>
          <div className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Jayb Mankus (Sin)</div>
          <div className={`text-base font-bold font-mono ${isNaskah ? 'text-[#2c1a0e]' : 'text-amber-100'}`}>
            {jaibMankus.toFixed(2)} <span className={`text-[10px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>/ 60</span>
          </div>
          <div className={`text-[10px] font-serif ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400/70'}`}>جَيْبُ مَنْكُوْس</div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-colors ${
          isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/80 border-amber-800/30'
        }`}>
          <div className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Jayb Mabsuth (Cos)</div>
          <div className={`text-base font-bold font-mono ${isNaskah ? 'text-[#2c1a0e]' : 'text-amber-100'}`}>
            {jaibMabsuth.toFixed(2)} <span className={`text-[10px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>/ 60</span>
          </div>
          <div className={`text-[10px] font-serif ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400/70'}`}>جَيْبُ مَبْسُوْط</div>
        </div>

        <div className={`p-2.5 rounded-xl border transition-colors ${
          isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/80 border-amber-800/30'
        }`}>
          <div className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Zhill 12 (Bayangan)</div>
          <div className={`text-base font-bold font-mono ${isNaskah ? 'text-[#2c1a0e]' : 'text-amber-100'}`}>
            {zhill12 > 99 ? '∞' : zhill12.toFixed(2)} <span className={`text-[10px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>jari</span>
          </div>
          <div className={`text-[10px] font-serif ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400/70'}`}>ظِلِّ مَبْسُوْط</div>
        </div>
      </div>

      {/* Manik Muri (Al-Muri) Interactive Position Controller */}
      <div className={`w-full max-w-[560px] p-3.5 rounded-2xl mt-3 space-y-2 border transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/90 border-amber-800/30'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-bold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>Posisi Manik Muri (الْمُرِي):</span>
            <span className={`font-mono font-bold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
              {(muriFraction * 60).toFixed(1)} <span className={`font-normal ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>/ 60 Sittin</span>
            </span>
          </div>

          <button
            onClick={() => setMuriFraction(1.0)}
            className={`text-[11px] underline cursor-pointer ${isNaskah ? 'text-[#8c4e1a] hover:text-[#6d3a10]' : 'text-amber-400 hover:text-amber-300'}`}
          >
            Kunci ke Busur (R=60)
          </button>
        </div>

        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.01"
          value={muriFraction}
          onChange={e => setMuriFraction(parseFloat(e.target.value))}
          className={`w-full cursor-pointer ${isNaskah ? 'accent-[#8c4e1a]' : 'accent-amber-500'}`}
        />

        <div className={`flex items-center justify-between text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
          <span>
            Potong Mankus (Y): <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'}>{(jaibMankus * muriFraction).toFixed(1)}</strong>
          </span>
          <span>
            Potong Mabsuth (X): <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'}>{(jaibMabsuth * muriFraction).toFixed(1)}</strong>
          </span>
          <span className={isNaskah ? 'text-[#8c745f]' : 'text-stone-500'}>
            {muriFraction >= 0.98 ? 'Tepat di Busur 60' : 'Muri Mengunci Koordinat'}
          </span>
        </div>
      </div>

      {/* Rubu' Interactive Guide Modal */}
      <RubuGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onApplyAngle={angle => {
          setThreadAngle(angle);
          if (onAngleChange) onAngleChange(angle);
        }}
        qiblaAngle={qiblaData.inhiraf.rawDegrees}
      />
    </div>
  );
};
