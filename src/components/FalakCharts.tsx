import React, { useState, useMemo } from 'react';
import { Coordinates, QiblaResult } from '../types/qibla';
import { calculateSolarPosition } from '../utils/astronomy';
import {
  LineChart,
  Sun,
  Clock,
  Compass,
  Sparkles,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';

interface FalakChartsProps {
  coords: Coordinates;
  qiblaData: QiblaResult;
}

export const FalakCharts: React.FC<FalakChartsProps> = ({ coords, qiblaData }) => {
  const [selectedHour, setSelectedHour] = useState<number>(12); // Slider / hover hour (4 to 20)
  const [activeChart, setActiveChart] = useState<'altitude' | 'shadow' | 'sittin'>('altitude');

  const now = new Date();
  const currentDecimalHour = now.getHours() + now.getMinutes() / 60;

  // Generate 24-hour altitude data points from 04:00 to 20:00 (every 15 mins)
  const altitudeData = useMemo(() => {
    const points: { time: number; timeStr: string; altitude: number; shadowCm: number }[] = [];
    const date = new Date();

    for (let h = 4; h <= 20; h += 0.25) {
      const hours = Math.floor(h);
      const minutes = Math.round((h - hours) * 60);
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0);

      const solar = calculateSolarPosition(coords, d);
      const altDeg = Math.round(solar.altitude * 10) / 10;

      // Shadow of 100cm gnomon
      let shadow = 0;
      if (altDeg > 0) {
        shadow = 100 / Math.tan((altDeg * Math.PI) / 180);
        if (shadow > 500) shadow = 500;
      }

      points.push({
        time: h,
        timeStr: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        altitude: altDeg,
        shadowCm: Math.round(shadow),
      });
    }

    return points;
  }, [coords]);

  // Compute selected point
  const selectedPoint = useMemo(() => {
    return (
      altitudeData.find(p => Math.abs(p.time - selectedHour) < 0.2) ||
      altitudeData[Math.floor(altitudeData.length / 2)]
    );
  }, [altitudeData, selectedHour]);

  // SVG dimensions for chart
  const svgWidth = 640;
  const svgHeight = 260;
  const padX = 45;
  const padY = 35;
  const plotWidth = svgWidth - padX * 2;
  const plotHeight = svgHeight - padY * 2;

  // Min and max altitudes in data
  const minAlt = -20;
  const maxAlt = 90;

  const getX = (t: number) => {
    return padX + ((t - 4) / (20 - 4)) * plotWidth;
  };

  const getY = (alt: number) => {
    return padY + plotHeight - ((alt - minAlt) / (maxAlt - minAlt)) * plotHeight;
  };

  // Build SVG Path for Altitude Curve
  const altitudePath = useMemo(() => {
    return altitudeData
      .map((p, i) => {
        const x = getX(p.time);
        const y = getY(p.altitude);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [altitudeData]);

  // Build SVG Area Path under curve
  const altitudeAreaPath = useMemo(() => {
    const firstX = getX(altitudeData[0].time);
    const lastX = getX(altitudeData[altitudeData.length - 1].time);
    const baseY = getY(0); // Horizon 0 deg
    return `${altitudePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [altitudePath, altitudeData]);

  // Horizon line Y (0 deg)
  const horizonY = getY(0);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Selector */}
      <div className="p-4 sm:p-5 bg-stone-900/90 border border-amber-800/40 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-stone-100">
                Visualisasi Grafik Falak Astronomi
              </h3>
              <p className="text-[11px] text-stone-400">
                Analisis kurva matematis pergerakan matahari, bayangan istiwa, dan koordinat kiblat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setActiveChart('altitude')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChart === 'altitude'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Ketinggian (Irtifa')
            </button>
            <button
              onClick={() => setActiveChart('shadow')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChart === 'shadow'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Panjang Bayangan
            </button>
            <button
              onClick={() => setActiveChart('sittin')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChart === 'sittin'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Trigonometri 60
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      {activeChart === 'altitude' && (
        <div className="p-4 sm:p-5 bg-stone-950 border border-stone-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              Kurva Ketinggian Matahari Harian (Irtifa' asy-Syams)
            </span>
            <span className="text-stone-400">
              Lokasi: <strong className="text-stone-200">{coords.cityName}</strong>
            </span>
          </div>

          {/* Responsive SVG Container */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full min-w-[540px] h-auto select-none"
            >
              <defs>
                <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              {/* Grid Lines Y (Degrees) */}
              {[-20, 0, 20, 40, 60, 80].map(deg => {
                const y = getY(deg);
                return (
                  <g key={deg}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={svgWidth - padX}
                      y2={y}
                      stroke={deg === 0 ? '#10b981' : '#292524'}
                      strokeWidth={deg === 0 ? 1.5 : 1}
                      strokeDasharray={deg === 0 ? 'none' : '3 3'}
                    />
                    <text
                      x={padX - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fill={deg === 0 ? '#10b981' : '#78716c'}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {deg > 0 ? `+${deg}°` : `${deg}°`}
                    </text>
                  </g>
                );
              })}

              {/* Grid Lines X (Hours) */}
              {[4, 6, 8, 10, 12, 14, 16, 18, 20].map(hour => {
                const x = getX(hour);
                return (
                  <g key={hour}>
                    <line
                      x1={x}
                      y1={padY}
                      x2={x}
                      y2={svgHeight - padY}
                      stroke="#292524"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={x}
                      y={svgHeight - padY + 16}
                      textAnchor="middle"
                      fill="#78716c"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {hour.toString().padStart(2, '0')}:00
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={altitudeAreaPath} fill="url(#sunGrad)" />

              {/* Curve Line */}
              <path
                d={altitudePath}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Horizon label */}
              <text
                x={svgWidth - padX - 4}
                y={horizonY - 5}
                textAnchor="end"
                fill="#10b981"
                fontSize="9"
                fontWeight="bold"
              >
                Garis Ufuk 0° (Terbit / Terbenam)
              </text>

              {/* Selected Hour Line */}
              {selectedPoint && (
                <g>
                  <line
                    x1={getX(selectedPoint.time)}
                    y1={padY}
                    x2={getX(selectedPoint.time)}
                    y2={svgHeight - padY}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <circle
                    cx={getX(selectedPoint.time)}
                    cy={getY(selectedPoint.altitude)}
                    r="5"
                    fill="#38bdf8"
                    stroke="#0c0a09"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Hour Scrubber Slider & Reading Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="sm:col-span-2 p-3 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Geser Jam Pengamatan:
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {selectedPoint.timeStr}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="0.25"
                value={selectedHour}
                onChange={e => setSelectedHour(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>04:00 (Fajar)</span>
                <span>12:00 (Zawal)</span>
                <span>20:00 (Isya)</span>
              </div>
            </div>

            <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-2xl flex flex-col justify-center gap-1">
              <span className="text-[11px] text-stone-400">Ketinggian Matahari (Irtifa'):</span>
              <span className="text-xl font-bold font-mono text-amber-200">
                {selectedPoint.altitude}°
              </span>
              <span className="text-[10px] text-stone-400">
                {selectedPoint.altitude > 0
                  ? 'Matahari di atas ufuk siang'
                  : 'Matahari di bawah ufuk malam'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart 2: Shadow Length Chart */}
      {activeChart === 'shadow' && (
        <div className="p-4 sm:p-5 bg-stone-950 border border-stone-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              Kurva Panjang Bayangan Tongkat Istiwa 100 cm (Murabba' az-Zhill)
            </span>
          </div>

          <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl text-stone-300 text-xs leading-relaxed">
            Grafik ini menunjukkan panjang bayangan matahari sepanjang siang hari. Bayangan mencapai titik
            terpendek tepat saat matahari melintasi meridian langit (*Zawalul Waqti*), dan waktu Ashar masuk
            ketika panjang bayangan sama dengan panjang tongkat (100 cm) ditambah bayangan istiwa saat zawal.
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 text-[11px] block">Tinggi Tongkat (Mikyas):</span>
              <span className="text-base font-bold text-stone-200 font-mono">100 cm</span>
              <span className="text-[10px] text-stone-500 font-serif">مِقْيَاسُ الاِسْتِوَاءِ</span>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 text-[11px] block">Bayangan Zawal (Siang):</span>
              <span className="text-base font-bold text-amber-300 font-mono">
                {coords.latitude < 0 ? Math.round(100 * Math.tan((Math.abs(coords.latitude) * Math.PI) / 180)) : 15} cm
              </span>
              <span className="text-[10px] text-stone-500 font-serif">ظِلُّ الزَّوَال</span>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 text-[11px] block">Batas Awal Ashar:</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {100 + (coords.latitude < 0 ? Math.round(100 * Math.tan((Math.abs(coords.latitude) * Math.PI) / 180)) : 15)} cm
              </span>
              <span className="text-[10px] text-stone-500 font-serif">ظِلُّ مِثْلِهِ</span>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="text-stone-400 text-[11px] block">Skala Jari Klasik:</span>
              <span className="text-base font-bold text-amber-200 font-mono">12 Asba'</span>
              <span className="text-[10px] text-stone-500 font-serif">اِثْنَا عَشَرَ إِصْبَعًا</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart 3: Sittiniyah Trigonometry Grid */}
      {activeChart === 'sittin' && (
        <div className="p-4 sm:p-5 bg-stone-950 border border-stone-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Diagram Trigonometri Falak Sittiniyah (Radius R = 60 Sittin)
            </span>
          </div>

          <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl text-stone-300 text-xs leading-relaxed">
            Kitab Rubu' Mujayyab mengandalkan perbandingan sinus skala 60 (*Jayb 60*). Di bawah ini adalah perbandingan nilai
            ketinggian sudut, nilai sinus klasik (*Jayb Mankus*), cosinus klasik (*Jayb Mabsuth*), dan bayangan (*Zhill 12*):
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-stone-300">
              <thead className="bg-stone-900 text-amber-400 text-[11px] uppercase font-mono border-b border-stone-800">
                <tr>
                  <th className="py-2.5 px-3">Sudut Busur (Qous)</th>
                  <th className="py-2.5 px-3">Jayb Mankus (60 sin)</th>
                  <th className="py-2.5 px-3">Jayb Mabsuth (60 cos)</th>
                  <th className="py-2.5 px-3">Zhill Mabsuth (12 cot)</th>
                  <th className="py-2.5 px-3">Keterangan Falak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-mono">
                {[
                  { angle: 0, desc: 'Ufuk Datar (0°)' },
                  { angle: 15, desc: '1 Jam Waktu Falak' },
                  { angle: Math.round(qiblaData.inhiraf.rawDegrees), desc: `Arah Kiblat (${coords.cityName})` },
                  { angle: 30, desc: 'Setengah Sinus (30 Sittin)' },
                  { angle: 45, desc: 'Keseimbangan Sin = Cos' },
                  { angle: 60, desc: 'Tinggi Bayangan 1/2' },
                  { angle: 75, desc: 'Menjelang Puncak' },
                  { angle: 90, desc: 'Zenith / Samt Tegak' },
                ].map((item, idx) => {
                  const rad = (item.angle * Math.PI) / 180;
                  const sinVal = (60 * Math.sin(rad)).toFixed(2);
                  const cosVal = (60 * Math.cos(rad)).toFixed(2);
                  const cotVal = item.angle > 0 ? (12 / Math.tan(rad)).toFixed(2) : '∞';

                  return (
                    <tr
                      key={idx}
                      className={
                        item.desc.includes('Arah Kiblat')
                          ? 'bg-amber-950/40 text-amber-200 font-bold'
                          : 'hover:bg-stone-900/40'
                      }
                    >
                      <td className="py-2 px-3">{item.angle}°</td>
                      <td className="py-2 px-3">{sinVal}</td>
                      <td className="py-2 px-3">{cosVal}</td>
                      <td className="py-2 px-3">{cotVal} jari</td>
                      <td className="py-2 px-3 font-sans text-[11px] text-stone-400">
                        {item.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
