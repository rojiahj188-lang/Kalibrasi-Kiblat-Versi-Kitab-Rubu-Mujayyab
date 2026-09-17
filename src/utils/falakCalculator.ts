/**
 * Kalkulator Falak & Rumus Hisab Versi Kitab Rubu' Mujayyab (الرُّبْعُ الْمُجَيَّبُ)
 * Dilengkapi hisab kiblat, waktu shalat, irtifa' matahari, bayangan istiwa (zhill),
 * dan trigonometri sittiniyah (skala 60 bagian).
 */

import { degToRad, radToDeg, normalize360, toDMS, MAKKAH_COORDS } from './astronomy';

export interface FalakAngleDMS {
  degrees: number;
  minutes: number;
  seconds: number;
  isNegative: boolean;
  decimal: number;
  formatted: string;
}

export interface SittiniyahValue {
  darajah: number; // Derajat (integer)
  daqiqah: number; // Menit (integer)
  tsaniyah: number; // Detik (float)
  formatted: string; // Misal: 24° 15' 32.4"
}

export interface QiblaHisabRubu {
  // Input
  latitude: number;
  longitude: number;
  latMakkah: number;
  lonMakkah: number;

  // Nilai-nilai klasik kitab
  fadhlutThulain: number; // Selisih bujur (lambda - lambdaM)
  jaybArdhMakkah: number; // R * sin(phiM)
  jaybTamamArdhMakkah: number; // R * cos(phiM)
  jaybArdhBalad: number; // R * sin(phi)
  jaybTamamArdhBalad: number; // R * cos(phi)
  ashlMutlaq: number; // (jaybTamamBalad * jaybTamamMakkah) / 60
  hishshahQiblah: number; // (jaybArdhMakkah * 60) / jaybTamamBalad
  tadilusSamt: number;
  inhiraf: number; // Sudut serong kiblat
  azimuthTrue: number; // Azimuth utara sejati
  quadrantName: string; // Misal: Barat - Utara (B-U)
  formulaSteps: { title: string; arabic: string; formula: string; result: string }[];
}

export interface PrayerTimeResult {
  date: Date;
  timezoneOffset: number; // +7 (WIB), +8 (WITA), +9 (WIT)
  declination: number; // Mailusy syams
  equationOfTime: number; // Ta'dilul waqti (dalam menit)
  times: {
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
  };
  details: {
    fajrAltitude: number;
    ishaAltitude: number;
    dhuhaAltitude: number;
    zawalTime: string;
    asrAltitude: number;
  };
}

export interface SolarAltitudeAndShadow {
  hourTime: string;
  solarAltitude: number; // Irtifa' (h) dalam derajat
  jaybIrtifa: number; // 60 * sin(h)
  jaybTamam: number; // 60 * cos(h)
  saham: number; // 60 * (1 - cos(h))
  zhillAsba: number; // Bayangan pada skala 12 Asba' (jari): 12 / tan(h)
  zhillAqdam: number; // Bayangan pada skala 7 Aqdam (kaki): 7 / tan(h)
  rubuStringAngle: number; // Posisi benang pada busur 90 derajat
  isSunAboveHorizon: boolean;
}

/**
 * Konversi desimal ke representasi Falak DMS
 */
export const decimalToFalakDMS = (val: number): FalakAngleDMS => {
  const isNeg = val < 0;
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = Math.round((minFull - min) * 60 * 100) / 100;

  return {
    degrees: deg,
    minutes: min,
    seconds: sec,
    isNegative: isNeg,
    decimal: val,
    formatted: `${isNeg ? '-' : ''}${deg}° ${min}' ${sec.toFixed(1)}"`,
  };
};

/**
 * Konversi DMS ke Desimal
 */
export const falakDMSToDecimal = (deg: number, min: number, sec: number, isNegative: boolean = false): number => {
  const dec = Math.abs(deg) + Math.abs(min) / 60 + Math.abs(sec) / 3600;
  return isNegative ? -dec : dec;
};

/**
 * Format angka sittiniyah klasik (skala 60)
 */
