import React, { useState } from 'react';
import { Coordinates } from '../types/qibla';
import { PRESET_CITIES } from '../utils/astronomy';
import { MapPin, Navigation, Search, Check, Edit3 } from 'lucide-react';

interface LocationPickerProps {
  currentCoords: Coordinates;
  onSelectCoords: (coords: Coordinates) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ currentCoords, onSelectCoords }) => {
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [manualLat, setManualLat] = useState<string>(currentCoords.latitude.toString());
  const [manualLon, setManualLon] = useState<string>(currentCoords.longitude.toString());
  const [manualName, setManualName] = useState<string>(currentCoords.cityName || 'Lokasi Kustom');

  // Trigger GPS Geolocation
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        setIsLocating(false);
        const { latitude, longitude, altitude, accuracy } = position.coords;
        onSelectCoords({
          latitude,
          longitude,
          altitude: altitude ?? undefined,
          accuracy: accuracy ?? undefined,
          cityName: `GPS Akurat (±${Math.round(accuracy)}m)`,
          source: 'gps',
        });
      },
      error => {
        setIsLocating(false);
        let msg = 'Gagal mengakses GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi GPS ditolak oleh browser/sistem.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinyal GPS tidak tersedia saat ini.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Waktu permintaan GPS habis.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Submit manual coordinate form
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Lintang harus antara -90 hingga 90 derajat.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      alert('Bujur harus antara -180 hingga 180 derajat.');
      return;
    }

    onSelectCoords({
      latitude: lat,
      longitude: lon,
      cityName: manualName || `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      source: 'manual',
    });
    setIsManualInput(false);
  };

  // Filter preset cities
  const filteredCities = PRESET_CITIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Quick GPS button & Current active location badge */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-stone-900/90 border border-stone-800 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-stone-400">Lokasi Aktif Pengukuran:</div>
            <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <span>{currentCoords.cityName || 'Lokasi Terpilih'}</span>
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                {currentCoords.latitude.toFixed(4)}°, {currentCoords.longitude.toFixed(4)}°
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGetGPS}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Mencari GPS...' : 'Ambil GPS Saya'}</span>
          </button>

          <button
            onClick={() => setIsManualInput(!isManualInput)}
            className="flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs border border-stone-700 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Input Manual</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-3 bg-red-950/40 border border-red-700/50 rounded-xl text-xs text-red-300 flex items-center justify-between">
          <span>{gpsError}</span>
          <button
            onClick={() => setGpsError(null)}
            className="text-[11px] underline ml-2 text-red-200"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Manual Input Form */}
      {isManualInput && (
        <form
          onSubmit={handleSaveManual}
          className="p-4 bg-stone-900 border border-amber-600/30 rounded-2xl space-y-3"
        >
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5" />
            Masukkan Koordinat Titik Kiblat Baru
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Nama Tempat / Masjid:</label>
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Contoh: Masjid Jami Al-Huda"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Lintang Tempat (φ) [Desimal]:</label>
              <input
                type="number"
                step="any"
                value={manualLat}
                onChange={e => setManualLat(e.target.value)}
                placeholder="Contoh: -6.175"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Bujur Tempat (λ) [Desimal]:</label>
              <input
                type="number"
                step="any"
                value={manualLon}
                onChange={e => setManualLon(e.target.value)}
                placeholder="Contoh: 106.827"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsManualInput(false)}
              className="px-3 py-1.5 bg-stone-800 text-stone-400 hover:text-stone-200 rounded-lg text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
            >
              Terapkan Koordinat
            </button>
          </div>
        </form>
      )}

      {/* Preset Cities Search & List */}
      <div className="p-4 bg-stone-900/90 border border-stone-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-stone-300">
            Daftar Kota / Masjid Utama Indonesia & Dunia
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama kota..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredCities.map((city, idx) => {
            const isSelected =
              Math.abs(currentCoords.latitude - city.latitude) < 0.001 &&
              Math.abs(currentCoords.longitude - city.longitude) < 0.001;

            return (
              <button
                key={idx}
                onClick={() =>
                  onSelectCoords({
                    latitude: city.latitude,
                    longitude: city.longitude,
                    cityName: city.name,
                    source: 'preset',
                  })
                }
                className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between gap-1 ${
                  isSelected
                    ? 'bg-amber-950/60 border-amber-600/70 text-amber-200'
                    : 'bg-stone-950 hover:bg-stone-800/80 border-stone-800 text-stone-300'
                }`}
              >
                <div className="truncate">
                  <div className="font-medium truncate">{city.name}</div>
                  <div className="text-[10px] text-stone-500 truncate">{city.province}</div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
