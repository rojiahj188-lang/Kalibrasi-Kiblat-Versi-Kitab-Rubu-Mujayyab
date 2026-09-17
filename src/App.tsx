import React, { useState, useEffect } from 'react';
import { Coordinates, QiblaResult, CompassData } from './types/qibla';
import { calculateQibla, PRESET_CITIES } from './utils/astronomy';
import { CompassView } from './components/CompassView';
import { RubuCanvas } from './components/RubuCanvas';
import { ShadowCalibration } from './components/ShadowCalibration';
import { HisabDetails } from './components/HisabDetails';
import { LocationPicker } from './components/LocationPicker';
import { CalibrationReportModal } from './components/CalibrationReportModal';
import { CameraOverlay } from './components/CameraOverlay';
import { FalakCalculator } from './components/FalakCalculator';
import { HijriCalendarView } from './components/HijriCalendarView';
import { DeveloperProfileModal } from './components/DeveloperProfileModal';
import { FalakCharts } from './components/FalakCharts';
import {
  Compass as CompassIcon,
  CircleDot,
  Sun,
  BookOpen,
  MapPin,
  Award,
  Camera,
  Layers,
  Sparkles,
  Info,
  Calculator,
  CalendarDays,
  UserCheck,
  LineChart,
  Printer
} from 'lucide-react';

