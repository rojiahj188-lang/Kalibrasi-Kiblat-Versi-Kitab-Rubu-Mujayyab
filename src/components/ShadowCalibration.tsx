import React, { useState, useEffect } from 'react';
import { Coordinates, QiblaResult, SolarPosition, RashdulQiblahToday } from '../types/qibla';
import { calculateSolarPosition, calculateTodayRashdulQiblah } from '../utils/astronomy';
import { Sun, Clock, Compass, AlertCircle, Info, Calendar, Sparkles } from 'lucide-react';

interface ShadowCalibrationProps {
  coords: Coordinates;
  qiblaData: QiblaResult;
}

export const ShadowCalibration: React.FC<ShadowCalibrationProps> = ({ coords, qiblaData }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [solar, setSolar] = useState<SolarPosition>(() => calculateSolarPosition(coords, new Date()));
  const [rashduToday, setRashduToday] = useState<RashdulQiblahToday>(() =>
    calculateTodayRashdulQiblah(coords, qiblaData.azimuthTrue, new Date())
  );

  // Update solar position every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      setSolar(calculateSolarPosition(coords, now));
    }, 1000);

    return () => clearInterval(timer);
  }, [coords]);

  // Recalculate daily event when coords or qibla change
  useEffect(() => {
    setRashduToday(calculateTodayRashdulQiblah(coords, qiblaData.azimuthTrue, currentDate));
  }, [coords, qiblaData.azimuthTrue]);

  // Angle difference between current shadow and Qibla azimuth
  const diffShadowQibla = Math.abs(solar.shadowAzimuth - qiblaData.azimuthTrue);
  const normDiff = Math.min(diffShadowQibla, 360 - diffShadowQibla);
  const isShadowAligningNow = solar.isAboveHorizon && normDiff <= 1.5;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Intro explanation banner */}
      <div className="w-full p-4 mb-4 bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-600/30 rounded-2xl flex items-start gap-3">
        <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 leading-relaxed">
          <span className="font-bold text-amber-200 block text-sm mb-0.5">
            Metode Rashdul Qiblah (رَصْدُ الْقِبْلَة - Kalibrasi Bayangan Matahari)
          </span>
          Dalam ilmu falak klasik, metode bayangan matahari adalah <strong>metode paling akurat 100%</strong> karena tidak terpengaruh interferensi medan magnet, baja beton gedung, maupun distorsi sensor smartphone.
        </div>
      </div>

      {/* Rashdul Qiblah Harian (Daily Shadow Alignment) Card */}
      <div className="w-full p-4 mb-4 bg-stone-900/90 border border-stone-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-stone-100">Jadwal Rashdul Qiblah Harian Lokasi Ini</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-stone-800 text-stone-400 rounded-md">
            {currentDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {rashduToday.hasEventToday ? (
          <div className="p-3.5 bg-gradient-to-br from-amber-950/50 to-stone-950 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-stone-400 mb-1">Waktu Bayang-bayang Tepat Kiblat:</div>
              <div className="text-2xl font-black font-mono text-amber-300 tracking-wide flex items-center gap-2">
                <span>{rashduToday.timeString}</span>
                <span className="text-xs font-normal text-amber-400/80 px-2 py-0.5 bg-amber-900/40 border border-amber-700/50 rounded-full">
                  Waktu Lokal
                </span>
              </div>
              <div className="text-xs text-stone-300 mt-1">{rashduToday.description}</div>
            </div>

            <div className="text-right text-xs text-stone-400 shrink-0">
              <div>Ketinggian Matahari:</div>
              <div className="font-mono text-amber-200 font-bold text-sm">
                {rashduToday.solarAltitudeAtEvent}° di atas ufuk
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-stone-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              {rashduToday.description}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Sun & Shadow Visualizer */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Sun Position Status */}
        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />
              Posisi Matahari Detik Ini
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                solar.isAboveHorizon ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {solar.isAboveHorizon ? 'Siang (Matahari Terlihat)' : 'Malam / Di Bawah Ufuk'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-500">Tinggi Matahari (Irtifa')</div>
              <div className="text-base font-bold font-mono text-amber-200">
                {solar.altitude.toFixed(2)}°
              </div>
              <div className="text-[9px] text-stone-500">0° = Ufuk, 90° = Zenit</div>
            </div>

            <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-500">Azimuth Matahari (Simt)</div>
              <div className="text-base font-bold font-mono text-amber-200">
                {solar.azimuth.toFixed(2)}°
              </div>
              <div className="text-[9px] text-stone-500">dari Utara Sejati</div>
            </div>

            <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-500">Arah Bayangan (Zhill)</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {solar.shadowAzimuth.toFixed(2)}°
              </div>
              <div className="text-[9px] text-stone-500">Arah jatuh bayangan</div>
            </div>

            <div className="p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <div className="text-[10px] text-stone-500">Target Azimuth Kiblat</div>
              <div className="text-base font-bold font-mono text-amber-400">
                {qiblaData.azimuthTrue.toFixed(2)}°
              </div>
              <div className="text-[9px] text-stone-500">Ka'bah Makkah</div>
            </div>
          </div>

          {/* Alignment status right now */}
          <div
            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              isShadowAligningNow
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                : 'bg-stone-950 border-stone-800 text-stone-400'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Selisih bayangan saat ini:{' '}
              <strong className="text-stone-200 font-mono">{normDiff.toFixed(1)}°</strong> dari garis Kiblat.
            </span>
          </div>
        </div>

        {/* Visual Gnomon / Tongkat Istiwa Diagram */}
        <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl flex flex-col items-center justify-center">
          <div className="text-xs font-semibold text-stone-300 mb-2 w-full text-left">
            Simulasi Proyeksi Tongkat Istiwa (Gnomon)
          </div>

          <div className="relative w-48 h-48 rounded-full border border-amber-900/40 bg-stone-950 flex items-center justify-center overflow-hidden">
            {/* Compass Rings */}
            <div className="absolute inset-2 rounded-full border border-stone-800/60" />
            <div className="absolute top-1 text-[9px] font-mono text-stone-500">U</div>
            <div className="absolute bottom-1 text-[9px] font-mono text-stone-500">S</div>
            <div className="absolute right-1 text-[9px] font-mono text-stone-500">T</div>
            <div className="absolute left-1 text-[9px] font-mono text-stone-500">B</div>

            {/* Qibla Direction Line (Gold/Emerald) */}
            <div
              className="absolute w-full h-0.5 bg-gradient-to-r from-emerald-500/80 to-transparent pointer-events-none origin-center"
              style={{ transform: `rotate(${qiblaData.azimuthTrue - 90}deg)` }}
            />

            {/* Sun Position Indicator */}
            {solar.isAboveHorizon && (
              <div
                className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${solar.azimuth - 90}deg)` }}
              >
                <div className="absolute right-3 w-5 h-5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)] flex items-center justify-center">
                  <Sun className="w-3 h-3 text-stone-950" />
                </div>
              </div>
            )}

            {/* Shadow Cast Indicator (Opposite to Sun) */}
            {solar.isAboveHorizon && (
              <div
                className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${solar.shadowAzimuth - 90}deg)` }}
              >
                <div className="absolute right-4 w-12 h-1 bg-stone-400/70 shadow-sm rounded-full" />
              </div>
            )}

            {/* Center Gnomon / Tongkat Pegak */}
            <div className="relative w-4 h-4 rounded-full bg-amber-500 border-2 border-stone-950 shadow-md flex items-center justify-center z-10">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          </div>

          <div className="text-[11px] text-stone-400 mt-3 text-center">
            Garis Hijau: Arah Kiblat ({qiblaData.azimuthTrue.toFixed(1)}°) | Titik Kuning: Matahari | Garis Abu: Bayangan
          </div>
        </div>
      </div>

      {/* Istiwa A'zam (Matahari Tepat di Atas Ka'bah) Guide */}
      <div className="w-full p-4 bg-stone-900/90 border border-amber-900/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-amber-200">
            Peristiwa Istiwa A'zham (Matahari Tepat di Atas Ka'bah)
          </h3>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed mb-3">
          Dua kali dalam setahun, deklinasi matahari tepat sama dengan lintang geografis Ka'bah di Makkah (21° 25' LU). Pada saat itu matahari berada tepat di atas Ka'bah saat waktu zawal di Makkah:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="p-3 bg-stone-950 rounded-xl border border-amber-700/30">
            <div className="text-xs font-bold text-amber-400 mb-0.5">1. Peristiwa Pertama (Mei)</div>
            <div className="text-sm font-mono text-stone-100 font-bold">27 & 28 Mei</div>
            <div className="text-xs text-stone-400 mt-0.5">Pukul 16:18 WIB / 17:18 WITA / 18:18 WIT</div>
            <div className="text-[10px] text-stone-500">12:18 Waktu Makkah (Zawal)</div>
          </div>

          <div className="p-3 bg-stone-950 rounded-xl border border-amber-700/30">
            <div className="text-xs font-bold text-amber-400 mb-0.5">2. Peristiwa Kedua (Juli)</div>
            <div className="text-sm font-mono text-stone-100 font-bold">15 & 16 Juli</div>
            <div className="text-xs text-stone-400 mt-0.5">Pukul 16:27 WIB / 17:27 WITA / 18:27 WIT</div>
            <div className="text-[10px] text-stone-500">12:27 Waktu Makkah (Zawal)</div>
          </div>
        </div>

        <div className="p-3 bg-amber-950/30 border border-amber-600/30 rounded-xl text-xs text-stone-300">
          <span className="font-semibold text-amber-300 block mb-1">
            Panduan Praktis Pengukuran di Masjid / Lapangan:
          </span>
          <ol className="list-decimal list-inside space-y-1 text-stone-400">
            <li>Siapkan tiang atau tongkat yang lurus sempurna, atau gantungkan benang dengan bandul pemberat (Syakul).</li>
            <li>Pastikan tongkat berdiri tegak lurus sempurna 90° dengan bantuan waterpass (Tashih al-Wadh').</li>
            <li>Tepat pada menit yang ditentukan, tarik garis lurus bayangan yang terbentuk di lantai.</li>
            <li>Arah bayangan yang mengarah ke matahari adalah <strong>garis kiblat yang 100% akurat dan mutlak</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
