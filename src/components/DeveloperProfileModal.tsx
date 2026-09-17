import React from 'react';
import { X, UserCheck, Award, GraduationCap, Building2, MapPin, HeartHandshake, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({ isOpen, onClose }) => {
  const { isNaskah } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto ${
      isNaskah ? 'bg-[#2b180d]/80 text-[#2c1a0e]' : 'bg-stone-950/80 text-stone-100'
    }`}>
      <div className={`relative border rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 transition-colors ${
        isNaskah
          ? 'bg-[#fbf7ee] border-[#b08453] text-[#2c1a0e]'
          : 'bg-stone-900 border-amber-500/40 text-stone-100'
      }`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
            isNaskah
              ? 'text-[#785c47] hover:text-[#2c1a0e] hover:bg-[#ede2cd]'
              : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
          }`}
          title="Tutup Profil"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className={`flex items-center gap-3 pb-4 border-b ${
          isNaskah ? 'border-[#dfceb5]' : 'border-stone-800'
        }`}>
          <img
            src="https://cdn.phototourl.com/free/2026-09-17-5722c6f5-9fa4-42f6-b77b-7fa64efea102.png"
            alt="Logo Kementerian Agama RI"
            className="w-14 h-14 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
              isNaskah ? 'bg-[#f2e6d2]' : 'bg-stone-950'
            }`}>
              <UserCheck className={`w-6 h-6 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
            </div>
          </div>
          <div>
            <span className={`text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1 ${
              isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" /> Pengembang Aplikasi Falak
            </span>
            <h2 className={`text-xl sm:text-2xl font-bold ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
              Husni, S. Kom. I
            </h2>
            <p className={`text-xs ${isNaskah ? 'text-[#694e39]' : 'text-stone-400'}`}>
              Penyuluh KUA Kec. Gerung & Pengurus IPARI Kemenag Lombok Barat
            </p>
          </div>
        </div>

        {/* Main Details Body */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Card 1: Instansi & Jabatan */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isNaskah
              ? 'bg-[#f4ebd9] border-[#d8c5a8]'
              : 'bg-stone-950/80 border-stone-800 hover:border-amber-900/60'
          }`}>
            <div className="flex items-start gap-3">
              <Building2 className={`w-5 h-5 shrink-0 mt-0.5 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
              <div>
                <span className={`font-semibold block text-[11px] uppercase tracking-wider ${
                  isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300/90'
                }`}>
                  Jabatan & Instansi
                </span>
                <p className={`font-bold text-sm mt-0.5 ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
                  Penyuluh KUA Kecamatan Gerung
                </p>
                <p className={`text-xs mt-0.5 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
                  Kantor Urusan Agama (KUA) Kec. Gerung, Jl. Gatot Subroto Gerung Utara, Kantor Kementerian Agama Kabupaten Lombok Barat, NTB.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Organisasi Profesi */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isNaskah
              ? 'bg-[#f4ebd9] border-[#d8c5a8]'
              : 'bg-stone-950/80 border-stone-800 hover:border-amber-900/60'
          }`}>
            <div className="flex items-start gap-3">
              <Award className={`w-5 h-5 shrink-0 mt-0.5 ${isNaskah ? 'text-[#196336]' : 'text-emerald-400'}`} />
              <div>
                <span className={`font-semibold block text-[11px] uppercase tracking-wider ${
                  isNaskah ? 'text-[#196336]' : 'text-emerald-400/90'
                }`}>
                  Organisasi Profesi
                </span>
                <p className={`font-bold text-sm mt-0.5 ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
                  Pengurus IPARI Kemenag Lombok Barat
                </p>
                <p className={`text-xs mt-0.5 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
                  Ikatan Penyuluh Agama Republik Indonesia (IPARI) Pengurus Daerah Kabupaten Lombok Barat.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Almamater & Pesantren */}
          <div className={`p-4 rounded-2xl border transition-colors ${
            isNaskah
              ? 'bg-[#f4ebd9] border-[#d8c5a8]'
              : 'bg-stone-950/80 border-stone-800 hover:border-amber-900/60'
          }`}>
            <div className="flex items-start gap-3">
              <GraduationCap className={`w-5 h-5 shrink-0 mt-0.5 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
              <div>
                <span className={`font-semibold block text-[11px] uppercase tracking-wider ${
                  isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400/90'
                }`}>
                  Almamater & Pendidikan
                </span>
                <p className={`font-bold text-sm mt-0.5 ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
                  Alumni Yayasan Ponpes Darussalam & STID Mustafa Ibrahim Al-Ishlahuddiny
                </p>
                <p className={`text-xs mt-0.5 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
                  Kediri, Kabupaten Lombok Barat, Nusa Tenggara Barat.
                </p>
              </div>
            </div>
          </div>

          {/* Dedikasi & Misi Ilmiah */}
          <div className={`p-4 rounded-2xl border leading-relaxed ${
            isNaskah
              ? 'bg-[#ede0c8] border-[#b08453] text-[#3d2717]'
              : 'bg-gradient-to-br from-amber-950/30 to-stone-900 border-amber-600/30 text-stone-300'
          }`}>
            <div className={`flex items-center gap-2 font-bold mb-1.5 ${
              isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
            }`}>
              <BookOpen className="w-4 h-4" />
              <span>Khidmah & Dedikasi Pengembangan Falak:</span>
            </div>
            <p>
              Aplikasi ini dikembangkan sebagai wujud khidmah keilmuan untuk melestarikan metode klasik astronomi Islam Nusantara berbasis <strong>Kitab Rubu' Mujayyab (الرُّبْعُ الْمُجَيَّبُ)</strong> yang diajarkan di pondok pesantren, dan mengintegrasikannya dengan kalkulasi digital modern, GPS, serta sensor arah ponsel cerdas demi mempermudah kalibrasi arah kiblat dan penentuan waktu ibadah yang presisi di tengah masyarakat.
            </p>
          </div>

          {/* Lokasi Layanan */}
          <div className={`flex items-center justify-between p-3 rounded-xl border text-[11px] ${
            isNaskah
              ? 'bg-[#f4ebd9] border-[#d8c5a8] text-[#634934]'
              : 'bg-stone-950 border-stone-800 text-stone-400'
          }`}>
            <div className="flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
              <span>Jl. Gatot Subroto Gerung Utara, Lombok Barat, NTB</span>
            </div>
            <span className={`font-mono font-medium ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`}>Kemenag NTB</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
              isNaskah
                ? 'bg-gradient-to-r from-[#945520] to-[#783e10] hover:from-[#7e4518] hover:to-[#68330a] text-[#fef9f0]'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

