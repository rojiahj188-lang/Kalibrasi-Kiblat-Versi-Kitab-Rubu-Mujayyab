import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  Crosshair,
  CheckCircle2,
  Compass,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RubuGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAngle?: (angle: number) => void;
  qiblaAngle?: number;
}

interface GuideStep {
  title: string;
  arabicTitle: string;
  badge: string;
  concept: string;
  manualReading: string[];
  muriGuide?: string;
  interactiveAngle?: number;
  interactiveLabel?: string;
  tip: string;
}

export const RubuGuideModal: React.FC<RubuGuideModalProps> = ({
  isOpen,
  onClose,
  onApplyAngle,
  qiblaAngle = 24.3,
}) => {
  const { isNaskah } = useTheme();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps: GuideStep[] = [
    {
      title: 'Mengenal Anatomi Rubu\' Mujayyab',
      arabicTitle: 'أَجْزَاءُ الرُّبْعِ الْمُجَيَّبِ',
      badge: 'Bagian Dasar',
      concept:
        'Rubu\' Mujayyab adalah instrumen astrolab kuadran seperempat lingkaran (90°) astronomi klasik Islam yang diciptakan untuk menghitung hisab trigonometri bola (sinus, cosinus, sudut arah kiblat, dan waktu shalat) tanpa kalkulator elektronik.',
      manualReading: [
        'Markaz (الْمَرْكَز): Titik pusat poros sudut 90° tempat simpul benang sutera digantung.',
        'Qousut Tis\'in (قَوْسُ التِّسْعِيْن): Busur lengkung 90 derajat di bagian luar untuk membaca sudut ketinggian (Irtifa\') atau deviasi kiblat (Inhiraf).',
        'Khuthuthul Juyub (خُطُوْطُ الْجُيُوْب): Jaring-jaring kisi skala 60 (As-Sittin) horisontal dan vertikal.',
        'Al-Khoith (الْخَيْط): Benang sutera halus pemberat yang ditarik dari poros Markaz.',
        'Al-Muri / Al-Marwa (الْمُرِي): Manik kecil yang dapat digeser di sepanjang benang sebagai penanda titik koordinat hisab.',
        'Murabba\' az-Zhill (مُرَبَّعُ الظِّلّ): Kuadran bayangan dengan skala 12 Asba\' (jari) dan 7 Aqdam (kaki).',
      ],
      tip: 'Instrumen ini menggunakan basis 60 (Sittiniyah), di mana radius penuh kuadran R = 60 bagian.',
    },
    {
      title: 'Cara Membaca Busur Kuadran 90° (Qousut Tis\'in)',
      arabicTitle: 'قِرَاءَةُ قَوْسِ التِّسْعِيْن',
      badge: 'Busur Derajat',
      concept:
        'Busur kuadran bernilai 0° hingga 90°. Skala ini dibagi menjadi derajat (Darajah) dan menit busur (Daqiqah).',
      manualReading: [
        'Skala 0° terletak pada garis dasar horisontal (Ufuk / Khaththul Ufuq).',
        'Skala 90° terletak pada garis puncak vertikal (Zenith / Khaththus Samt).',
        'Untuk arah kiblat di Indonesia (posisi Ka\'bah berada di barat laut): sudut Inhiraf dihitung dari titik Barat (0°) menyusuri busur ke arah Utara.',
        'Jika inhiraf kiblat lokasi Anda adalah 24.3° B-U, maka benang ditarik persis melintasi angka 24 derajat 18 menit pada busur.',
      ],
      interactiveAngle: qiblaAngle,
      interactiveLabel: `Arahkan Benang ke Sudut Kiblat (${qiblaAngle.toFixed(1)}°)`,
      tip: 'Setiap 1 derajat busur kuadran setara dengan 60 menit busur (Daqiqah).',
    },
    {
      title: 'Fungsi & Cara Membaca Manik Muri (Al-Muri)',
      arabicTitle: 'تَحْرِيْكُ الْمُرِي وَضَبْطُهُ',
      badge: 'Kunci Manik Muri',
      concept:
        'Manik Muri (الْمُرِي) adalah mutiara penanda geser pada benang sutera. Muri berfungsi "merekam" atau mengunci nilai sinus tertentu sebelum benang digeser ke busur lain.',
      manualReading: [
        '1. Tempelkan benang pada busur sudut yang hendak dihitung (misal: sudut deklinasi matahari atau lintang tempat).',
        '2. Geser manik Muri ke atas benang tepat di persimpangan garis skala 60 yang dikehendaki (titik potong horisontal/vertikal).',
        '3. Tahan posisi Muri dengan jepitan jari ringan agar posisinya pada benang tidak bergeser.',
        '4. Ayunkan benang ke busur lain (misal: busur irtifa\' atau busur waktu).',
        '5. Baca di mana manik Muri memotong garis skala 60 di posisi baru: angka pada garis itulah hasil perhitungan sinus/waktu!',
      ],
      interactiveAngle: 45,
      interactiveLabel: 'Set Benang ke 45° (Titik Seimbang Sin = Cos)',
      tip: 'Dalam kitab falak klasik, manik Muri disebut "Al-Muri al-Muharrak" (manik bergerak) yang bertindak layaknya kursor memori register.',
    },
    {
      title: 'Membaca Skala 60 Sittin (Khuthuthul Juyub)',
      arabicTitle: 'خُطُوْطُ الْجُيُوْبِ وَحِسَابُ السِّتِّيْن',
      badge: 'Trigonometri 60',
      concept:
        'Dalam astronomi Islam, nilai perbandingan trigonometri tidak menggunakan desimal 0 s/d 1, melainkan bilangan bulat 0 s/d 60 (As-Sittin).',
      manualReading: [
        'Jayb Mabsuth (جَيْبُ مَبْسُوْط): Garis mendatar (proyeksi horisontal = Cosinus x 60).',
        'Jayb Mankus (جَيْبُ مَنْكُوْس): Garis tegak (proyeksi vertikal = Sinus x 60).',
        'Contoh pada sudut 30°: Jayb Mankus = 60 x sin(30°) = 30 bagian tepat.',
        'Jayb Mabsuth = 60 x cos(30°) = 51 bagian 58 detik (51.96).',
        'Nilai inilah yang dibaca pada garis grid berskala 60 ketika benang direntangkan.',
      ],
      interactiveAngle: 30,
      interactiveLabel: 'Set Benang ke Sudut Istimewa 30° (Sin = 30/60)',
      tip: 'Angka 60 dipilih oleh ulama falak karena memiliki banyak faktor pembagi: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, sehingga hisab pembagian tanpa pecahan rumit.',
    },
    {
      title: 'Membaca Kuadran Bayangan (Murabba\' az-Zhill)',
      arabicTitle: 'مُرَبَّعُ الظِّلِّ وَأَوْقَاتُ الصَّلَاةِ',
      badge: 'Bayangan Istiwa',
      concept:
        'Murabba\' az-Zhill berbentuk bujursangkar di pojok dalam kuadran untuk mengukur panjang bayangan matahari tongkat istiwa.',
      manualReading: [
        'Zhill Mabsuth (Cotangens): Skala 12 jari (Asba\') di sisi horisontal dan 7 kaki (Aqdam) di sisi vertikal.',
        'Membaca Waktu Dzuhur: Saat matahari tepat berada di garis meridian langit (Zawal), benang menunjukkan ketinggian maksimum dan bayangan terpendek.',
        'Membaca Waktu Ashar: Geser benang hingga manik Muri atau garis bayangan menunjukkan: Panjang Bayangan Istiwa + 12 jari (1 panjang tongkat).',
      ],
      interactiveAngle: 60,
      interactiveLabel: 'Set Benang ke Sudut 60° (Bayangan Pendek)',
      tip: 'Skala 12 Asba\' didasarkan pada tradisi lebar 12 jari jemari tangan manusia dewasa bila dirapatkan.',
    },
    {
      title: 'Langkah Praktik Lapangan Kalibrasi Arah Kiblat',
      arabicTitle: 'تَطْبِيْقُ تَعْيِيْنِ الْقِبْلَةِ عَمَلِيًّا',
      badge: 'Aplikasi Lapangan',
      concept:
        'Panduan resmi bagi Petugas KUA, Pengurus Takmir, dan Ahli Falak untuk menandai saf masjid secara presisi.',
      manualReading: [
        '1. Tentukan garis Utara-Selatan Sejati di lokasi masjid menggunakan kompas terkalibrasi atau bayang tongkat istiwa.',
        '2. Rentangkan benang Rubu\' Mujayyab persis pada sudut Inhiraf kiblat kota Anda (misal: 24.3°).',
        '3. Letakkan bilah tepi datar instrumen menghadap ke arah Barat sejati.',
        '4. Garis yang ditunjuk oleh benang adalah lurus mengarah tepat ke Ka\'bah al-Mukarramah.',
        '5. Tarik tali sipat atau sinar laser sejajar benang tersebut untuk melukis garis shaf masjid yang sah dan akurat.',
      ],
      interactiveAngle: qiblaAngle,
      interactiveLabel: `Kunci ke Sudut Kiblat Lokasi Anda (${qiblaAngle.toFixed(1)}°)`,
      tip: 'Untuk verifikasi 100% tanpa gangguan medan magnet, gunakan juga metode Rashdul Qiblah (bayang-bayang matahari langsung).',
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleApplyInteractive = () => {
    if (current.interactiveAngle !== undefined && onApplyAngle) {
      onApplyAngle(current.interactiveAngle);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 ${
      isNaskah ? 'bg-[#2b180d]/80 text-[#2c1a0e]' : 'bg-black/80 text-stone-100'
    }`}>
      <div className={`w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
        isNaskah
          ? 'bg-[#fbf7ee] border-[#b08453] text-[#2c1a0e]'
          : 'bg-stone-900 border-amber-600/40 text-stone-100'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isNaskah
            ? 'bg-[#f4ebd9] border-[#dfceb5]'
            : 'bg-gradient-to-r from-amber-950/90 via-stone-900 to-stone-950 border-amber-800/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
              isNaskah
                ? 'bg-[#ebdcc0] border-[#b08453] text-[#8c4e1a]'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-sm sm:text-base ${
                  isNaskah ? 'text-[#2c1a0e]' : 'text-amber-100'
                }`}>
                  Panduan Interaktif Rubu' Mujayyab
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                  isNaskah
                    ? 'bg-[#ede0c8] text-[#8c4e1a] border-[#b08453]'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  Langkah {currentStep + 1} dari {steps.length}
                </span>
              </div>
              <p className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
                Memahami pembacaan busur kuadran 90° dan manik Muri untuk pengguna awam
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isNaskah
                ? 'text-[#785c47] hover:text-[#2c1a0e] hover:bg-[#ede2cd]'
                : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
            title="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className={`w-full px-4 py-2 border-b flex items-center justify-between gap-1 ${
          isNaskah ? 'bg-[#ede2cd] border-[#dfceb5]' : 'bg-stone-950 border-stone-800'
        }`}>
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? (isNaskah ? 'bg-[#8c4e1a] shadow-sm' : 'bg-amber-500 shadow-sm shadow-amber-500/50')
                  : idx < currentStep
                  ? (isNaskah ? 'bg-[#b08453]' : 'bg-amber-800')
                  : (isNaskah ? 'bg-[#d8c5a8]' : 'bg-stone-800')
              }`}
              title={s.title}
            />
          ))}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Step Header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b ${
            isNaskah ? 'border-[#dfceb5]' : 'border-stone-800'
          }`}>
            <div>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${
                isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
              }`}>
                {current.badge}
              </span>
              <h4 className={`text-base sm:text-lg font-extrabold mt-0.5 ${
                isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'
              }`}>
                {current.title}
              </h4>
            </div>
            <span className={`font-serif text-base sm:text-lg sm:text-right ${
              isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300/80'
            }`}>
              {current.arabicTitle}
            </span>
          </div>

          {/* Core Concept */}
          <div className={`p-3 rounded-2xl border leading-relaxed ${
            isNaskah
              ? 'bg-[#f4ebd9] border-[#d8c5a8] text-[#3e2717]'
              : 'bg-stone-950/80 border-stone-800 text-stone-300'
          }`}>
            <p>{current.concept}</p>
          </div>

          {/* Reading Steps List */}
          <div className="space-y-2">
            <div className={`flex items-center gap-1.5 font-bold ${
              isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'
            }`}>
              <Sparkles className={`w-4 h-4 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
              <span>Kaidah & Cara Membaca:</span>
            </div>
            <div className="space-y-1.5 pl-1">
              {current.manualReading.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                    isNaskah
                      ? 'bg-[#f7efe2] border-[#d8c5a8]'
                      : 'bg-stone-950/50 border-stone-800/80'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isNaskah
                      ? 'bg-[#ede0c8] border border-[#b08453] text-[#8c4e1a]'
                      : 'bg-amber-950 border border-amber-600/30 text-amber-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`leading-relaxed ${isNaskah ? 'text-[#3e2717]' : 'text-stone-300'}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive simulator action button if available */}
          {current.interactiveAngle !== undefined && onApplyAngle && (
            <div className={`p-3 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isNaskah
                ? 'bg-[#ede0c8] border-[#b08453]'
                : 'bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border-amber-600/40'
            }`}>
              <div className="flex items-center gap-2">
                <Crosshair className={`w-4 h-4 shrink-0 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
                <span className={`font-medium ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>
                  Uji coba interaktif langsung pada kanvas Rubu':
                </span>
              </div>
              <button
                onClick={handleApplyInteractive}
                className={`px-3.5 py-2 font-bold rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isNaskah
                    ? 'bg-gradient-to-r from-[#945520] to-[#783e10] hover:from-[#7e4518] hover:to-[#68330a] text-[#fef9f0]'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950'
                }`}
              >
                <span>{current.interactiveLabel || 'Terapkan ke Benang'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Classical Tip */}
          <div className={`p-3 rounded-xl border flex items-start gap-2 text-[11px] ${
            isNaskah
              ? 'bg-[#f4ebd9] border-[#d8c5a8] text-[#634934]'
              : 'bg-stone-950/60 border-stone-800 text-stone-400'
          }`}>
            <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
            <div>
              <strong className={isNaskah ? 'text-[#2c1a0e]' : 'text-stone-300'}>Catatan Ahli Falak: </strong>
              <span>{current.tip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className={`p-4 border-t flex items-center justify-between gap-2 ${
          isNaskah ? 'bg-[#ede2cd] border-[#dfceb5]' : 'bg-stone-950 border-stone-800'
        }`}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              currentStep === 0
                ? (isNaskah ? 'opacity-40 cursor-not-allowed border-[#d8c5a8] text-[#a08b76]' : 'opacity-40 cursor-not-allowed border-stone-800 text-stone-600')
                : (isNaskah ? 'bg-[#fbf7ee] hover:bg-[#ede0c8] border-[#cfbc9e] text-[#2c1a0e]' : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-200')
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1">
            <span className={`text-[11px] ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              Topik: <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{current.badge}</strong>
            </span>
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl text-xs shadow transition-all cursor-pointer ${
                isNaskah
                  ? 'bg-gradient-to-r from-[#945520] to-[#783e10] hover:from-[#7e4518] hover:to-[#68330a] text-[#fef9f0]'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
              }`}
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl text-xs shadow transition-all cursor-pointer ${
                isNaskah
                  ? 'bg-gradient-to-r from-[#196336] to-[#124d29] hover:from-[#14532d] hover:to-[#0f3e20] text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-stone-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesai Membaca</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