export const toSittiniyah = (val: number): SittiniyahValue => {
  const d = Math.floor(val);
  const mFull = (val - d) * 60;
  const m = Math.floor(mFull);
  const s = Math.round((mFull - m) * 60 * 100) / 100;
  return {
    darajah: d,
    daqiqah: m,
    tsaniyah: s,
    formatted: `${d}° ${m}' ${s.toFixed(1)}"`,
  };
};

/**
 * Hitung Hisab Arah Kiblat versi Kitab Rubu' Mujayyab
 */
export const calculateHisabQiblaRubu = (
  lat: number,
  lon: number,
  latMakkah: number = MAKKAH_COORDS.latitude,
  lonMakkah: number = MAKKAH_COORDS.longitude
): QiblaHisabRubu => {
  const R = 60; // Jari-jari Kuadran Sittin (As-Sittin)

  // 1. Fadhlut Thulain (Selisih Bujur)
  const fadhlutThulain = Math.abs(lon - lonMakkah);
  const fadhlRad = degToRad(fadhlutThulain);

  const phiRad = degToRad(lat);
  const phiMRad = degToRad(latMakkah);

  // 2. Juyub (Sinus & Cosinus pada skala R=60)
  const jaybArdhMakkah = R * Math.sin(phiMRad);
  const jaybTamamArdhMakkah = R * Math.cos(phiMRad);

  const jaybArdhBalad = R * Math.sin(phiRad);
  const jaybTamamArdhBalad = R * Math.cos(phiRad);

  // 3. Ashl Mutlaq (الأصل المطلق)
  // Rumus kitab: (Jayb Tamam Balad * Jayb Tamam Makkah) / R
  const ashlMutlaq = (jaybTamamArdhBalad * jaybTamamArdhMakkah) / R;

  // 4. Hishshah al-Qiblah (حصة القبلة)
  const hishshahQiblah = (jaybArdhMakkah * R) / jaybTamamArdhBalad;

  // 5. Inhiraf (Sudut Serong)
  // Formula trigonometri bola:
  // tan(Inhiraf) = sin(deltaLambda) / (cos(phi) * tan(phiM) - sin(phi) * cos(deltaLambda))
  const num = Math.sin(fadhlRad);
  const den = Math.cos(phiRad) * Math.tan(phiMRad) - Math.sin(phiRad) * Math.cos(fadhlRad);
  const bearingFromNorth = normalize360(radToDeg(Math.atan2(num, den)));

  let azimuthTrue = normalize360(360 - bearingFromNorth);
  let inhiraf = 0;
  let quadrantName = '';

  if (azimuthTrue >= 270 && azimuthTrue < 360) {
    inhiraf = azimuthTrue - 270;
    quadrantName = 'Barat ke Utara (B-U)';
  } else if (azimuthTrue >= 180 && azimuthTrue < 270) {
    inhiraf = 270 - azimuthTrue;
    quadrantName = 'Barat ke Selatan (B-S)';
  } else if (azimuthTrue >= 90 && azimuthTrue < 180) {
    inhiraf = azimuthTrue - 90;
    quadrantName = 'Timur ke Selatan (T-S)';
  } else {
    inhiraf = 90 - azimuthTrue;
    quadrantName = 'Timur ke Utara (T-U)';
  }

  const steps = [
    {
      title: 'Fadhlut Thulain (فضل الطولين)',
      arabic: 'فَضْلُ الطُّوْلَيْنِ = طُولُ الْبَلَدِ - طُولُ مَكَّة',
      formula: `|${lon.toFixed(4)}° - ${lonMakkah.toFixed(4)}°|`,
      result: `${fadhlutThulain.toFixed(4)}° (${toDMS(fadhlutThulain).formatted})`,
    },
    {
      title: "Jayb 'Ardh Makkah (جيب عرض مكة)",
      arabic: "جَيْبُ عَرْضِ مَكَّة = ٦٠ × حَا(عرض مكة)",
      formula: `60 × sin(${latMakkah.toFixed(4)}°)`,
      result: `${jaybArdhMakkah.toFixed(4)} Sittin`,
    },
    {
      title: "Jayb 'Ardhil Balad (جيب عرض البلد)",
      arabic: "جَيْبُ عَرْضِ الْبَلَدِ = ٦٠ × حَا(عرض البلد)",
      formula: `60 × sin(${lat.toFixed(4)}°)`,
      result: `${jaybArdhBalad.toFixed(4)} Sittin`,
    },
    {
      title: "Jayb Tamam 'Ardhil Balad (جيب تمام عرض البلد)",
      arabic: "جَيْبُ تَمَامِ عَرْضِ الْبَلَدِ = ٦٠ × جَتَا(عرض البلد)",
      formula: `60 × cos(${lat.toFixed(4)}°)`,
      result: `${jaybTamamArdhBalad.toFixed(4)} Sittin`,
    },
    {
      title: 'Ashl Mutlaq (الأصل المطلق)',
      arabic: 'الأَصْلُ الْمُطْلَقُ = (جيب تمام البلد × جيب تمام مكة) ÷ ٦٠',
      formula: `(${jaybTamamArdhBalad.toFixed(2)} × ${jaybTamamArdhMakkah.toFixed(2)}) / 60`,
      result: `${ashlMutlaq.toFixed(4)} Sittin`,
    },
    {
      title: "Hishshah al-Qiblah (حصة القبلة)",
      arabic: "حِصَّةُ الْقِبْلَة = (جيب عرض مكة × ٦٠) ÷ جيب تمام عرض البلد",
      formula: `(${jaybArdhMakkah.toFixed(2)} × 60) / ${jaybTamamArdhBalad.toFixed(2)}`,
      result: `${hishshahQiblah.toFixed(4)} Sittin`,
    },
    {
      title: "Inhiraf al-Qiblah (انحراف القبلة)",
      arabic: "اِنْحِرَافُ الْقِبْلَةِ مِن نُقْطَةِ الْمَغْرِبِ",
      formula: `Sudut deviasi dari arah Barat sejati`,
      result: `${inhiraf.toFixed(4)}° (${toDMS(inhiraf).formatted}) ${quadrantName}`,
    },
    {
      title: "As-Simt / Azimuth Sejati (السمت الحقيقي)",
      arabic: "السَّمْتُ الْحَقِيْقِيُّ مِنَ الشَّمَالِ مَعَ عَقَارِبِ السَّاعَة",
      formula: `Derajat putaran dari titik Utara Sejati`,
      result: `${azimuthTrue.toFixed(4)}° (${toDMS(azimuthTrue).formatted})`,
    },
  ];

  return {
    latitude: lat,
    longitude: lon,
    latMakkah,
    lonMakkah,
    fadhlutThulain,
    jaybArdhMakkah,
    jaybTamamArdhMakkah,
    jaybArdhBalad,
    jaybTamamArdhBalad,
    ashlMutlaq,
    hishshahQiblah,
    tadilusSamt: ashlMutlaq,
    inhiraf,
    azimuthTrue,
    quadrantName,
    formulaSteps: steps,
  };
};

