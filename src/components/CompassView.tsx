import React, { useState, useEffect, useRef } from 'react';
import { QiblaResult, Coordinates, CompassData } from '../types/qibla';
import { Compass as CompassIcon, Smartphone, AlertTriangle, CheckCircle2, ShieldAlert, Volume2, VolumeX, Sliders, RefreshCw } from 'lucide-react';

interface CompassViewProps {
  qiblaData: QiblaResult;
  coords: Coordinates;
}

export const CompassView: React.FC<CompassViewProps> = ({ qiblaData, coords }) => {
  const [compass, setCompass] = useState<CompassData>({
    heading: null,
    pitch: 0,
    roll: 0,
    accuracy: null,
    isLevel: true,
    isAvailable: false,
    isCalibrated: false,
    needsPermission: false,
    isSupported: true,
  });

  // Simulator mode for desktop or testing
  const [manualHeading, setManualHeading] = useState<number>(270);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [useTrueNorth, setUseTrueNorth] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showFig8Modal, setShowFig8Modal] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasVibratedRef = useRef<boolean>(false);

  // Target Qibla Azimuth
  const targetAzimuth = useTrueNorth ? qiblaData.azimuthTrue : qiblaData.azimuthMagnetic;

  // Current active heading (sensor or manual)
  const currentHeading = isManualMode || compass.heading === null ? manualHeading : compass.heading;

  // Difference between current heading and Qibla target: [-180, 180]
  let diff = (targetAzimuth - currentHeading) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  const isAligned = Math.abs(diff) <= 2.0;

  // Sound chime when aligned
  useEffect(() => {
    if (isAligned && soundEnabled) {
      if (!hasVibratedRef.current) {
        // Haptic feedback
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([50, 40, 80]);
          } catch (e) {
            // Ignore
          }
        }

        // Web Audio beep
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (!audioContextRef.current && AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
          if (audioContextRef.current) {
            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5 note
            gain.gain.setValueAtTime(0.08, audioContextRef.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioContextRef.current.destination);
            osc.start();
            osc.stop(audioContextRef.current.currentTime + 0.35);
          }
        } catch (e) {
          // Audio not allowed or failed
        }

        hasVibratedRef.current = true;
      }
    } else {
      hasVibratedRef.current = false;
    }
  }, [isAligned, soundEnabled]);

  // Request iOS permission if needed
  const requestOrientationPermission = async () => {
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setCompass(prev => ({ ...prev, needsPermission: false }));
          startCompassListener();
        } else {
          alert('Izin sensor kompas ditolak. Anda dapat menggunakan mode manual atau bayangan matahari.');
        }
      } catch (err) {
        console.error('Error requesting device orientation permission:', err);
      }
    } else {
      startCompassListener();
    }
  };

  const startCompassListener = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // 1. iOS: webkitCompassHeading (0 = True/Magnetic North)
      if ('webkitCompassHeading' in e && typeof (e as { webkitCompassHeading?: number }).webkitCompassHeading === 'number') {
        heading = (e as { webkitCompassHeading: number }).webkitCompassHeading;
      } 
      // 2. Android: absolute alpha or standard alpha
      else if (e.alpha !== null && typeof e.alpha === 'number') {
        // In Android, alpha is counter-clockwise [0, 360]
        heading = (360 - e.alpha) % 360;
      }

      const pitch = e.beta || 0; // -180 to 180 (tilt front/back)
      const roll = e.gamma || 0; // -90 to 90 (tilt left/right)
      
      // Check if phone is flat on waterpass (within 4 degrees)
      const isFlat = Math.abs(pitch) <= 4.5 && Math.abs(roll) <= 4.5;

      if (heading !== null) {
        setCompass(prev => ({
          ...prev,
          heading,
          pitch,
          roll,
          isLevel: isFlat,
          isAvailable: true,
          isSupported: true,
        }));
      }
    };

    // Listen to absolute orientation if supported (avoids compass drift on newer Android)
    const win = window as any;
    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    } else if (win.DeviceOrientationEvent) {
      win.addEventListener('deviceorientation', handleOrientation as EventListener, true);
    }
  };

  useEffect(() => {
    const win = window as any;
    // Check if permission needed on iOS 13+
    const DeviceOrientation = win.DeviceOrientationEvent as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    } | undefined;

    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      setCompass(prev => ({ ...prev, needsPermission: true }));
    } else if (win.DeviceOrientationEvent) {
      startCompassListener();
    } else {
      setCompass(prev => ({ ...prev, isSupported: false, isAvailable: false }));
    }

    return () => {
      // Clean up listeners
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Status & Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-900/80 border border-stone-800 rounded-xl mb-3 text-xs">
        <div className="flex items-center gap-2">
          {/* North Mode Toggle */}
          <button
            onClick={() => setUseTrueNorth(!useTrueNorth)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              useTrueNorth
                ? 'bg-amber-600/30 border border-amber-500/50 text-amber-200'
                : 'bg-stone-800 border border-stone-700 text-stone-300'
            }`}
          >
            {useTrueNorth ? 'Utara Sejati (Falak/Geo)' : 'Utara Magnetik'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-all ${
              soundEnabled
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title="Suara Penanda Tepat Kiblat"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Calibrate Sensor Button */}
          <button
            onClick={() => setShowFig8Modal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Kalibrasi Sensor</span>
          </button>

          {/* Toggle Simulator on Desktop */}
          <button
            onClick={() => setIsManualMode(!isManualMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all ${
              isManualMode
                ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                : 'bg-stone-800 border-stone-700 text-stone-400'
            }`}
            title="Simulasi manual untuk PC / browser tanpa sensor fisik"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulasi</span>
          </button>
        </div>
      </div>

      {/* iOS Sensor Permission Request Banner */}
      {compass.needsPermission && (
        <div className="w-full p-4 mb-4 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-amber-200 text-xs">
            <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Sensor kompas iPhone memerlukan izin akses orientasi perangkat.</span>
          </div>
          <button
            onClick={requestOrientationPermission}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg font-bold text-xs shrink-0 shadow transition-all active:scale-95"
          >
            Aktifkan Sensor
          </button>
        </div>
      )}

      {/* Tashih al-Wadh' / Waterpass (Spirit Level Indicator) */}
      <div
        className={`w-full max-w-[500px] p-2.5 mb-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
          compass.isLevel || isManualMode
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
            : 'bg-amber-950/40 border-amber-600/50 text-amber-300 animate-pulse'
        }`}
      >
        <div className="flex items-center gap-2">
          {compass.isLevel || isManualMode ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
          <div>
            <span className="font-semibold">
              {compass.isLevel || isManualMode ? 'Posisi HP Datar (Tashih al-Wadh\')' : 'Peringatan: HP Miring!'}
            </span>
            <span className="opacity-80 block text-[11px]">
              {compass.isLevel || isManualMode
                ? 'Permukaan datar optimal untuk akurasi sensor kompas magnetometer.'
                : 'Posisikan smartphone datar sempurna di lantai/meja agar kompas tidak terdistorsi.'}
            </span>
          </div>
        </div>

        {/* Small Visual Bubble Leveler */}
        {!isManualMode && (
          <div className="relative w-12 h-12 rounded-full border border-stone-600 bg-stone-900 shrink-0 flex items-center justify-center overflow-hidden">
            <div className="absolute w-2.5 h-2.5 border border-stone-400/50 rounded-full" />
            {/* Bubble */}
            <div
              className={`absolute w-3.5 h-3.5 rounded-full transition-transform duration-75 ${
                compass.isLevel ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
              }`}
              style={{
                transform: `translate(${Math.max(-18, Math.min(18, (compass.roll || 0) * 1.8))}px, ${Math.max(
                  -18,
                  Math.min(18, (compass.pitch || 0) * 1.8)
                )}px)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Main Circular Compass Dial */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center my-2">
        {/* Alignment Glow Aura */}
        {isAligned && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl animate-pulse pointer-events-none" />
        )}

        {/* Outer Rotating Compass Rose */}
        <div
          className="relative w-full h-full rounded-full border-4 border-amber-900/60 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 shadow-2xl transition-transform duration-100 ease-out flex items-center justify-center"
          style={{
            transform: `rotate(${-currentHeading}deg)`,
          }}
        >
          {/* Compass Graduation Ticks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const deg = i * 5;
            const isMajor = deg % 30 === 0;
            const isCardinal = deg % 90 === 0;
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-between pointer-events-none py-1.5"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className={`w-0.5 rounded-full ${
                    isCardinal
                      ? 'h-3.5 bg-amber-400'
                      : isMajor
                      ? 'h-2.5 bg-stone-400'
                      : 'h-1.5 bg-stone-700'
                  }`}
                />
                <div className="w-0.5 h-1.5 bg-stone-800" />
              </div>
            );
          })}

          {/* Cardinal Labels (N, E, S, W / U, T, S, B) */}
          <div className="absolute top-3 font-bold text-sm text-red-400 font-mono">U (0°)</div>
          <div className="absolute bottom-3 font-bold text-xs text-stone-400 font-mono">S (180°)</div>
          <div className="absolute right-3 font-bold text-xs text-stone-400 font-mono">T (90°)</div>
          <div className="absolute left-3 font-bold text-xs text-stone-400 font-mono">B (270°)</div>

          {/* Concentric Decorative Rings */}
          <div className="w-[82%] h-[82%] rounded-full border border-amber-800/25 flex items-center justify-center">
            <div className="w-[74%] h-[74%] rounded-full border border-stone-800/80 flex items-center justify-center">
              {/* Classical Rubu' Mujayyab Astrolabe Grid motif */}
              <div className="w-full h-full relative opacity-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-amber-400" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-px bg-amber-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Ka'bah Target Marker on the Rotating Dial */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-start items-center pointer-events-none"
            style={{ transform: `rotate(${targetAzimuth}deg)` }}
          >
            {/* Ka'bah Pointer Needle */}
            <div className="flex flex-col items-center -mt-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-lg border-2 transition-all ${
                  isAligned
                    ? 'bg-emerald-600 border-emerald-300 scale-110 shadow-emerald-500/50'
                    : 'bg-stone-900 border-amber-400 text-amber-300'
                }`}
              >
                {/* Ka'bah Icon Graphic */}
                <div className="w-5 h-5 bg-stone-950 border border-amber-400 rounded-sm relative flex items-center justify-center">
                  <div className="absolute top-1 left-0 right-0 h-0.5 bg-amber-400" />
                  <span className="text-[7px] text-amber-300 font-bold">كعبة</span>
                </div>
              </div>
              <div className="w-0.5 h-12 bg-gradient-to-b from-amber-400 to-transparent" />
            </div>
          </div>
        </div>

        {/* Static Center Sighting Needle (Phone Direction) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-start pt-1">
          {/* Top Sighting Arrow */}
          <div
            className={`w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[16px] transition-colors ${
              isAligned ? 'border-b-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 'border-b-amber-400'
            }`}
          />
        </div>

        {/* Center Hub Display */}
        <div className="absolute w-24 h-24 rounded-full bg-stone-950/95 border-2 border-amber-600/60 shadow-xl flex flex-col items-center justify-center text-center backdrop-blur-sm z-10">
          <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Arah HP</div>
          <div className="text-xl font-bold font-mono text-amber-200">{Math.round(currentHeading)}°</div>
          <div
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
              isAligned ? 'bg-emerald-500 text-stone-950 animate-pulse' : 'text-stone-400'
            }`}
          >
            {isAligned ? 'KIBLAT TEPAT' : `${Math.abs(Math.round(diff))}° ${diff > 0 ? 'kanan' : 'kiri'}`}
          </div>
        </div>
      </div>

      {/* Manual Heading Slider (Active when Simulator is enabled or sensor unavailable) */}
      {isManualMode && (
        <div className="w-full max-w-[420px] p-3 mt-2 bg-stone-900/90 border border-indigo-800/40 rounded-xl">
          <div className="flex justify-between items-center text-xs mb-1.5 text-stone-300">
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <Sliders className="w-3.5 h-3.5" />
              Simulasi Putar Kompas Manual:
            </span>
            <span className="font-mono font-bold text-amber-300">{manualHeading}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={manualHeading}
            onChange={e => setManualHeading(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-stone-500 mt-1 font-mono">
            <span>U (0°)</span>
            <span>T (90°)</span>
            <span>S (180°)</span>
            <span>B (270°)</span>
            <span>U (360°)</span>
          </div>
        </div>
      )}

      {/* Key Numerical Falak Metrics */}
      <div className="w-full max-w-[500px] grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
        <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl">
          <div className="text-[11px] text-stone-400">Azimuth Kiblat Sejati</div>
          <div className="text-lg font-bold text-amber-300 font-mono">
            {qiblaData.azimuthTrue.toFixed(2)}°
          </div>
          <div className="text-[10px] text-stone-500">dari Utara Sejati (CW)</div>
        </div>

        <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl">
          <div className="text-[11px] text-stone-400">Inhiraf (Deviasi)</div>
          <div className="text-sm font-bold text-emerald-400 font-mono leading-snug">
            {qiblaData.inhiraf.degrees}° {qiblaData.inhiraf.minutes}' {qiblaData.inhiraf.seconds}"
          </div>
          <div className="text-[10px] text-emerald-500/80">{qiblaData.inhiraf.quadrantText}</div>
        </div>

        <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-[11px] text-stone-400">Jarak ke Baitullah</div>
          <div className="text-lg font-bold text-stone-200 font-mono">
            {qiblaData.distanceKm.toLocaleString('id-ID')} <span className="text-xs text-stone-400">km</span>
          </div>
          <div className="text-[10px] text-stone-500">Makkah al-Mukarramah</div>
        </div>
      </div>

      {/* Sensor Calibration Modal / Help */}
      {showFig8Modal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-600/40 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-amber-200 mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
              Kalibrasi Sensor Kompas Smartphone
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              Sensor magnetometer smartphone rentan terdistorsi medan magnet di sekitar (besi beton, speaker, laptop, charger, atau lantai bertulang).
            </p>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col items-center mb-4">
              {/* Figure 8 Motion Graphic */}
              <div className="relative w-36 h-20 flex items-center justify-center">
                <svg viewBox="0 0 100 50" className="w-full h-full stroke-amber-400 fill-none">
                  <path
                    d="M 25,25 C 25,10 5,10 5,25 C 5,40 25,40 50,25 C 75,10 95,10 95,25 C 95,40 75,40 50,25 Z"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                </svg>
                <Smartphone className="w-6 h-6 text-emerald-400 absolute animate-bounce" />
              </div>
              <span className="text-[11px] text-amber-300 mt-2 font-medium">
                Gerakkan smartphone membentuk angka delapan (∞) di udara sebanyak 3-5 kali.
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-stone-400 mb-5">
              <div>✓ Jauhkan HP minimal 1-2 meter dari benda logam atau perangkat elektronik.</div>
              <div>✓ Letakkan HP di atas sajadah atau lantai yang rata tanpa casing magnetik.</div>
              <div>✓ Untuk akurasi mutlak 100% bebas interferensi magnet, verifikasi dengan tab <strong>Bayangan Matahari (Rashdul Qiblah)</strong>.</div>
            </div>

            <button
              onClick={() => setShowFig8Modal(false)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition-colors"
            >
              Saya Mengerti & Selesai Kalibrasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
