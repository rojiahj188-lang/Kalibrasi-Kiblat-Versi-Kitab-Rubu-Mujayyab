import React, { useState } from 'react';
import { QiblaResult, Coordinates } from '../types/qibla';
import { RUBU_GLOSSARY } from '../utils/kitabGlossary';
import { BookOpen, Calculator, ChevronDown, ChevronUp, FileText, Compass, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HisabDetailsProps {
  qiblaData: QiblaResult;
  coords: Coordinates;
}

export const HisabDetails: React.FC<HisabDetailsProps> = ({ qiblaData, coords }) => {
  const { isNaskah } = useTheme();
  const [showAllGlossary, setShowAllGlossary] = useState<boolean>(false);
  const { rubu, inhiraf, azimuthTrue, azimuthMagnetic, magneticDeclination } = qiblaData;

  return (
    <div className={`w-full flex flex-col gap-4 ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
      {/* Header Overview Banner */}
      <div className={`p-4 border rounded-2xl flex items-start gap-3 transition-colors ${
        isNaskah
          ? 'bg-[#ede0c8] border-[#b08453] text-[#3e2717]'
          : 'bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-amber-600/30 text-stone-300'
      }`}>
        <BookOpen className={`w-5 h-5 shrink-0 mt-0.5 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
        <div className="text-xs leading-relaxed">
          <div className={`font-bold text-sm mb-0.5 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'}`}>
            Silsilah Hisab Falak Versi Kitab Rubu' Mujayyab (حِسَابُ رُبْعِ الْمُجَيَّبِ)
          </div>
          Rincian hisab trigonometri bola menggunakan kaidah pecahan enam puluhan (Sittiniyah / R = 60 bagian) sebagaimana diajarkan dalam kitab-kitab falak pesantren (seperti <em>Ad-Durusul Falakiyah</em>, <em>Taqribul Maqshad</em>, dan <em>Fathur Rauf al-Mannan</em>).
        </div>
      </div>

      {/* Primary Coordinate Parameters */}
      <div className={`p-4 border rounded-2xl transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/90 border-stone-800'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
          isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
        }`}>
          <Calculator className="w-4 h-4" />
          Data Titik Koordinat Falak (Mu'thayatul Hisab)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Local coordinates */}
          <div className={`p-3 rounded-xl border space-y-1.5 ${
            isNaskah ? 'bg-[#f4ebd9] border-[#d8c5a8]' : 'bg-stone-950 border-stone-800'
          }`}>
            <div className={`font-semibold flex justify-between ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>
              <span>Koordinat Tempat (Al-Balad)</span>
              <span className={`text-[11px] font-serif ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`}>عَرْضُ وَطُوْلُ الْبَلَد</span>
            </div>
            <div className={`flex justify-between ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              <span>'Ardhul Balad (Lintang φ):</span>
              <span className={`font-mono font-semibold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>{coords.latitude.toFixed(4)}° ({coords.latitude >= 0 ? 'LU' : 'LS'})</span>
            </div>
            <div className={`flex justify-between ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              <span>Thulul Balad (Bujur λ):</span>
              <span className={`font-mono font-semibold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>{coords.longitude.toFixed(4)}° ({coords.longitude >= 0 ? 'BT' : 'BB'})</span>
            </div>
          </div>

          {/* Makkah coordinates */}
          <div className={`p-3 rounded-xl border space-y-1.5 ${
            isNaskah ? 'bg-[#f4ebd9] border-[#d8c5a8]' : 'bg-stone-950 border-stone-800'
          }`}>
            <div className={`font-semibold flex justify-between ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>
              <span>Koordinat Ka'bah (Makkah)</span>
              <span className={`text-[11px] font-serif ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`}>عَرْضُ وَطُوْلُ مَكَّة</span>
            </div>
            <div className={`flex justify-between ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              <span>'Ardh Makkah (Lintang φₘ):</span>
              <span className={`font-mono font-semibold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>21° 25' 21" LU (21.4225°)</span>
            </div>
            <div className={`flex justify-between ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              <span>Thul Makkah (Bujur λₘ):</span>
              <span className={`font-mono font-semibold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>39° 49' 34" BT (39.8262°)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Hisab Breakdown in Rubu' Mujayyab (R = 60) */}
      <div className={`p-4 border rounded-2xl space-y-3 transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/90 border-stone-800'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
          isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
        }`}>
          <FileText className="w-4 h-4" />
          Tahapan Perhitungan Kitab (Khuthuwatul Hisab)
        </h3>

        {/* Step 1: Fadhlut Thulain */}
        <div className={`p-3 rounded-xl border text-xs ${
          isNaskah ? 'bg-[#f4ebd9] border-[#dfceb5]' : 'bg-stone-950/90 border-stone-800/80'
        }`}>
          <div className={`flex items-center justify-between font-semibold mb-1 ${
            isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
          }`}>
            <span>1. Fadhlut Thulain (فَضْلُ الطُّوْلَيْن - Selisih Bujur)</span>
            <span className={`font-mono ${isNaskah ? 'text-[#7e4518]' : 'text-stone-400'}`}>Δλ = |λ - λₘ|</span>
          </div>
          <p className={`mb-1.5 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
            Selisih bujur lokasi pengamatan terhadap bujur Baitullah Makkah:
          </p>
          <div className={`font-mono p-2 rounded-lg flex flex-wrap justify-between gap-2 ${
            isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'
          }`}>
            <span>|{coords.longitude.toFixed(4)}° - 39.8262°| = <strong>{rubu.fadhlutThulain.toFixed(4)}°</strong></span>
            <span className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}>Jayb Fadhlit Thulain (60 × sin Δλ): <strong>{rubu.jaybFadhlitThulain.toFixed(4)}</strong></span>
          </div>
        </div>

        {/* Step 2: Jayb & Jayb Tamam Makkah */}
        <div className={`p-3 rounded-xl border text-xs ${
          isNaskah ? 'bg-[#f4ebd9] border-[#dfceb5]' : 'bg-stone-950/90 border-stone-800/80'
        }`}>
          <div className={`flex items-center justify-between font-semibold mb-1 ${
            isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
          }`}>
            <span>2. Jayb & Jayb Tamam Makkah (جَيْبُ عَرْضِ مَكَّة وَتَمَامُهُ)</span>
            <span className={`font-mono ${isNaskah ? 'text-[#7e4518]' : 'text-stone-400'}`}>R = 60</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 font-mono">
            <div className={`p-2 rounded-lg ${isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'}`}>
              Jayb 'Ardh Makkah (60 × sin 21°25'): <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{rubu.jaybArdhMakkah.toFixed(4)}</strong>
            </div>
            <div className={`p-2 rounded-lg ${isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'}`}>
              Jayb Tamam Makkah (60 × cos 21°25'): <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{rubu.jaybTamamArdhMakkah.toFixed(4)}</strong>
            </div>
          </div>
        </div>

        {/* Step 3: Jayb & Jayb Tamam Balad */}
        <div className={`p-3 rounded-xl border text-xs ${
          isNaskah ? 'bg-[#f4ebd9] border-[#dfceb5]' : 'bg-stone-950/90 border-stone-800/80'
        }`}>
          <div className={`flex items-center justify-between font-semibold mb-1 ${
            isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
          }`}>
            <span>3. Jayb & Jayb Tamam Lintang Balad (جَيْبُ عَرْضِ الْبَلَد وَتَمَامُهُ)</span>
            <span className={`font-mono ${isNaskah ? 'text-[#7e4518]' : 'text-stone-400'}`}>φ = {coords.latitude.toFixed(2)}°</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 font-mono">
            <div className={`p-2 rounded-lg ${isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'}`}>
              Jayb 'Ardhul Balad (60 × sin φ): <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{rubu.jaybArdhBalad.toFixed(4)}</strong>
            </div>
            <div className={`p-2 rounded-lg ${isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'}`}>
              Jayb Tamam Balad (60 × cos φ): <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{rubu.jaybTamamArdhBalad.toFixed(4)}</strong>
            </div>
          </div>
        </div>

        {/* Step 4: Ashl Mutlaq & Hishshah */}
        <div className={`p-3 rounded-xl border text-xs ${
          isNaskah ? 'bg-[#f4ebd9] border-[#dfceb5]' : 'bg-stone-950/90 border-stone-800/80'
        }`}>
          <div className={`flex items-center justify-between font-semibold mb-1 ${
            isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
          }`}>
            <span>4. Ashl Mutlaq & Hishshah al-Qiblah (الأَصْلُ الْمُطْلَق وَحِصَّةُ الْقِبْلَة)</span>
            <span className={`font-serif ${isNaskah ? 'text-[#7e4518]' : 'text-stone-400'}`}>قواعد الميقات</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 font-mono">
            <div className={`p-2 rounded-lg ${isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'}`}>
              Al-Ashl al-Mutlaq: <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{rubu.ashlMutlaq.toFixed(4)}</strong>
            </div>
            <div className={`p-2 rounded-lg ${isNaskah ? 'bg-[#ede2cd] text-[#2c1a0e]' : 'bg-stone-900 text-stone-200'}`}>
              Hishshah al-Qiblah: <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{rubu.hishshahKiblat.toFixed(4)}</strong>
            </div>
          </div>
        </div>

        {/* Step 5: Hasil Inhiraf & Sudut pada Busur Rubu' */}
        <div className={`p-3.5 rounded-xl border text-xs ${
          isNaskah
            ? 'bg-[#ede0c8] border-[#b08453]'
            : 'bg-gradient-to-r from-amber-950/70 via-stone-950 to-emerald-950/60 border-amber-600/40'
        }`}>
          <div className={`flex items-center justify-between font-bold mb-1 ${
            isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'
          }`}>
            <span>5. Kesimpulan Hasil Ukur pada Busur Rubu' Mujayyab</span>
            <span className={`font-serif text-sm ${isNaskah ? 'text-[#196336]' : 'text-emerald-400'}`}>اِنْحِرَافُ الْقِبْلَة</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="space-y-1">
              <div className={isNaskah ? 'text-[#634934]' : 'text-stone-400'}>Inhiraf (Deviasi dari Titik Barat):</div>
              <div className={`text-base font-bold font-mono ${isNaskah ? 'text-[#196336]' : 'text-emerald-300'}`}>
                {inhiraf.degrees}° {inhiraf.minutes}' {inhiraf.seconds}"
              </div>
              <div className={`text-[11px] font-medium ${isNaskah ? 'text-[#4d3624]' : 'text-stone-300'}`}>{inhiraf.directionText}</div>
            </div>

            <div className="space-y-1">
              <div className={isNaskah ? 'text-[#634934]' : 'text-stone-400'}>Azimuth Sejati (As-Simt):</div>
              <div className={`text-base font-bold font-mono ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`}>
                {azimuthTrue.toFixed(2)}° (Utara Sejati)
              </div>
              <div className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
                Azimuth Magnetik: <strong className={`font-mono ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>{azimuthMagnetic.toFixed(2)}°</strong> (Deklinasi Magnetik: {magneticDeclination}°)
              </div>
            </div>
          </div>

          <div className={`mt-3 pt-2.5 border-t flex flex-wrap justify-between gap-2 text-[11px] ${
            isNaskah ? 'border-[#cfbc9e] text-[#4d3624]' : 'border-stone-800/80 text-stone-300'
          }`}>
            <span>Panjang Bayangan Zhill (Skala 12 Jari): <strong className={`font-mono ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`}>{rubu.zhillMabsuth} ashabi'</strong></span>
            <span>Nilai Jayb Inhiraf: <strong className={`font-mono ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`}>{rubu.jaybInhiraf.toFixed(2)} / 60</strong></span>
          </div>
        </div>
      </div>

      {/* Classical Glossary / Mu'jam Falak */}
      <div className={`p-4 border rounded-2xl transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/90 border-stone-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
            isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
          }`}>
            <BookOpen className="w-4 h-4" />
            Istilah & Glosarium Kitab Falak Rubu' Mujayyab
          </div>
          <button
            onClick={() => setShowAllGlossary(!showAllGlossary)}
            className={`text-xs flex items-center gap-1 cursor-pointer ${
              isNaskah ? 'text-[#8c4e1a] hover:text-[#6a370e]' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <span>{showAllGlossary ? 'Ringkas' : 'Lihat Semua'}</span>
            {showAllGlossary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(showAllGlossary ? RUBU_GLOSSARY : RUBU_GLOSSARY.slice(0, 4)).map((term, index) => (
            <div key={index} className={`p-3 rounded-xl border text-xs ${
              isNaskah ? 'bg-[#f4ebd9] border-[#dfceb5]' : 'bg-stone-950 border-stone-800/80'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold font-serif text-base ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'}`}>{term.arabic}</span>
                <span className={`text-[11px] italic ${isNaskah ? 'text-[#7e4518]' : 'text-stone-400'}`}>{term.transliteration}</span>
              </div>
              <div className={`font-medium mb-1 ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>{term.indonesian}</div>
              <p className={`leading-relaxed text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>{term.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