/**
 * Hitung deklinasi matahari (Mailusy Syams) dan perata waktu (Ta'dilul Waqti)
 * berdasarkan tanggal Masehi
 */
export const calculateSolarEphemeris = (date: Date): { declination: number; equationOfTime: number } => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Sudut orbit bumi (B dalam radian)
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;

  // Deklinasi matahari (Spencer 1971 / NOAA)
  const declination =
    23.44 *
    Math.sin(degToRad((360 / 365.24) * (dayOfYear + 10) + 1.914 * Math.sin(degToRad((360 / 365.24) * (dayOfYear - 2)))));

  // Equation of Time (menit)
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  return {
    declination,
    equationOfTime: eot,
  };
};

/**
 * Format desimal jam menjadi string HH:MM:SS
 */
export const formatDecimalHours = (hours: number): string => {
  if (isNaN(hours)) return '--:--:--';
  let h = hours % 24;
  if (h < 0) h += 24;
  const hour = Math.floor(h);
  const minFull = (h - hour) * 60;
  const minute = Math.floor(minFull);
  const sec = Math.floor((minFull - minute) * 60);

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/**
 * Hitung Jadwal Waktu Shalat Versi Kitab Rubu' Mujayyab
 */
export const calculatePrayerTimesRubu = (
  date: Date,
  lat: number,
  lon: number,
  timezoneOffset: number = 8, // Default WITA (Lombok NTB = UTC+8)
  elevationMeters: number = 20
): PrayerTimeResult => {
  const { declination, equationOfTime } = calculateSolarEphemeris(date);

  const phi = lat;
  const delta = declination;
  const phiRad = degToRad(phi);
  const deltaRad = degToRad(delta);

  // Bujur standar untuk zona waktu (WIB = 105, WITA = 120, WIT = 135)
  const lambdaStd = timezoneOffset * 15;

  // Waktu Zawal (Matahari melintas meridian / Zhuhur hakiki sebelum ihtiyath)
  // Zawal (Waktu Lokal) = 12 - (EqOfTime / 60) + (lambdaStd - lon) / 15
  const zawalHours = 12 - equationOfTime / 60 + (lambdaStd - lon) / 15;

  // Rumus Sudut Waktu (t) untuk ketinggian h:
  // cos(t) = (sin(h) - sin(phi)*sin(delta)) / (cos(phi)*cos(delta))
  const calculateHourAngle = (hDeg: number): number | null => {
    const hRad = degToRad(hDeg);
    const cosT = (Math.sin(hRad) - Math.sin(phiRad) * Math.sin(deltaRad)) / (Math.cos(phiRad) * Math.cos(deltaRad));
    if (cosT > 1 || cosT < -1) return null; // Matahari tidak mencapai ketinggian ini
    return radToDeg(Math.acos(cosT));
  };

  // Ketinggian matahari standar (Irtifa'):
  // Dip of horizon (kerendahan ufuk karena elevasi): dip = 1.76 / 60 * sqrt(h)
  const dip = (1.76 / 60) * Math.sqrt(Math.max(0, elevationMeters));

  // Maghrib / Terbit: -0.8333° (diameter semidiameter matahari 16' + refraksi 34') - dip
  const hGhurub = -0.8333 - dip;

  // Fajar / Subuh: Kemenag RI = -20°
  const hFajr = -20.0;

  // Isya: Kemenag RI = -18°
  const hIsha = -18.0;

  // Dhuha: sekitar 4° 30' (+4.5°)
  const hDhuha = 4.5;

  // Ashar: bayangan = 1 panjang benda + bayangan zawal
  // tan(z_ashar) = 1 + tan|phi - delta|
  // h_ashar = 90° - z_ashar
  const zZawal = Math.abs(phi - delta);
  const tanZ_ashar = 1 + Math.tan(degToRad(zZawal));
  const hAshar = 90 - radToDeg(Math.atan(tanZ_ashar));

  // Ihtiyath (pengaman fiqh): 2 menit = 2/60 jam
  const ihtiyath = 2 / 60;

  // Sudut waktu masing-masing waktu shalat
  const tFajr = calculateHourAngle(hFajr) ?? 108;
  const tSunrise = calculateHourAngle(hGhurub) ?? 90;
  const tDhuha = calculateHourAngle(hDhuha) ?? 84;
  const tAshar = calculateHourAngle(hAshar) ?? 54;
  const tSunset = calculateHourAngle(hGhurub) ?? 90;
  const tIsha = calculateHourAngle(hIsha) ?? 105;

  const subuhH = zawalHours - tFajr / 15 + ihtiyath;
  const imsakH = subuhH - 10 / 60; // Imsak 10 menit sebelum subuh
  const terbitH = zawalHours - tSunrise / 15 - ihtiyath;
  const dhuhaH = zawalHours - tDhuha / 15 + ihtiyath;
  const dzuhurH = zawalHours + ihtiyath;
  const asharH = zawalHours + tAshar / 15 + ihtiyath;
  const maghribH = zawalHours + tSunset / 15 + ihtiyath;
  const isyaH = zawalHours + tIsha / 15 + ihtiyath;

  return {
    date,
    timezoneOffset,
    declination,
    equationOfTime,
    times: {
      imsak: formatDecimalHours(imsakH),
      subuh: formatDecimalHours(subuhH),
      terbit: formatDecimalHours(terbitH),
      dhuha: formatDecimalHours(dhuhaH),
      dzuhur: formatDecimalHours(dzuhurH),
      ashar: formatDecimalHours(asharH),
      maghrib: formatDecimalHours(maghribH),
      isya: formatDecimalHours(isyaH),
    },
    details: {
      fajrAltitude: hFajr,
      ishaAltitude: hIsha,
      dhuhaAltitude: hDhuha,
      zawalTime: formatDecimalHours(zawalHours),
      asrAltitude: Math.round(hAshar * 100) / 100,
    },
  };
};

/**
 * Hitung Ketinggian Matahari (Irtifa') & Panjang Bayangan (Zhill) pada jam tertentu
 */
export const calculateSolarAltitudeAndShadow = (
  date: Date,
  lat: number,
  lon: number,
  timezoneOffset: number,
  timeHHMM: string
): SolarAltitudeAndShadow => {
  const [hStr, mStr] = timeHHMM.split(':');
  const targetHour = parseInt(hStr, 10) + parseInt(mStr || '0', 10) / 60;

  const { declination, equationOfTime } = calculateSolarEphemeris(date);
  const lambdaStd = timezoneOffset * 15;

  // Waktu Zawal
  const zawal = 12 - equationOfTime / 60 + (lambdaStd - lon) / 15;

  // Sudut waktu (t) dalam derajat: 1 jam = 15 derajat
  const t = (targetHour - zawal) * 15;
  const tRad = degToRad(t);

  const phiRad = degToRad(lat);
  const deltaRad = degToRad(declination);

  // sin(h) = sin(phi) * sin(delta) + cos(phi) * cos(delta) * cos(t)
  const sinH = Math.sin(phiRad) * Math.sin(deltaRad) + Math.cos(phiRad) * Math.cos(deltaRad) * Math.cos(tRad);

  const hRad = Math.asin(Math.max(-1, Math.min(1, sinH)));
  const solarAltitude = radToDeg(hRad);

  const isAboveHorizon = solarAltitude > 0;

  // Nilai-nilai Rubu' Mujayyab (R = 60)
  const jaybIrtifa = isAboveHorizon ? 60 * Math.sin(hRad) : 0;
  const jaybTamam = isAboveHorizon ? 60 * Math.cos(hRad) : 0;
  const saham = isAboveHorizon ? 60 * (1 - Math.cos(hRad)) : 0;

  // Bayangan tongkat istiwa:
  // Skala Asba' (12 jari): 12 / tan(h)
  // Skala Aqdam (7 kaki): 7 / tan(h)
  let zhillAsba = 0;
  let zhillAqdam = 0;

  if (isAboveHorizon && solarAltitude > 0.5) {
    const tanH = Math.tan(hRad);
    zhillAsba = 12 / tanH;
    zhillAqdam = 7 / tanH;
  }

  // Sudut benang pada kuadran busur 90 derajat Rubu'
  const rubuStringAngle = Math.max(0, Math.min(90, 90 - Math.max(0, solarAltitude)));

  return {
    hourTime: timeHHMM,
    solarAltitude: Math.round(solarAltitude * 100) / 100,
    jaybIrtifa: Math.round(jaybIrtifa * 100) / 100,
    jaybTamam: Math.round(jaybTamam * 100) / 100,
    saham: Math.round(saham * 100) / 100,
    zhillAsba: Math.round(zhillAsba * 100) / 100,
    zhillAqdam: Math.round(zhillAqdam * 100) / 100,
    rubuStringAngle: Math.round(rubuStringAngle * 10) / 10,
    isSunAboveHorizon: isAboveHorizon,
  };
};
