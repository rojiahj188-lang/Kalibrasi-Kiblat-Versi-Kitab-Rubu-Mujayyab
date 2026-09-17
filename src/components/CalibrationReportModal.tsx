import React, { useRef, useState } from 'react';
import { Coordinates, QiblaResult } from '../types/qibla';
import { Award, Printer, X, CheckCircle2, Compass, Download, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface CalibrationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  coords: Coordinates;
  qiblaData: QiblaResult;
}

export const CalibrationReportModal: React.FC<CalibrationReportModalProps> = ({
  isOpen,
  onClose,
  coords,
  qiblaData,
}) => {
  const { isNaskah } = useTheme();
  const printRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Local asset for offline & zero CORS restrictions
  const kemenagLogoUrl = "/kemenag-logo.png";
  const bimasLogoUrl = "/bimas-islam.png";
  const bimasOriginalLink = "https://cdn.phototourl.com/free/2026-09-17-e1ba9d95-0abe-4d0c-bc70-323f1f0df473.jpg";

  // Native Vector PDF generation fallback (100% immune to CSS / browser color parsing bugs)
  const generateNativePDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Page: 210 x 297 mm
    // Decorative double border
    doc.setDrawColor(176, 132, 83); // #b08453 antique gold
    doc.setLineWidth(1.0);
    doc.rect(10, 10, 190, 277);

    doc.setDrawColor(216, 197, 168);
    doc.setLineWidth(0.4);
    doc.rect(12, 12, 186, 273);

    // Kemenag Logo (Left side)
    try {
      const logoImg = new Image();
      logoImg.src = kemenagLogoUrl;
      await new Promise((resolve) => {
        if (logoImg.complete) {
          resolve(true);
        } else {
          logoImg.onload = () => resolve(true);
          logoImg.onerror = () => resolve(false);
        }
      });
      doc.addImage(logoImg, 'PNG', 16, 16, 18, 18);
    } catch {
      // Continue without logo if blocked
    }

    // Bimas Islam Logo (Right side, sejajar dengan logo Kemenag RI, tanpa background putih)
    try {
      const bimasImg = new Image();
      bimasImg.src = bimasLogoUrl;
      await new Promise((resolve) => {
        if (bimasImg.complete) {
          resolve(true);
        } else {
          bimasImg.onload = () => resolve(true);
          bimasImg.onerror = () => resolve(false);
        }
      });
      doc.addImage(bimasImg, 'PNG', 176, 16, 18, 16);
    } catch {
      // Continue without logo if blocked
    }

    // Kop Surat Text (Center Aligned)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('KANTOR KEMENTERIAN AGAMA KABUPATEN LOMBOK BARAT', 105, 25, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text('KANTOR URUSAN AGAMA KECAMATAN GERUNG', 105, 29.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text('Alamat: Jl. Gatot Subroto Gerung Utara Lombok Barat', 105, 33.5, { align: 'center' });

    // Double horizontal separator
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.8);
    doc.line(16, 37, 194, 37);
    doc.setDrawColor(210, 200, 190);
    doc.setLineWidth(0.3);
    doc.line(16, 38.2, 194, 38.2);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(180, 83, 9);
    doc.text('BERITA ACARA & SERTIFIKAT AKURASI ARAH KIBLAT', 105, 47, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    doc.text("Berdasarkan Hisab Falak Kitab Rubu' Mujayyab & Kalibrasi Sensor Geodesik", 105, 51.5, { align: 'center' });

    // Introductory text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    doc.text('Menerangkan bahwa telah dilakukan pengukuran, verifikasi, dan kalibrasi arah kiblat dengan data astronomi:', 16, 60);

    // Location Data Box
    doc.setFillColor(248, 246, 240);
    doc.setDrawColor(220, 215, 200);
    doc.setLineWidth(0.4);
    doc.roundedRect(16, 64, 178, 28, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Nama Lokasi / Masjid:', 20, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(coords.cityName || 'Masjid / Lokasi Pengukuran', 65, 70);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Tanggal Pengukuran:', 20, 76);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text(todayStr, 65, 76);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Lintang Tempat (φ):', 20, 82);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text(`${coords.latitude.toFixed(6)}°`, 65, 82);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Bujur Tempat (λ):', 20, 88);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text(`${coords.longitude.toFixed(6)}°`, 65, 88);

    // Measurement Results Box
    doc.setFillColor(254, 250, 242);
    doc.setDrawColor(180, 83, 9);
    doc.setLineWidth(0.5);
    doc.roundedRect(16, 97, 178, 36, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(180, 83, 9);
    doc.text('HASIL PENGUKURAN KIBLAT:', 20, 103.5);

    // Result Columns
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text('Azimuth Sejati (As-Simt):', 20, 110);
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`${qiblaData.azimuthTrue.toFixed(2)}° (Utara Sejati)`, 20, 115.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text('Inhiraf (Deviasi dari Titik Barat):', 110, 110);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text(`${qiblaData.inhiraf.degrees}° ${qiblaData.inhiraf.minutes}' ${qiblaData.inhiraf.seconds}"`, 110, 115.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(qiblaData.inhiraf.directionText, 110, 119.5);

    doc.setDrawColor(220, 215, 200);
    doc.setLineWidth(0.3);
    doc.line(20, 122.5, 190, 122.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Azimuth Magnetik: ${qiblaData.azimuthMagnetic.toFixed(2)}°`, 20, 127.5);
    doc.text(`Jarak ke Ka'bah: ${qiblaData.distanceKm.toLocaleString('id-ID')} km`, 110, 127.5);

    // Verification Box
    doc.setFillColor(245, 248, 245);
    doc.setDrawColor(190, 215, 195);
    doc.roundedRect(16, 138, 178, 30, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text('STATUS VERIFIKASI: SAH & AKURAT MENURUT KAIDAH ILMU FALAK', 20, 144.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text("Dikalibrasi dengan instrumen Rubu' Mujayyab (Kuadran Sinus 60 As-Sittin) dan dikonfirmasi", 20, 149.5);
    doc.text("melalui algoritma hisab trigonometri bola presisi tinggi WGS84 geodesik.", 20, 153.5);

    doc.setDrawColor(215, 225, 215);
    doc.line(20, 156.5, 190, 156.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(140, 70, 10);
    doc.text("Pengembang & Petugas Falak: Husni, S. Kom. I — Penyuluh KUA Kec. Gerung, Pengurus IPARI Lobar", 20, 160.5);
    doc.setFont('helvetica', 'normal');
    doc.text("Alumni Yayasan Ponpes Darussalam & STID Mustafa Ibrahim Al-Ishlahuddiny Kediri Lombok Barat.", 20, 164.5);

    // Signatures Area (Clean open space for signatures without horizontal lines)
    const sigY = 188;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text('Petugas Pengukur / Ahli Falak:', 50, sigY, { align: 'center' });
    doc.text('Pengurus / Takmir Masjid:', 150, sigY, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('Husni, S. Kom. I', 50, sigY + 22, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text('Penyuluh KUA Kec. Gerung / IPARI', 50, sigY + 26.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('( .................................................. )', 150, sigY + 22, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(90, 90, 90);
    doc.text('Ketua / Pengurus Takmir', 150, sigY + 26.5, { align: 'center' });

    const safeCity = coords.cityName ? coords.cityName.replace(/[^a-zA-Z0-9]/g, '_') : 'Lokasi';
    doc.save(`Sertifikat_Kiblat_${safeCity}_KUA_Gerung.pdf`);
  };

  // Real client-side PDF generation using html-to-image (SVG foreignObject natively supports oklch)
  // with automatic fallback to native vector jsPDF
  const handleExportPDF = async () => {
    if (!printRef.current || isExportingPDF) return;
    setIsExportingPDF(true);
    setPrintNotice(null);

    const safeCity = coords.cityName ? coords.cityName.replace(/[^a-zA-Z0-9]/g, '_') : 'Lokasi';
    const fileName = `Sertifikat_Kiblat_${safeCity}_KUA_Gerung.pdf`;

    try {
      const element = printRef.current;
      
      let dataUrl: string | null = null;
      try {
        // html-to-image uses native browser SVG serialization, which supports oklch natively!
        dataUrl = await toPng(element, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: false,
          skipFonts: true,
        });
      } catch (imgErr) {
        console.warn('html-to-image rendering notice, switching to vector engine:', imgErr);
        dataUrl = null;
      }

      if (dataUrl) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // A4 page dimensions: 210mm x 297mm
        const margin = 10;
        const pdfWidth = 210 - margin * 2;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          }
        });

        const imgHeight = (img.height * pdfWidth) / (img.width || 1);
        pdf.addImage(dataUrl, 'PNG', margin, margin, pdfWidth, Math.min(imgHeight, 277));
        pdf.save(fileName);
      } else {
        // Fallback directly to crisp native vector PDF
        await generateNativePDF();
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (error) {
      console.error('Visual capture notice, generating vector PDF:', error);
      try {
        await generateNativePDF();
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3500);
      } catch (fallbackErr) {
        console.error('All PDF engines failed, offering txt:', fallbackErr);
        handleDownloadData();
        setPrintNotice('Unduhan dialihkan ke format teks resmi.');
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Direct print with fallback if iframe policy restricts window.print
  const handlePrint = () => {
    setPrintNotice(null);
    try {
      window.print();
    } catch (err) {
      console.warn('Browser print dialog was restricted in iframe:', err);
      setPrintNotice('Pencetakan langsung dibatasi oleh sistem browser. Silakan gunakan tombol "Unduh PDF (.pdf)".');
      setTimeout(() => setPrintNotice(null), 6000);
    }
  };

  const handleDownloadData = () => {
    const reportText = `BERITA ACARA & SERTIFIKAT AKURASI ARAH KIBLAT
KEMENTERIAN AGAMA REPUBLIK INDONESIA
KANTOR KEMENTERIAN AGAMA KABUPATEN LOMBOK BARAT
KANTOR URUSAN AGAMA KECAMATAN GERUNG
Alamat Kantor        : Jl. Gatot Subroto Gerung Utara, Lombok Barat, NTB

Lokasi / Masjid      : ${coords.cityName || 'Masjid / Lokasi Pengukuran'}
Tanggal Kalibrasi    : ${todayStr}
Lintang Tempat (φ)   : ${coords.latitude.toFixed(6)}°
Bujur Tempat (λ)     : ${coords.longitude.toFixed(6)}°
Azimuth Sejati       : ${qiblaData.azimuthTrue.toFixed(2)}° (dari Utara Sejati ke Timur)
Inhiraf Kiblat       : ${qiblaData.inhiraf.degrees}° ${qiblaData.inhiraf.minutes}' ${qiblaData.inhiraf.seconds}" (${qiblaData.inhiraf.directionText})
Azimuth Magnetik     : ${qiblaData.azimuthMagnetic.toFixed(2)}°
Jarak ke Ka'bah      : ${qiblaData.distanceKm.toLocaleString('id-ID')} km
Metode Hisab         : Kitab Rubu' Mujayyab & Geodesik WGS84
Petugas / Ahli Falak : Husni, S. Kom. I (Penyuluh KUA Kec. Gerung / Pengurus IPARI Lombok Barat)
Status Kalibrasi     : Sah & Akurat Menurut Kaidah Ilmu Falak
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sertifikat_Kiblat_${coords.cityName?.replace(/\s+/g, '_') || 'Lokasi'}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const summary = `🕌 *HASIL KALIBRASI ARAH KIBLAT*
Lokasi: ${coords.cityName || 'Masjid'}
Alamat KUA: Jl. Gatot Subroto Gerung Utara, Lombok Barat
Arah Kiblat: ${qiblaData.azimuthTrue.toFixed(2)}° (${qiblaData.inhiraf.degrees}° ${qiblaData.inhiraf.minutes}' ${qiblaData.inhiraf.seconds}" ${qiblaData.inhiraf.directionText})
Jarak ke Ka'bah: ${qiblaData.distanceKm.toLocaleString('id-ID')} km
Petugas Falak: Husni, S. Kom. I (Penyuluh KUA Kec. Gerung / IPARI Lombok Barat)
Instrumen: Rubu' Mujayyab & Sensor Geodesik.`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`relative border rounded-3xl max-w-2xl w-full p-3.5 sm:p-6 shadow-2xl my-auto transition-colors ${
        isNaskah ? 'bg-[#f7f1e4] border-[#b08453] text-[#2c1a0e]' : 'bg-stone-900 border-amber-600/40 text-stone-100'
      }`}>
        {/* Top Action Bar */}
        <div className={`flex flex-wrap items-center justify-between pb-3 border-b mb-3.5 gap-2 print:hidden ${
          isNaskah ? 'border-[#dfceb5]' : 'border-stone-800'
        }`}>
          <div className="flex items-center gap-2">
            <Award className={`w-4 h-4 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
            <span className={`font-bold text-xs sm:text-sm ${isNaskah ? 'text-[#2c1a0e]' : 'text-amber-200'}`}>
              Berita Acara & Sertifikat Kiblat
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Direct PDF Download Button (Always Unlocked & Functional) */}
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60 ${
                isNaskah
                  ? 'bg-[#8c4e1a] hover:bg-[#733f14] text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
              }`}
              title="Unduh langsung berkas dokumen PDF (.pdf) resmi tanpa batasan browser"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>PDF Terunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF (.pdf)</span>
                </>
              )}
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                isNaskah
                  ? 'bg-[#ede2cd] hover:bg-[#dfceb5] border-[#cfbc9e] text-[#2c1a0e]'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
              }`}
              title="Cetak Dokumen"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cetak</span>
            </button>

            {/* Copy Summary Button */}
            <button
              onClick={handleCopySummary}
              className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isNaskah
                  ? 'bg-[#ede2cd] hover:bg-[#dfceb5] border-[#cfbc9e] text-[#2c1a0e]'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
              }`}
              title="Salin Ringkasan untuk WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isNaskah ? 'text-[#785c47] hover:bg-[#ede2cd]' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice alert banner if print blocked */}
        {printNotice && (
          <div className="mb-3 p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center gap-2 print:hidden">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{printNotice}</span>
          </div>
        )}

        {/* Printable Certificate Sheet (Reduced, Balanced & Refined Font Sizes) */}
        <div
          ref={printRef}
          className={`p-4 sm:p-6 rounded-2xl border-2 relative overflow-hidden transition-colors ${
            isNaskah
              ? 'bg-[#fcf9f2] border-[#b08453] text-[#2c1a0e]'
              : 'bg-stone-950 border-amber-500/40 text-stone-100'
          }`}
        >
          {/* Watermark Logo Motif */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Compass className={`w-72 h-72 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-500'}`} />
          </div>

          {/* Official Kop Surat with Kemenag RI & Ditjen Bimas Islam Logos */}
          <div className={`pb-3 border-b-2 mb-3 relative flex items-center justify-between gap-2 sm:gap-3 ${
            isNaskah ? 'border-[#b08453]' : 'border-amber-500/40'
          }`}>
            {/* Logo Kemenag RI (Kiri) */}
            <img
              src={kemenagLogoUrl}
              alt="Logo Kementerian Agama RI"
              className="w-11 h-11 sm:w-13 sm:h-13 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />

            {/* Teks Kop Surat Instansi (Tengah / Center) */}
            <div className="flex-1 text-center px-1 sm:px-2">
              <div className={`text-[8.5px] sm:text-[9.5px] font-semibold uppercase tracking-wider ${
                isNaskah ? 'text-[#634934]' : 'text-stone-300'
              }`}>
                KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </div>
              <div className={`text-[10px] sm:text-[11.5px] font-extrabold uppercase tracking-wide leading-tight ${
                isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
              }`}>
                KANTOR KEMENTERIAN AGAMA KABUPATEN LOMBOK BARAT
              </div>
              <div className={`text-[9.5px] sm:text-[10.5px] font-bold uppercase leading-tight ${
                isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'
              }`}>
                KANTOR URUSAN AGAMA KECAMATAN GERUNG
              </div>
              <div className={`text-[8px] sm:text-[8.5px] mt-0.5 ${
                isNaskah ? 'text-[#785c47]' : 'text-stone-400'
              }`}>
                Alamat: Jl. Gatot Subroto Gerung Utara Lombok Barat
              </div>
            </div>

            {/* Logo Ditjen Bimas Islam (Kanan, Sejajar dengan Logo Kemenag RI, Tanpa Background Putih) */}
            <img
              src={bimasLogoUrl}
              alt="Logo Bimas Islam Kementerian Agama RI"
              className="w-11 h-11 sm:w-13 sm:h-13 object-contain shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = bimasOriginalLink;
              }}
            />
          </div>

          {/* Certificate Title - Proportional & Compact */}
          <div className="text-center pb-2 mb-2">
            <div className={`font-serif text-base sm:text-lg font-bold mb-0.5 tracking-wide ${
              isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
            }`}>
              شَهَادَةُ تَحْقِيْقِ سِمْتِ الْقِبْلَةِ
            </div>
            <div className={`text-xs sm:text-sm font-bold uppercase tracking-wider leading-snug ${
              isNaskah ? 'text-[#2c1a0e]' : 'text-amber-100'
            }`}>
              BERITA ACARA & SERTIFIKAT AKURASI ARAH KIBLAT
            </div>
            <div className={`text-[9px] sm:text-[9.5px] mt-0.5 ${
              isNaskah ? 'text-[#634934]' : 'text-stone-400'
            }`}>
              Berdasarkan Hisab Falak Kitab Rubu' Mujayyab & Kalibrasi Sensor Geodesik
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-2.5 text-[9.5px] sm:text-[10px] leading-relaxed">
            <p className={isNaskah ? 'text-[#4d3625]' : 'text-stone-300'}>
              Menerangkan bahwa telah dilakukan pengukuran, verifikasi, dan kalibrasi arah kiblat dengan data hisab astronomi sebagai berikut:
            </p>

            {/* Location Data Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 sm:p-3 rounded-xl border ${
              isNaskah ? 'bg-[#f5ebd9] border-[#d8c5a8]' : 'bg-stone-900/80 border-stone-800'
            }`}>
              <div>
                <span className={`block text-[8.5px] sm:text-[9px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Nama Lokasi / Masjid:
                </span>
                <span className={`font-semibold text-[10.5px] sm:text-xs block truncate ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
                  {coords.cityName || 'Masjid / Lokasi Pengukuran'}
                </span>
              </div>
              <div>
                <span className={`block text-[8.5px] sm:text-[9px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Tanggal Pengukuran:
                </span>
                <span className={`font-semibold text-[10.5px] sm:text-xs block ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
                  {todayStr}
                </span>
              </div>
              <div>
                <span className={`block text-[8.5px] sm:text-[9px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Lintang Tempat (φ):
                </span>
                <span className={`font-mono font-bold text-[10.5px] sm:text-xs ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`}>
                  {coords.latitude.toFixed(6)}°
                </span>
              </div>
              <div>
                <span className={`block text-[8.5px] sm:text-[9px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Bujur Tempat (λ):
                </span>
                <span className={`font-mono font-bold text-[10.5px] sm:text-xs ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`}>
                  {coords.longitude.toFixed(6)}°
                </span>
              </div>
            </div>

            {/* Measurement Results */}
            <div className={`p-2.5 sm:p-3 rounded-xl border space-y-1.5 ${
              isNaskah
                ? 'bg-[#ede0c8] border-[#b08453]'
                : 'bg-amber-950/30 border-amber-600/40'
            }`}>
              <div className={`text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider ${
                isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'
              }`}>
                HASIL PENGUKURAN KIBLAT:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className={`text-[8.5px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                    Azimuth Sejati (As-Simt):
                  </span>
                  <div className={`text-xs sm:text-sm font-bold font-mono ${
                    isNaskah ? 'text-[#2c1a0e]' : 'text-amber-200'
                  }`}>
                    {qiblaData.azimuthTrue.toFixed(2)}° (Utara Sejati)
                  </div>
                </div>
                <div>
                  <span className={`text-[8.5px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                    Inhiraf (Deviasi dari Barat):
                  </span>
                  <div className={`text-xs sm:text-sm font-bold font-mono ${
                    isNaskah ? 'text-[#196336]' : 'text-emerald-400'
                  }`}>
                    {qiblaData.inhiraf.degrees}° {qiblaData.inhiraf.minutes}' {qiblaData.inhiraf.seconds}"
                  </div>
                  <div className={`text-[8.5px] ${isNaskah ? 'text-[#634934]' : 'text-stone-300'}`}>
                    {qiblaData.inhiraf.directionText}
                  </div>
                </div>
              </div>

              <div className={`pt-1.5 border-t text-[9px] flex justify-between ${
                isNaskah ? 'border-[#d8c5a8] text-[#634934]' : 'border-amber-700/30 text-stone-300'
              }`}>
                <span>Azimuth Magnetik: <strong>{qiblaData.azimuthMagnetic.toFixed(2)}°</strong></span>
                <span>Jarak ke Ka'bah: <strong>{qiblaData.distanceKm.toLocaleString('id-ID')} km</strong></span>
              </div>
            </div>

            {/* Verification Statement */}
            <div className={`p-2.5 rounded-xl border text-[8.5px] sm:text-[9px] space-y-1 ${
              isNaskah ? 'bg-[#f5ebd9] border-[#d8c5a8]' : 'bg-stone-900/60 border-stone-800'
            }`}>
              <div className={`flex items-center gap-1.5 font-bold ${
                isNaskah ? 'text-[#196336]' : 'text-emerald-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Status Verifikasi: Sah & Akurat Menurut Kaidah Ilmu Falak</span>
              </div>
              <p className={isNaskah ? 'text-[#634934]' : 'text-stone-400'}>
                Dikalibrasi dengan instrumen Rubu' Mujayyab (Kuadran Sinus 60 Sittin) dan dikonfirmasi melalui algoritma hisab trigonometri bola presisi tinggi WGS84.
              </p>
              <p className={`text-[8px] sm:text-[8.5px] pt-1 border-t leading-tight ${
                isNaskah ? 'border-[#dfceb5] text-[#8c4e1a]' : 'border-stone-800 text-amber-400/90'
              }`}>
                Pengembang & Petugas Falak: <strong>Husni, S. Kom. I</strong> — Penyuluh KUA Kec. Gerung (Jl. Gatot Subroto Gerung Utara Lombok Barat), Pengurus IPARI Kemenag Lombok Barat, Alumni Ponpes Darussalam & STID Mustafa Ibrahim Al-Ishlahuddiny Kediri Lombok Barat.
              </p>
            </div>

            {/* Signatures Area (Garis di posisi tanda tangan telah dihapus/dikosongkan) */}
            <div className="pt-3 grid grid-cols-2 gap-4 text-center text-[9.5px]">
              <div>
                <div className={`mb-10 sm:mb-12 ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Petugas Pengukur / Ahli Falak:
                </div>
                <div className={`font-bold text-[10.5px] sm:text-xs ${
                  isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'
                }`}>
                  Husni, S. Kom. I
                </div>
                <div className={`text-[8px] sm:text-[8.5px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Penyuluh KUA Kec. Gerung / IPARI Lobar
                </div>
              </div>

              <div>
                <div className={`mb-10 sm:mb-12 ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Pengurus / Takmir Masjid:
                </div>
                <div className={`font-bold text-[10.5px] sm:text-xs ${
                  isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'
                }`}>
                  ( .................................................. )
                </div>
                <div className={`text-[8px] sm:text-[8.5px] ${isNaskah ? 'text-[#785c47]' : 'text-stone-400'}`}>
                  Ketua / Pengurus Takmir
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
