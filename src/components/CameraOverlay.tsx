import React, { useRef, useState, useEffect } from 'react';
import { QiblaResult, CompassData } from '../types/qibla';
import { Camera, CameraOff, RefreshCw, Crosshair, AlertTriangle } from 'lucide-react';

interface CameraOverlayProps {
  qiblaData: QiblaResult;
  currentHeading: number;
  pitch: number | null;
  roll: number | null;
  isLevel: boolean;
}

export const CameraOverlay: React.FC<CameraOverlayProps> = ({
  qiblaData,
  currentHeading,
  pitch,
  roll,
  isLevel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Compute offset between heading and Qibla for AR horizontal tape
  const targetAzimuth = qiblaData.azimuthTrue;
  let offsetDeg = (targetAzimuth - currentHeading) % 360;
  if (offsetDeg > 180) offsetDeg -= 360;
  if (offsetDeg < -180) offsetDeg += 360;

  const isAligned = Math.abs(offsetDeg) <= 2.0;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-3 p-3 bg-stone-900/80 border border-stone-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-stone-200">Mode Bidik Kamera & Sighting Kiblat</span>
        </div>

        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            cameraActive
              ? 'bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700/60'
              : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
          }`}
        >
          {cameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
          <span>{cameraActive ? 'Matikan Kamera' : 'Buka Kamera Bidik'}</span>
        </button>
      </div>

      {cameraError && (
        <div className="w-full p-3 mb-3 bg-red-950/40 border border-red-700/50 rounded-xl text-xs text-red-300">
          {cameraError}
        </div>
      )}

      {/* Viewfinder Canvas / Video Frame */}
      <div className="relative w-full max-w-[540px] aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl flex items-center justify-center">
        {/* Background Live Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {!cameraActive && (
          <div className="text-center p-6 text-stone-400 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400">
              <Camera className="w-7 h-7" />
            </div>
            <div className="text-xs max-w-xs leading-relaxed">
              Klik <strong>"Buka Kamera Bidik"</strong> untuk membidik dinding masjid, shaf salat, atau tongkat istiwa di lapangan dengan overlay garis kiblat langsung.
            </div>
          </div>
        )}

        {/* AR HUD Overlay */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Compass Heading Tape */}
            <div className="w-full flex flex-col items-center">
              <div className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-700 text-xs text-stone-200 font-mono flex items-center gap-2 shadow-lg">
                <span>Arah: <strong>{Math.round(currentHeading)}°</strong></span>
                <span className="text-stone-500">|</span>
                <span className="text-amber-300">Kiblat: <strong>{targetAzimuth.toFixed(1)}°</strong></span>
              </div>

              {/* Offset indicator pointer */}
              <div className="relative w-48 h-6 mt-1 flex items-center justify-center overflow-hidden">
                <div className="absolute w-px h-full bg-red-500 z-10" />
                <div
                  className="absolute flex items-center gap-1 transition-transform duration-75"
                  style={{
                    transform: `translateX(${Math.max(-80, Math.min(80, offsetDeg * 4))}px)`,
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow ${
                      isAligned ? 'bg-emerald-500 text-black' : 'bg-amber-400 text-black'
                    }`}
                  >
                    ك
                  </div>
                </div>
              </div>
            </div>

            {/* Center Sighting Reticle / Syakul */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Vertical plumb line (Benang Syakul) */}
              <div
                className={`w-0.5 h-64 transition-colors ${
                  isAligned ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-400/70'
                }`}
              />

              {/* Horizontal horizon line */}
              <div
                className={`h-0.5 w-64 transition-colors ${
                  isAligned ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-400/70'
                }`}
              />

              {/* Center Target Box */}
              <div
                className={`w-16 h-16 rounded-xl border-2 transition-all flex items-center justify-center ${
                  isAligned
                    ? 'border-emerald-400 bg-emerald-500/20 scale-110 shadow-lg'
                    : 'border-amber-400/80'
                }`}
              >
                {isAligned && (
                  <span className="text-[10px] font-bold text-emerald-300 font-mono">TEPAT</span>
                )}
              </div>
            </div>

            {/* Bottom Status Banner */}
            <div className="w-full flex items-center justify-between">
              <div
                className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-semibold border ${
                  isAligned
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-stone-950/80 border-stone-800 text-stone-300'
                }`}
              >
                {isAligned
                  ? '✓ BIDIKAN TEPAT SEJAJAR KIBLAT'
                  : `Geser HP ${Math.abs(Math.round(offsetDeg))}° ke ${offsetDeg > 0 ? 'kanan' : 'kiri'}`}
              </div>

              <div
                className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[10px] border ${
                  isLevel
                    ? 'bg-stone-900/80 border-stone-700 text-emerald-300'
                    : 'bg-amber-950/80 border-amber-600 text-amber-300'
                }`}
              >
                {isLevel ? 'Waterpass: Datar' : 'Waterpass: Miring'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