export default function App() {
  // Default coordinates: Gerung Lombok Barat (KUA Kec. Gerung)
  const [coords, setCoords] = useState<Coordinates>({
    latitude: -8.6830,
    longitude: 116.1264,
    cityName: 'Gerung (KUA Kec. Gerung / Lombok Barat)',
    source: 'preset',
  });

  // Calculate Qibla data dynamically
  const [qiblaData, setQiblaData] = useState<QiblaResult>(() => calculateQibla(coords));

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'compass' | 'rubu' | 'calculator' | 'calendar' | 'chart' | 'shadow' | 'camera' | 'hisab'>('compass');
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState<boolean>(false);

  // Recalculate Qibla when coordinates change
  useEffect(() => {
    const res = calculateQibla(coords);
    setQiblaData(res);
  }, [coords]);

  // Handle GPS auto-detect on initial load if permitted
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude ?? undefined,
            accuracy: pos.coords.accuracy ?? undefined,
            cityName: `GPS Lokasi Anda (±${Math.round(pos.coords.accuracy)}m)`,
            source: 'gps',
          });
        },
        () => {
          // If rejected or failed, silently fallback
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, []);

  const kemenagLogoUrl = "https://cdn.phototourl.com/free/2026-09-17-5722c6f5-9fa4-42f6-b77b-7fa64efea102.png";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header Bar */}
      <header className="w-full bg-stone-900/90 border-b border-amber-900/40 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 sm:px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Logo Kemenag */}
          <img
            src={kemenagLogoUrl}
            alt="Logo Kementerian Agama RI"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
              <CompassIcon className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-amber-100">
                Kalibrasi Kiblat Rubu' Mujayyab
              </h1>
              <span className="hidden sm:inline font-serif text-amber-400/80 text-xs">
                الرُّبْعُ الْمُجَيَّبُ
              </span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 sm:gap-2">
              <span>Kemenag Lombok Barat</span>
              <span className="text-stone-600">•</span>
              <span className="text-emerald-400 font-mono font-medium">
                Kiblat: {qiblaData.azimuthTrue.toFixed(1)}° ({qiblaData.inhiraf.directionText.split('(')[1]?.replace(')', '') || 'B-U'})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Developer Profile button */}
          <button
            onClick={() => setShowDeveloperModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-600/30 hover:border-amber-500 rounded-xl text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer"
            title="Profil Pengembang: Husni, S. Kom. I (Penyuluh KUA Kec. Gerung / IPARI Lombok Barat)"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Husni, S. Kom. I</span>
            <span className="lg:hidden">Pengembang</span>
          </button>

          {/* Location button */}
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showLocationPicker
                ? 'bg-amber-600 text-stone-950 border-amber-500 shadow'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title="Ubah Lokasi atau Gunakan GPS"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline truncate max-w-[120px]">{coords.cityName}</span>
            <span className="sm:hidden">Lokasi</span>
          </button>

          {/* Certificate & PDF Export button */}
          <button
            onClick={() => setShowCertificateModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-700/80 to-amber-600 text-stone-100 hover:from-amber-600 hover:to-amber-500 rounded-xl text-xs font-bold shadow transition-all active:scale-95 cursor-pointer"
            title="Buka Berita Acara & Ekspor PDF Kalibrasi Kiblat"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Ekspor PDF</span>
            <span className="md:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-3 py-4 sm:px-6 sm:py-6 flex flex-col gap-4">
        {/* Collapsible Location Picker */}
        {showLocationPicker && (
          <div className="mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <LocationPicker
              currentCoords={coords}
              onSelectCoords={newCoords => {
                setCoords(newCoords);
                setShowLocationPicker(false);
              }}
            />
          </div>
        )}

        {/* Navigation Tabs - Responsive Grid */}
        <div className="w-full grid grid-cols-4 sm:grid-cols-8 p-1 bg-stone-900 border border-stone-800 rounded-2xl gap-1 text-xs">
          <button
            onClick={() => setActiveTab('compass')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'compass'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <CompassIcon className="w-3.5 h-3.5" />
            <span className="truncate">Kompas</span>
          </button>

          <button
            onClick={() => setActiveTab('rubu')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'rubu'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span className="truncate">Rubu'</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="truncate">Kalkulator</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span className="truncate">Kalender</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span className="truncate">Grafik</span>
          </button>

          <button
            onClick={() => setActiveTab('shadow')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'shadow'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="truncate">Rashdul</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="truncate">AR Kamera</span>
          </button>

          <button
            onClick={() => setActiveTab('hisab')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 font-medium transition-all cursor-pointer ${
              activeTab === 'hisab'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">Kitab</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="w-full">
          {activeTab === 'compass' && (
            <CompassView qiblaData={qiblaData} coords={coords} />
          )}

          {activeTab === 'rubu' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full p-3.5 mb-3 bg-stone-900/80 border border-amber-900/40 rounded-2xl flex items-start gap-3">
                <CircleDot className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-300 leading-relaxed">
                  <span className="font-bold text-amber-200 block mb-0.5">
                    Simulasi Fisik Instrumen Rubu' Mujayyab (الرُّبْعُ الْمُجَيَّبُ - Sine Quadrant)
                  </span>
                  Instrumen kuningan astronomi Islam dengan radius skala 60 bagian (<em>As-Sittin</em>), busur kuadran 90 derajat (<em>Qousut Tis'in</em>), benang sutera (<em>Al-Khoith</em>), dan manik penanda (<em>Al-Muri</em>). Buka panduan interaktif atau geser manik Muri untuk menguji coba secara manual.
                </div>
              </div>

              <RubuCanvas qiblaData={qiblaData} />
            </div>
          )}

          {activeTab === 'calculator' && (
            <FalakCalculator
              currentCoords={coords}
              onApplyCoords={newCoords => setCoords(newCoords)}
            />
          )}

          {activeTab === 'calendar' && (
            <HijriCalendarView />
          )}

          {activeTab === 'chart' && (
            <FalakCharts coords={coords} qiblaData={qiblaData} />
          )}

          {activeTab === 'shadow' && (
            <ShadowCalibration coords={coords} qiblaData={qiblaData} />
          )}

          {activeTab === 'camera' && (
            <CameraOverlay
              qiblaData={qiblaData}
              currentHeading={qiblaData.azimuthTrue}
              pitch={0}
              roll={0}
              isLevel={true}
            />
          )}

          {activeTab === 'hisab' && (
            <HisabDetails qiblaData={qiblaData} coords={coords} />
          )}
        </div>
      </main>

      {/* Official Certificate & Report Modal with Kemenag Logo & PDF Export */}
      <CalibrationReportModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        coords={coords}
        qiblaData={qiblaData}
      />

      {/* Developer Profile Modal */}
      <DeveloperProfileModal
        isOpen={showDeveloperModal}
        onClose={() => setShowDeveloperModal(false)}
      />

      {/* Footer */}
      <footer className="w-full mt-auto py-6 border-t border-stone-900 bg-stone-950 text-center text-xs text-stone-400 px-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <img
              src={kemenagLogoUrl}
              alt="Logo Kementerian Agama RI"
              className="w-7 h-7 object-contain opacity-90"
              referrerPolicy="no-referrer"
            />
            <span className="font-semibold text-stone-300">Kementerian Agama Republik Indonesia</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-stone-300 text-[11px]">
            <span>Metode Falak:</span>
            <strong className="text-amber-300 font-serif">Kitab Rubu' Mujayyab (الرُّبْعُ الْمُجَيَّبُ)</strong>
            <span>& Algoritma Geodesik WGS84</span>
          </div>

          <div className="p-3 bg-stone-900/60 border border-stone-800/80 rounded-xl text-stone-300 text-[11px] leading-relaxed">
            <span className="text-amber-400 font-semibold block mb-0.5">
              Pengembang Aplikasi: Husni, S. Kom. I
            </span>
            <span>
              Penyuluh KUA Kecamatan Gerung • Pengurus IPARI Kemenag Lombok Barat • Alumni Yayasan Ponpes Darussalam dan STID Mustafa Ibrahim Al-Ishlahuddiny Kediri Lombok Barat, NTB.
            </span>
          </div>

          <div className="text-[10px] text-stone-500">
            Makkah al-Mukarramah: 21° 25' 21" LU, 39° 49' 34" BT • Presisi WGS84 Geodetic • Dukungan Offline PWA
          </div>
        </div>
      </footer>
    </div>
  );
}

