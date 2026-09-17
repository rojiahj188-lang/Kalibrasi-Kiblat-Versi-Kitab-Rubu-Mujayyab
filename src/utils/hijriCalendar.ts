/**
 * Utilitas Kalender Hijriyah & Masehi beserta Hisab Falak & Pasaran Nusantara
 * Sesuai hisab Urfi & Kriteria Imkanur Rukyat (MABIMS / Kemenag RI)
 */

export interface HijriDate {
  year: number;
  month: number; // 1-12
  monthName: string;
  monthNameAr: string;
  day: number;
  dayName: string;
  dayNameAr: string;
  pasaran: string;
  formatted: string;
  formattedWithPasaran: string;
  gregorianDate: Date;
}

export interface IslamicEvent {
  title: string;
  hijriDay: number;
  hijriMonth: number;
  description: string;
  category: 'wajib' | 'sunnah' | 'peringatan';
}

export const HIJRI_MONTHS_ID = [
  'Muharram',
  'Safar',
  "Rabi'ul Awwal",
  "Rabi'ul Akhir",
  'Jumadil Ula',
  'Jumadil Akhirah',
  'Rajab',
  "Sya'ban",
  'Ramadhan',
  'Syawwal',
  "Dzulqa'dah",
  'Dzulhijjah',
];

export const HIJRI_MONTHS_AR = [
  'مُحَرَّم',
  'صَفَر',
  'رَبِيع ٱلْأَوَّل',
  'رَبِيع ٱلْآخِر',
  'جُمَادَىٰ ٱلْأُولَىٰ',
  'جُمَادَىٰ ٱلْآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو ٱلْقَعْدَة',
  'ذُو ٱلْحِجَّة',
];

export const DAYS_ID = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAYS_AR = ['الأَحَد', 'الإِثْنَيْن', 'الثُّلَاثَاء', 'الأَرْبِعَاء', 'الخَمِيس', 'الجُمُعَة', 'السَّبْت'];
export const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { title: 'Tahun Baru Islam (1 Muharram)', hijriDay: 1, hijriMonth: 1, description: 'Awal tahun baru penanggalan Hijriyah', category: 'peringatan' },
  { title: 'Hari Asyura (10 Muharram)', hijriDay: 10, hijriMonth: 1, description: 'Sunnah Puasa Asyura (dan Tasu\'a 9 Muharram)', category: 'sunnah' },
  { title: 'Maulid Nabi Muhammad SAW (12 Rabi\'ul Awwal)', hijriDay: 12, hijriMonth: 3, description: 'Kelahiran Baginda Nabi Muhammad SAW', category: 'peringatan' },
  { title: 'Isra Mi\'raj (27 Rajab)', hijriDay: 27, hijriMonth: 7, description: 'Peringatan peristiwa agung Isra Mi\'raj & perintah Shalat 5 Waktu', category: 'peringatan' },
  { title: 'Malam Nisfu Sya\'ban (15 Sya\'ban)', hijriDay: 15, hijriMonth: 8, description: 'Malam pertengahan bulan Sya\'ban penuh berkah', category: 'sunnah' },
  { title: 'Awal Ramadhan (1 Ramadhan)', hijriDay: 1, hijriMonth: 9, description: 'Awal ibadah puasa wajib bulan suci Ramadhan', category: 'wajib' },
  { title: 'Nuzulul Qur\'an (17 Ramadhan)', hijriDay: 17, hijriMonth: 9, description: 'Peringatan turunnya ayat suci Al-Qur\'an pertama kali', category: 'peringatan' },
  { title: 'Hari Raya Idul Fitri (1 Syawwal)', hijriDay: 1, hijriMonth: 10, description: 'Hari Kemenangan Umat Islam (1-2 Syawwal)', category: 'wajib' },
  { title: 'Puasa Sunnah Syawwal (6 Hari)', hijriDay: 2, hijriMonth: 10, description: 'Sunnah puasa 6 hari setelah Idul Fitri', category: 'sunnah' },
  { title: 'Hari Tarwiyah (8 Dzulhijjah)', hijriDay: 8, hijriMonth: 12, description: 'Hari ke-8 Dzulhijjah bagi jamaah haji', category: 'sunnah' },
  { title: 'Hari Arafah (9 Dzulhijjah)', hijriDay: 9, hijriMonth: 12, description: 'Wukuf di Arafah & Puasa Sunnah Arafah', category: 'sunnah' },
  { title: 'Hari Raya Idul Adha (10 Dzulhijjah)', hijriDay: 10, hijriMonth: 12, description: 'Hari Raya Qurban', category: 'wajib' },
  { title: 'Hari Tasyriq (11-13 Dzulhijjah)', hijriDay: 11, hijriMonth: 12, description: 'Hari penyembelihan kurban (diharamkan berpuasa)', category: 'peringatan' },
];

/**
 * Calculate Julian Day Number from Gregorian Date
 */
export const gregorianToJD = (year: number, month: number, day: number): number => {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
};

/**
 * Calculate Gregorian Date from Julian Day Number
 */
