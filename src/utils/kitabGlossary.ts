export interface FalakTerm {
  arabic: string;
  transliteration: string;
  indonesian: string;
  explanation: string;
}

export const RUBU_GLOSSARY: FalakTerm[] = [
  {
    arabic: 'الرُّبْعُ الْمُجَيَّبُ',
    transliteration: "Ar-Rub'u Al-Mujayyab",
    indonesian: 'Kuadran Sinus (Instrumen Falak Klasik)',
    explanation: 'Instrumen astronomi berbentuk seperempat lingkaran (90 derajat) dari kuningan yang digunakan para ulama falak sejak abad pertengahan untuk hisab waktu salat, arah kiblat, ketinggian benda langit, dan fungsi trigonometri bola.',
  },
  {
    arabic: 'جَيْبُ مَبْسُوْط',
    transliteration: 'Jayb Mabsuth',
    indonesian: 'Sinus Horisontal (Mendatar)',
    explanation: 'Garis-garis sinus sejajar horizontal berjumlah 60 bagian (Ashba/Ajza) dari titik pusat (Markaz) ke busur luar.',
  },
  {
    arabic: 'جَيْبُ مَنْكُوْس',
    transliteration: 'Jayb Mankus',
    indonesian: 'Sinus Vertikal (Tegak)',
    explanation: 'Garis-garis sinus sejajar vertikal berjumlah 60 bagian yang tegak lurus terhadap Jayb Mabsuth.',
  },
  {
    arabic: 'قَوْسُ التِّسْعِيْنَ / قَوْسُ الإِرْتِفَاع',
    transliteration: "Qousut Tis'in / Qousul Irtifa'",
    indonesian: 'Busur 90 Derajat',
    explanation: 'Lengkungan seperempat lingkaran berskala 0° hingga 90° di mana setiap derajat terbagi menjadi menit dan pecahan hisab.',
  },
  {
    arabic: 'الْخَيْطُ وَالشَّاقُوْل',
    transliteration: 'Al-Khoith wasy Syakul',
    indonesian: 'Benang & Bandul Pemberat',
    explanation: 'Benang sutera yang digantungkan pada titik pusat (Markaz) instrumen dan diberi bandul pemberat untuk menandai sudut ketinggian (Irtifa) atau Inhiraf.',
  },
  {
    arabic: 'الْمُرِيْ',
    transliteration: 'Al-Muri',
    indonesian: 'Manik Penanda Benang',
    explanation: 'Sebuah manik geser yang bisa dipindah-pindah di sepanjang benang untuk menandai perpotongan garis sinus tertentu.',
  },
  {
    arabic: 'عَرْضُ الْبَلَد',
    transliteration: "Ardhul Balad (Phi / φ)",
    indonesian: 'Lintang Tempat (Derajat)',
    explanation: 'Jarak busur dari khatulistiwa ke lokasi pengamatan, bernilai positif di Utara dan negatif di Selatan.',
  },
  {
    arabic: 'طُوْلُ الْبَلَد',
    transliteration: 'Thulul Balad (Lambda / λ)',
    indonesian: 'Bujur Tempat (Derajat)',
    explanation: 'Jarak busur dari meridian utama (Greenwich) ke lokasi pengamatan, bernilai positif di Timur.',
  },
  {
    arabic: 'فَضْلُ الطُّوْلَيْن',
    transliteration: 'Fadhlut Thulain (Δλ)',
    indonesian: 'Selisih Bujur Tempat dengan Ka\'bah',
    explanation: 'Selisih antara bujur tempat pengamatan dengan bujur Ka\'bah di Makkah (39° 49\' 34" BT).',
  },
  {
    arabic: 'اِنْحِرَافُ الْقِبْلَة',
    transliteration: 'Inhiraf al-Qiblah',
    indonesian: 'Kemiringan/Deviasi Arah Kiblat',
    explanation: 'Sudut deviasi arah kiblat yang diukur dari titik mata angin terdekat (misal: di Indonesia diukur dari titik Barat serong ke Utara / B-U).',
  },
  {
    arabic: 'السِّمْت',
    transliteration: 'As-Simt (Azimuth)',
    indonesian: 'Azimuth Geodesik Sejati',
    explanation: 'Arah sudut lingkaran cakrawala dihitung searah jarum jam dari Utara Sejati (0° hingga 360°).',
  },
  {
    arabic: 'رَصْدُ الْقِبْلَة / اِسْتِوَاءُ أَعْظَم',
    transliteration: "Rashdul Qiblah / Istiwa' A'zham",
    indonesian: 'Kalibrasi Bayangan Kiblat',
    explanation: 'Metode kalibrasi arah kiblat terakurat menggunakan bayangan matahari, baik harian maupun saat matahari tepat berada di atas Ka\'bah (27/28 Mei pukul 16:18 WIB dan 15/16 Juli pukul 16:27 WIB).',
  },
];
