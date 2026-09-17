import React, { useState, useMemo } from 'react';
import { Coordinates } from '../types/qibla';
import {
  calculateHisabQiblaRubu,
  calculatePrayerTimesRubu,
  calculateSolarAltitudeAndShadow,
  toSittiniyah,
  decimalToFalakDMS,
  falakDMSToDecimal,
  QiblaHisabRubu,
  PrayerTimeResult,
  SolarAltitudeAndShadow,
} from '../utils/falakCalculator';
import { toDMS } from '../utils/astronomy';
import {
  Calculator,
  Compass,
  Clock,
  Sun,
  Binary,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface FalakCalculatorProps {
  currentCoords: Coordinates;
  onApplyCoords?: (coords: Coordinates) => void;
}

export const FalakCalculator: React.FC<FalakCalculatorProps> = ({ currentCoords, onApplyCoords }) => {
  // Mode selection
  const [calcMode, setCalcMode] = useState<'qibla' | 'prayer' | 'altitude' | 'sittiniyah'>('qibla');

  // --- Sub-Module 1: Qibla State ---
  const [inputLat, setInputLat] = useState<number>(currentCoords.latitude);
  const [inputLon, setInputLon] = useState<number>(currentCoords.longitude);

  // Recalculate Qibla
  const qiblaRubuResult: QiblaHisabRubu = useMemo(() => {
    return calculateHisabQiblaRubu(inputLat, inputLon);
  }, [inputLat, inputLon]);

  // --- Sub-Module 2: Prayer Times State ---
  const [prayerDate, setPrayerDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [prayerTimezone, setPrayerTimezone] = useState<number>(() => {
    // Default WITA (+8) for Lombok / NTB
    return 8;
  });
  const [prayerElevation, setPrayerElevation] = useState<number>(20);

  const prayerResult: PrayerTimeResult = useMemo(() => {
    const d = new Date(prayerDate + 'T12:00:00');
    return calculatePrayerTimesRubu(d, inputLat, inputLon, prayerTimezone, prayerElevation);
  }, [prayerDate, inputLat, inputLon, prayerTimezone, prayerElevation]);

  // --- Sub-Module 3: Solar Altitude & Shadow State ---
  const [targetTimeHHMM, setTargetTimeHHMM] = useState<string>(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });

  const altitudeResult: SolarAltitudeAndShadow = useMemo(() => {
    const d = new Date(prayerDate + 'T12:00:00');
    return calculateSolarAltitudeAndShadow(d, inputLat, inputLon, prayerTimezone, targetTimeHHMM);
  }, [prayerDate, inputLat, inputLon, prayerTimezone, targetTimeHHMM]);

  // --- Sub-Module 4: Sittiniyah Trigonometry State ---
  const [angleDeg, setAngleDeg] = useState<number>(24.5);
  const sittiniyahTrig = useMemo(() => {
    const rad = (angleDeg * Math.PI) / 180;
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);
    const tanVal = Math.tan(rad);
    const cotVal = tanVal !== 0 ? 1 / tanVal : 9999;

    const jayb = 60 * sinVal; // Skala 60
    const jaybTamam = 60 * cosVal;
    const saham = 60 * (1 - cosVal);
    const zhillMabsuth = 12 * cotVal; // 12 Asba' (jari)
    const zhillMankus = 12 * tanVal;

    return {
      angle: angleDeg,
      dms: toDMS(angleDeg),
      jayb: { val: jayb, sittin: toSittiniyah(jayb) },
      jaybTamam: { val: jaybTamam, sittin: toSittiniyah(jaybTamam) },
      saham: { val: saham, sittin: toSittiniyah(saham) },
      zhillMabsuth: { val: zhillMabsuth, sittin: toSittiniyah(zhillMabsuth) },
      zhillMankus: { val: zhillMankus, sittin: toSittiniyah(zhillMankus) },
    };
  }, [angleDeg]);

  // Quick preset loader
  const handleSetPreset = (lat: number, lon: number, name: string) => {
    setInputLat(lat);
    setInputLon(lon);
    if (onApplyCoords) {
      onApplyCoords({
        latitude: lat,
        longitude: lon,
        cityName: name,
        source: 'preset',
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner */}
      <div className="p-4 bg-stone-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-amber-200 flex items-center gap-1.5">
              <span>Kalkulator Falak Kitab Rubu' Mujayyab</span>
              <span className="font-serif text-xs text-amber-400/80">حِسَابَاتُ الرُّبْعِ الْمُجَيَّب</span>
            </h2>
            <p className="text-[11px] text-stone-400">
              Perhitungan astronomi Islam klasik: Arah Kiblat, Jadwal Shalat, Irtifa' Matahari, & Trigonometri Sittiniyah (Skala 60).
            </p>
          </div>
        </div>

        {/* Quick presets buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => handleSetPreset(-8.6830, 116.1264, 'KUA Gerung, Lombok Barat')}
            className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-amber-300 rounded-lg font-medium transition-all text-[11px]"
            title="Set koordinat ke KUA Kec. Gerung Lombok Barat"
          >
            📍 KUA Gerung
          </button>
          <button
            onClick={() => handleSetPreset(-8.6433, 116.1608, 'Ponpes Darussalam Kediri')}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg font-medium transition-all text-[11px]"
            title="Set koordinat ke Kediri Lombok Barat"
          >
            📍 Kediri Lobar
          </button>
          <button
            onClick={() => {
              setInputLat(currentCoords.latitude);
              setInputLon(currentCoords.longitude);
            }}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 rounded-lg font-medium transition-all text-[11px]"
            title="Gunakan koordinat aktif"
          >
            GPS Saat Ini
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-stone-900/90 border border-stone-800 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setCalcMode('qibla')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            calcMode === 'qibla'
              ? 'bg-amber-600 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Arah Kiblat</span>
        </button>

        <button
          onClick={() => setCalcMode('prayer')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            calcMode === 'prayer'
              ? 'bg-amber-600 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Waktu Shalat</span>
        </button>

        <button
          onClick={() => setCalcMode('altitude')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            calcMode === 'altitude'
              ? 'bg-amber-600 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Irtifa' & Bayangan</span>
        </button>

        <button
          onClick={() => setCalcMode('sittiniyah')}
          className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            calcMode === 'sittiniyah'
              ? 'bg-amber-600 text-stone-950 font-bold shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>Trigonometri 60</span>
        </button>
      </div>

      {/* Coordinate Input Bar (Shared for Qibla, Prayer, Altitude) */}
      {calcMode !== 'sittiniyah' && (
        <div className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-stone-400 block mb-1 font-medium flex items-center justify-between">
              <span>Lintang Tempat (φ / 'Ardhul Balad):</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {toDMS(inputLat).formatted}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.0001"
                value={inputLat}
                onChange={e => setInputLat(parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                placeholder="-8.6830"
              />
              <span className="text-stone-400 text-xs">{inputLat >= 0 ? 'LU' : 'LS'}</span>
            </div>
          </div>

          <div>
            <label className="text-stone-400 block mb-1 font-medium flex items-center justify-between">
              <span>Bujur Tempat (λ / Thulul Balad):</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {toDMS(inputLon).formatted}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.0001"
                value={inputLon}
                onChange={e => setInputLon(parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                placeholder="116.1264"
              />
              <span className="text-stone-400 text-xs">BT</span>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT MODE 1: ARAH KIBLAT RUBU' MUJAYYAB --- */}
      {calcMode === 'qibla' && (
        <div className="space-y-4">
          {/* Main Results Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-600/40 rounded-2xl shadow-lg">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Hasil Hisab Arah Kiblat (سَمْتُ الْقِبْلَة)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Skala As-Sittin (R=60)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[11px] block">Azimuth Sejati (As-Simt):</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-200">
                  {qiblaRubuResult.azimuthTrue.toFixed(2)}°
                </span>
                <span className="text-[10px] text-stone-500 block">Putaran dari Utara Sejati</span>
              </div>

              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[11px] block">Inhiraf (Deviasi Serong):</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  {toDMS(qiblaRubuResult.inhiraf).formatted}
                </span>
                <span className="text-[10px] text-emerald-300/80 block truncate">
                  {qiblaRubuResult.quadrantName}
                </span>
              </div>

              <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800">
                <span className="text-stone-400 text-[11px] block">Ashl Mutlaq (الأصل المطلق):</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-cyan-300">
                  {qiblaRubuResult.ashlMutlaq.toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-500 block">Sittin / Bagian Busur</span>
              </div>
            </div>

            <div className="p-2.5 bg-stone-900/80 rounded-xl text-xs text-stone-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Arah kiblat adalah <strong>{toDMS(qiblaRubuResult.inhiraf).formatted}</strong> diukur dari titik Barat serong ke Utara (azimuth sejati {qiblaRubuResult.azimuthTrue.toFixed(2)}°).
              </span>
            </div>
          </div>

          {/* Detailed Formula Steps Breakdown */}
          <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs pb-2 border-b border-stone-800">
              <BookOpen className="w-4 h-4" />
              <span>Rincian Langkah Matematis Kitab Rubu' Mujayyab</span>
            </div>

            <div className="space-y-2">
              {qiblaRubuResult.formulaSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-950/80 rounded-xl border border-stone-800/80 hover:border-amber-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-900/50 text-amber-300 text-[10px] font-mono flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-stone-200 text-xs">{step.title}</span>
                    </div>
                    <div className="font-serif text-amber-400/90 text-xs mt-0.5 pl-7">
                      {step.arabic}
                    </div>
                  </div>
                  <div className="pl-7 sm:pl-0 sm:text-right">
                    <span className="font-mono text-amber-200 font-bold text-xs block">
                      {step.result}
                    </span>
                    <span className="text-stone-500 font-mono text-[10px] block">
                      {step.formula}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT MODE 2: JADWAL WAKTU SHALAT --- */}
      {calcMode === 'prayer' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-stone-400 block mb-1 font-medium">Tanggal Perhitungan:</label>
              <input
                type="date"
                value={prayerDate}
                onChange={e => setPrayerDate(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-stone-400 block mb-1 font-medium">Zona Waktu (Timezone):</label>
              <select
                value={prayerTimezone}
                onChange={e => setPrayerTimezone(parseInt(e.target.value, 10))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:border-amber-500 focus:outline-none"
              >
                <option value={7}>WIB (UTC+7)</option>
                <option value={8}>WITA (UTC+8) - NTB/Bali/Sulawesi</option>
                <option value={9}>WIT (UTC+9)</option>
              </select>
            </div>
            <div>
              <label className="text-stone-400 block mb-1 font-medium">Elevasi / Ketinggian (meter):</label>
              <input
                type="number"
                value={prayerElevation}
                onChange={e => setPrayerElevation(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
                placeholder="20"
              />
            </div>
          </div>

          {/* Prayer Time Table */}
          <div className="bg-stone-900/90 border border-amber-600/30 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-3.5 bg-amber-950/30 border-b border-amber-700/30 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-200">
                Jadwal Waktu Shalat Versi Rubu' Mujayyab ({prayerTimezone === 8 ? 'WITA' : prayerTimezone === 7 ? 'WIB' : 'WIT'})
              </span>
              <span className="text-stone-400 font-mono text-[11px]">
                Ihtiyath: +2 menit
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-stone-400 text-xs block font-medium">Imsak</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-stone-200">
                  {prayerResult.times.imsak}
                </span>
                <span className="text-[10px] text-stone-500 block">10m sblm Subuh</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-amber-400 text-xs block font-semibold">Subuh</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-200">
                  {prayerResult.times.subuh}
                </span>
                <span className="text-[10px] text-stone-500 block">h = -20.0°</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-stone-400 text-xs block font-medium">Terbit / Syuruq</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-stone-300">
                  {prayerResult.times.terbit}
                </span>
                <span className="text-[10px] text-stone-500 block">h = -1.0°</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-amber-300 text-xs block font-medium">Dhuha</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-amber-100">
                  {prayerResult.times.dhuha}
                </span>
                <span className="text-[10px] text-stone-500 block">h = +4.5°</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-emerald-400 text-xs block font-semibold">Dzuhur (Zawal)</span>
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-200">
                  {prayerResult.times.dzuhur}
                </span>
                <span className="text-[10px] text-stone-500 block">Matahari Tergelincir</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-emerald-400 text-xs block font-semibold">Ashar</span>
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-200">
                  {prayerResult.times.ashar}
                </span>
                <span className="text-[10px] text-stone-500 block">h = {prayerResult.details.asrAltitude}°</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-amber-400 text-xs block font-semibold">Maghrib</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-200">
                  {prayerResult.times.maghrib}
                </span>
                <span className="text-[10px] text-stone-500 block">Matahari Tenggelam</span>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-center">
                <span className="text-amber-400 text-xs block font-semibold">Isya</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-200">
                  {prayerResult.times.isya}
                </span>
                <span className="text-[10px] text-stone-500 block">h = -18.0°</span>
              </div>
            </div>

            {/* Ephemeris Footer info */}
            <div className="p-3 bg-stone-950/60 border-t border-stone-800/80 text-[11px] text-stone-400 flex flex-wrap justify-between gap-2">
              <span>Deklinasi Matahari (δ): <strong className="text-amber-300 font-mono">{prayerResult.declination.toFixed(2)}°</strong></span>
              <span>Perata Waktu (e): <strong className="text-amber-300 font-mono">{prayerResult.equationOfTime.toFixed(1)} menit</strong></span>
              <span>Zawal Hakiki: <strong className="text-amber-300 font-mono">{prayerResult.details.zawalTime}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT MODE 3: IRTIFA' MATAHARI & BAYANGAN ISTIWA --- */}
      {calcMode === 'altitude' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-center gap-3 text-xs">
            <label className="text-stone-300 font-medium shrink-0">
              Pilih Jam Pengamatan (Waktu Lokal):
            </label>
            <input
              type="time"
              value={targetTimeHHMM}
              onChange={e => setTargetTimeHHMM(e.target.value)}
              className="bg-stone-950 border border-stone-700 rounded-xl px-4 py-2 text-stone-100 font-mono font-bold text-sm focus:border-amber-500 focus:outline-none"
            />
            <span className="text-stone-400 text-[11px]">
              Menghitung sudut ketinggian matahari dan bayangan tongkat istiwa pada jam tersebut.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card Irtifa' */}
            <div className="p-4 bg-stone-900 border border-amber-600/30 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Ketinggian Matahari (اِرْتِفَاعُ الشَّمْس)
              </span>

              <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-xs text-stone-400">Tinggi Busur (h):</span>
                <span className="text-2xl font-black font-mono text-amber-200">
                  {altitudeResult.solarAltitude > 0 ? `${altitudeResult.solarAltitude.toFixed(2)}°` : 'Di bawah ufuk (Malam)'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-300">
                <div className="flex justify-between p-2 bg-stone-950/60 rounded-lg">
                  <span className="text-stone-400">Posisi Benang Rubu' (Busur 90°):</span>
                  <span className="font-mono font-bold text-amber-300">{altitudeResult.rubuStringAngle}°</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-950/60 rounded-lg">
                  <span className="text-stone-400">Jayb Irtifa' (60 sin h):</span>
                  <span className="font-mono font-bold text-stone-200">{altitudeResult.jaybIrtifa} Sittin</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-950/60 rounded-lg">
                  <span className="text-stone-400">Jayb Tamam (60 cos h):</span>
                  <span className="font-mono font-bold text-stone-200">{altitudeResult.jaybTamam} Sittin</span>
                </div>
              </div>
            </div>

            {/* Card Bayangan Istiwa (Zhill) */}
            <div className="p-4 bg-stone-900 border border-amber-600/30 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Bayangan Tongkat Istiwa (مُرَبَّعُ الظِّلّ)
              </span>

              <div className="flex items-center justify-between p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-xs text-stone-400">Skala 12 Asba' (Jari):</span>
                <span className="text-2xl font-black font-mono text-emerald-300">
                  {altitudeResult.zhillAsba > 0 ? `${altitudeResult.zhillAsba} jari` : '-'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-300">
                <div className="flex justify-between p-2 bg-stone-950/60 rounded-lg">
                  <span className="text-stone-400">Skala 7 Aqdam (Kaki):</span>
                  <span className="font-mono font-bold text-emerald-300">{altitudeResult.zhillAqdam} kaki</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-950/60 rounded-lg">
                  <span className="text-stone-400">Rumus Zhill Asba':</span>
                  <span className="font-mono text-[11px] text-stone-400">12 ÷ tan(h)</span>
                </div>
                <div className="flex justify-between p-2 bg-stone-950/60 rounded-lg">
                  <span className="text-stone-400">Status Matahari:</span>
                  <span className="font-semibold text-amber-300">
                    {altitudeResult.isSunAboveHorizon ? 'Matahari di atas ufuk' : 'Matahari telah terbenam'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT MODE 4: TRIGONOMETRI SITTINIYAH (SKALA 60) --- */}
      {calcMode === 'sittiniyah' && (
        <div className="space-y-4">
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3 text-xs">
            <label className="text-stone-300 font-medium block flex items-center justify-between">
              <span>Masukkan Sudut Derajat (Qousut Tis'in / Derajat Busur):</span>
              <span className="text-amber-400 font-mono font-bold">{sittiniyahTrig.dms.formatted}</span>
            </label>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="90"
                step="0.1"
                value={angleDeg}
                onChange={e => setAngleDeg(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="90"
                step="0.01"
                value={angleDeg}
                onChange={e => setAngleDeg(Math.max(0, Math.min(90, parseFloat(e.target.value) || 0)))}
                className="w-24 bg-stone-950 border border-stone-700 rounded-xl px-2.5 py-1.5 text-center font-mono font-bold text-amber-300"
              />
            </div>
          </div>

          {/* Table of Sittiniyah values */}
          <div className="bg-stone-900/90 border border-amber-600/30 rounded-2xl overflow-hidden shadow-lg text-xs">
            <div className="p-3.5 bg-amber-950/30 border-b border-amber-700/30 flex items-center justify-between">
              <span className="font-bold text-amber-200">
                Tabel Besaran Juyub & Azh-Zhilal Rubu' Mujayyab (R = 60, Zhill = 12)
              </span>
              <span className="font-serif text-xs text-amber-400">جَدْوَلُ الْجُيُوْبِ وَالظِّلَال</span>
            </div>

            <div className="divide-y divide-stone-800">
              <div className="p-3 flex items-center justify-between hover:bg-stone-800/40">
                <div>
                  <span className="font-bold text-stone-200 block">Jayb (الجَيْب - Sinus Sittin)</span>
                  <span className="text-stone-500 text-[10px]">Rumus: 60 × sin(α)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-300 text-sm block">
                    {sittiniyahTrig.jayb.val.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {sittiniyahTrig.jayb.sittin.formatted} (درجة-دقيقة-ثانية)
                  </span>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between hover:bg-stone-800/40">
                <div>
                  <span className="font-bold text-stone-200 block">Jayb Tamam (جَيْبُ التَّمَام - Cosinus Sittin)</span>
                  <span className="text-stone-500 text-[10px]">Rumus: 60 × cos(α)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-300 text-sm block">
                    {sittiniyahTrig.jaybTamam.val.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {sittiniyahTrig.jaybTamam.sittin.formatted}
                  </span>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between hover:bg-stone-800/40">
                <div>
                  <span className="font-bold text-stone-200 block">Saham (السَّهْم - Versine Sittin)</span>
                  <span className="text-stone-500 text-[10px]">Rumus: 60 × (1 - cos(α))</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-cyan-300 text-sm block">
                    {sittiniyahTrig.saham.val.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {sittiniyahTrig.saham.sittin.formatted}
                  </span>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between hover:bg-stone-800/40">
                <div>
                  <span className="font-bold text-emerald-300 block">Zhill Mabsuth (الظِّلُّ الْمَبْسُوْط - Cotangens 12)</span>
                  <span className="text-stone-500 text-[10px]">Bayangan horizontal: 12 × cot(α)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-300 text-sm block">
                    {sittiniyahTrig.zhillMabsuth.val.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {sittiniyahTrig.zhillMabsuth.sittin.formatted}
                  </span>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between hover:bg-stone-800/40">
                <div>
                  <span className="font-bold text-emerald-300 block">Zhill Mankus (الظِّلُّ الْمَنْكُوْس - Tangens 12)</span>
                  <span className="text-stone-500 text-[10px]">Bayangan vertikal: 12 × tan(α)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-300 text-sm block">
                    {sittiniyahTrig.zhillMankus.val.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {sittiniyahTrig.zhillMankus.sittin.formatted}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