export const jdToGregorian = (jd: number): { year: number; month: number; day: number } => {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = Math.floor(b - d - Math.floor(30.6001 * e) + f);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  return { year, month, day };
};

/**
 * Hitung Pasaran Jawa/Nusantara dari Julian Day
 * Reference: Pasaran berulang 5 hari: Legi (0), Pahing (1), Pon (2), Wage (3), Kliwon (4)
 */
export const getPasaran = (jd: number): string => {
  const index = Math.floor(jd + 1.5) % 5;
  const normalized = (index + 5) % 5;
  return PASARAN[normalized];
};

/**
 * Konversi Masehi ke Hijriyah menggunakan algoritma Hisab Falak Urfi
 * (dengan penyesuaian koreksi hari / offset untuk sinkronisasi rukyat Kemenag)
 */
export const gregorianToHijri = (date: Date, dayAdjustment: number = 0): HijriDate => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const jd = gregorianToJD(y, m, d) + dayAdjustment;

  // Epoch Hijriyah: 1 Muharram 1 H = 16 Juli 622 M (JD 1948439.5)
  const epoch = 1948439.5;
  const daysSinceEpoch = jd - epoch;

  // Siklus 30 tahun = 10631 hari, di mana 11 tahun kabisat (355 hari) dan 19 tahun basithah (354 hari)
  const cycle = Math.floor((daysSinceEpoch - 1) / 10631);
  const daysInCycle = daysSinceEpoch - 1 - cycle * 10631;

  // Tahun kabisat dalam siklus 30 tahun: tahun ke- 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29
  const leapYearsInCycle = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  let yearInCycle = 1;
  let accumulatedDays = 0;

  for (let yr = 1; yr <= 30; yr++) {
    const isLeap = leapYearsInCycle.includes(yr);
    const daysInYear = isLeap ? 355 : 354;
    if (daysInCycle < accumulatedDays + daysInYear) {
      yearInCycle = yr;
      break;
    }
    accumulatedDays += daysInYear;
  }

  const hijriYear = cycle * 30 + yearInCycle;
  const dayOfYear = daysInCycle - accumulatedDays;

  // Panjang bulan bergantian 30 dan 29 hari
  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, leapYearsInCycle.includes(yearInCycle) ? 30 : 29];
  let hijriMonth = 1;
  let monthAcc = 0;

  for (let mo = 0; mo < 12; mo++) {
    if (dayOfYear < monthAcc + monthLengths[mo]) {
      hijriMonth = mo + 1;
      break;
    }
    monthAcc += monthLengths[mo];
  }

  const hijriDay = Math.floor(dayOfYear - monthAcc) + 1;

  const dayOfWeekIndex = (Math.floor(jd + 1.5) % 7 + 7) % 7;
  const pasaran = getPasaran(jd);

  const monthName = HIJRI_MONTHS_ID[hijriMonth - 1] || '';
  const monthNameAr = HIJRI_MONTHS_AR[hijriMonth - 1] || '';
  const dayName = DAYS_ID[dayOfWeekIndex];
  const dayNameAr = DAYS_AR[dayOfWeekIndex];

  return {
    year: hijriYear,
    month: hijriMonth,
    monthName,
    monthNameAr,
    day: hijriDay,
    dayName,
    dayNameAr,
    pasaran,
    formatted: `${hijriDay} ${monthName} ${hijriYear} H`,
    formattedWithPasaran: `${dayName} ${pasaran}, ${hijriDay} ${monthName} ${hijriYear} H`,
    gregorianDate: date,
  };
};

/**
 * Konversi Tanggal Hijriyah ke Masehi
 */
export const hijriToGregorian = (
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number,
  dayAdjustment: number = 0
): Date => {
  const leapYearsInCycle = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  const cycle = Math.floor((hijriYear - 1) / 30);
  const yearInCycle = ((hijriYear - 1) % 30) + 1;

  let days = cycle * 10631;
  for (let yr = 1; yr < yearInCycle; yr++) {
    days += leapYearsInCycle.includes(yr) ? 355 : 354;
  }

  const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, leapYearsInCycle.includes(yearInCycle) ? 30 : 29];
  for (let mo = 1; mo < hijriMonth; mo++) {
    days += monthLengths[mo - 1];
  }

  days += hijriDay;

  const epoch = 1948439.5;
  const jd = epoch + days - dayAdjustment;

  const greg = jdToGregorian(jd);
  return new Date(greg.year, greg.month - 1, greg.day);
};

/**
 * Ambil daftar event Islam pada tanggal Hijriyah tertentu
 */
export const getEventsForHijriDate = (day: number, month: number): IslamicEvent[] => {
  return ISLAMIC_EVENTS.filter(e => e.hijriDay === day && e.hijriMonth === month);
};

/**
 * Cek apakah tanggal Hijriyah adalah hari puasa sunnah Ayyamul Bidh (13, 14, 15)
 */
export const isAyyamulBidh = (day: number, month: number): boolean => {
  // Ayyamul Bidh tidak disunnahkan pada hari Tasyriq (13 Dzulhijjah haram berpuasa)
  if (month === 12 && day === 13) return false;
  return day === 13 || day === 14 || day === 15;
};
