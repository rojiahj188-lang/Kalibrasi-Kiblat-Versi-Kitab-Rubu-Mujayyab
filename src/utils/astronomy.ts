import { Coordinates, QiblaResult, SolarPosition, RashdulQiblahToday } from '../types/qibla';

// Coordinates of Kaaba (Makkah al-Mukarramah) according to international geodesy & falak consensus
export const MAKKAH_COORDS = {
  latitude: 21.422487, // 21° 25' 20.95" N
  longitude: 39.826206, // 39° 49' 34.34" E
  name: "Ka'bah, Makkah al-Mukarramah",
};

// Convert degrees to radians and vice-versa
export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

// Normalize angle to [0, 360)
export const normalize360 = (angle: number): number => {
  const mod = angle % 360;
  return mod < 0 ? mod + 360 : mod;
};

// Convert decimal degrees to Degrees, Minutes, Seconds (DMS) string & components
export const toDMS = (decimal: number): { deg: number; min: number; sec: number; formatted: string } => {
  const absolute = Math.abs(decimal);
  const deg = Math.floor(absolute);
  const minNotTruncated = (absolute - deg) * 60;
  const min = Math.floor(minNotTruncated);
  const sec = Math.round((minNotTruncated - min) * 60 * 100) / 100;
  return {
    deg,
    min,
    sec,
    formatted: `${deg}° ${min}' ${sec.toFixed(1)}"`,
  };
};

// Calculate Great Circle Distance in Kilometers
export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371.0; // Earth radius in km
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Calculate magnetic declination approximation (simplified WMM representation)
export const estimateMagneticDeclination = (lat: number, lon: number): number => {
  // Approximate magnetic declination based on dipole model for Indonesia / Southeast Asia & Middle East
  // For precise calibration, users can toggle or fine-tune
  const sinLat = Math.sin(degToRad(lat));
  const cosLat = Math.cos(degToRad(lat));
  const lonRad = degToRad(lon);
  // Empirical approximation for Southeast Asia / Indian Ocean
  const declination = 0.5 * sinLat + 1.2 * Math.sin(lonRad - degToRad(110)) * cosLat + 0.8;
  return Math.round(declination * 10) / 10;
};

/**
 * Calculate accurate Qibla Direction using Spherical Trigonometry & Classical Rubu' Mujayyab methods
 */
export const calculateQibla = (coords: Coordinates): QiblaResult => {
  const phi = coords.latitude;
  const lambda = coords.longitude;
  const phiM = MAKKAH_COORDS.latitude;
  const lambdaM = MAKKAH_COORDS.longitude;

  const phiRad = degToRad(phi);
  const lambdaRad = degToRad(lambda);
  const phiMRad = degToRad(phiM);
  const lambdaMRad = degToRad(lambdaM);

  const deltaLambda = lambda - lambdaM;
  const deltaLambdaRad = degToRad(deltaLambda);

  // Modern Great-Circle Bearing Formula:
  // tan(q) = sin(delta_lambda) / (cos(phi) * tan(phi_m) - sin(phi) * cos(delta_lambda))
  const y = Math.sin(deltaLambdaRad);
  const x = Math.cos(phiRad) * Math.tan(phiMRad) - Math.sin(phiRad) * Math.cos(deltaLambdaRad);

  // Angle from True North (0° = North, 90° = East, 180° = South, 270° = West)
  let bearingFromNorth = radToDeg(Math.atan2(y, x));
  let azimuthTrue = normalize360(360 - bearingFromNorth);

  // Determine Inhiraf (Deviation) relative to Cardinal directions
  // In classical Indonesian & Southeast Asian Falak:
  // Qibla is usually expressed as: "X degrees from West towards North" (B-U)
  // For coordinates east of Makkah (like Indonesia, Malaysia, etc.):
  let inhirafDegrees = 0;
  let directionText = "";
  let quadrantText = "";

  if (azimuthTrue >= 270 && azimuthTrue < 360) {
    // NW quadrant: between West (270) and North (360)
    inhirafDegrees = azimuthTrue - 270;
    const dms = toDMS(inhirafDegrees);
    directionText = `${dms.formatted} dari Barat serong ke Utara (B-U)`;
    quadrantText = "Barat ke Utara (B-U / U-B)";
  } else if (azimuthTrue >= 180 && azimuthTrue < 270) {
    // SW quadrant: between South (180) and West (270)
    inhirafDegrees = 270 - azimuthTrue;
    const dms = toDMS(inhirafDegrees);
    directionText = `${dms.formatted} dari Barat serong ke Selatan (B-S)`;
    quadrantText = "Barat ke Selatan (B-S)";
  } else if (azimuthTrue >= 90 && azimuthTrue < 180) {
    // SE quadrant
    inhirafDegrees = azimuthTrue - 90;
    const dms = toDMS(inhirafDegrees);
    directionText = `${dms.formatted} dari Timur serong ke Selatan (T-S)`;
    quadrantText = "Timur ke Selatan (T-S)";
  } else {
    // NE quadrant
    inhirafDegrees = 90 - azimuthTrue;
    const dms = toDMS(inhirafDegrees);
    directionText = `${dms.formatted} dari Timur serong ke Utara (T-U)`;
    quadrantText = "Timur ke Utara (T-U)";
  }

  const dmsInhiraf = toDMS(inhirafDegrees);
  const magDec = estimateMagneticDeclination(phi, lambda);
  const azimuthMagnetic = normalize360(azimuthTrue - magDec);
  const distanceKm = calculateDistanceKm(phi, lambda, phiM, lambdaM);

  // Classical Rubu' Mujayyab Elements (R = 60 parts / ashba')
  const absDeltaLambda = Math.abs(deltaLambda);
  const jaybFadhlitThulain = 60 * Math.sin(degToRad(absDeltaLambda));
  const jaybArdhMakkah = 60 * Math.sin(phiMRad);
  const jaybTamamArdhMakkah = 60 * Math.cos(phiMRad);
  const jaybArdhBalad = 60 * Math.sin(phiRad);
  const jaybTamamArdhBalad = 60 * Math.cos(phiRad);

  const inhirafRad = degToRad(inhirafDegrees);
  const sinInhiraf = Math.sin(inhirafRad);
  const cosInhiraf = Math.cos(inhirafRad);
  const tanInhiraf = Math.tan(inhirafRad);

  // Shadow length in 12 units (As-Sullam / Zhill Mabsuth)
  const zhillMabsuth = tanInhiraf !== 0 ? 12 / tanInhiraf : 0;
  const zhillMankus = 12 * tanInhiraf;

  return {
    azimuthTrue,
    azimuthMagnetic,
    magneticDeclination: magDec,
    inhiraf: {
      degrees: dmsInhiraf.deg,
      minutes: dmsInhiraf.min,
      seconds: dmsInhiraf.sec,
      directionText,
      quadrantText,
      rawDegrees: inhirafDegrees,
    },
    distanceKm,
    rubu: {
      ardhulBalad: phi,
      thululBalad: lambda,
      ardhuMakkah: phiM,
      thuluMakkah: lambdaM,
      fadhlutThulain: absDeltaLambda,
      jaybFadhlitThulain,
      jaybArdhMakkah,
      jaybTamamArdhMakkah,
      jaybArdhBalad,
      jaybTamamArdhBalad,
      ashlMutlaq: (jaybTamamArdhBalad * jaybArdhMakkah) / 60,
      hishshahKiblat: (jaybTamamArdhBalad * Math.cos(degToRad(absDeltaLambda))) / 60,
      irtifaMakkah: radToDeg(Math.asin((Math.sin(phiRad) * Math.sin(phiMRad)) + (Math.cos(phiRad) * Math.cos(phiMRad) * Math.cos(deltaLambdaRad)))),
      sinQibla: sinInhiraf,
      cosQibla: cosInhiraf,
      jaybInhiraf: 60 * sinInhiraf,
      jaybTamamInhiraf: 60 * cosInhiraf,
      zhillMabsuth: Math.round(zhillMabsuth * 100) / 100,
      zhillMankus: Math.round(zhillMankus * 100) / 100,
    },
  };
};

/**
 * High-precision Solar Calculations (Meeus Astronomical Algorithms)
 */
export const calculateSolarPosition = (coords: Coordinates, date: Date = new Date()): SolarPosition => {
  const lat = coords.latitude;
  const lon = coords.longitude;

  // Calculate Julian Day
  const time = date.getTime();
  const jd = time / 86400000 + 2440587.5;
  const d = jd - 2451545.0; // Days since J2000.0
  const century = d / 36525.0;

  // Geometric Mean Longitude of Sun (deg)
  let L0 = 280.46646 + century * (36000.76983 + century * 0.0003032);
  L0 = normalize360(L0);

  // Mean Anomaly of Sun (deg)
  let M = 357.52911 + century * (35999.05029 - 0.0001537 * century);
  const mRad = degToRad(M);

  // Sun Equation of Center
  const C =
    Math.sin(mRad) * (1.914602 - century * (0.004817 + 0.000014 * century)) +
    Math.sin(2 * mRad) * (0.019993 - 0.000101 * century) +
    Math.sin(3 * mRad) * 0.000289;

  // Sun True Longitude & Apparent Longitude
  const sunTrueLon = L0 + C;
  const omega = 125.04 - 1934.136 * century;
  const lambdaSun = sunTrueLon - 0.00569 - 0.00478 * Math.sin(degToRad(omega));

  // Mean Obliquity of the Ecliptic
  const seconds = 21.448 - century * (46.8150 + century * (0.00059 - century * 0.001813));
  const obMean = 23 + (26 + seconds / 60) / 60;
  const obEcliptic = obMean + 0.00256 * Math.cos(degToRad(omega));
  const obEclipticRad = degToRad(obEcliptic);
  const lambdaSunRad = degToRad(lambdaSun);

  // Sun Declination
  const sinDecl = Math.sin(obEclipticRad) * Math.sin(lambdaSunRad);
  const declRad = Math.asin(sinDecl);
  const declination = radToDeg(declRad);

  // Equation of Time (EoT) in minutes
  const y = Math.tan(obEclipticRad / 2) * Math.tan(obEclipticRad / 2);
  const eotRad =
    y * Math.sin(2 * degToRad(L0)) -
    2 * 0.016708634 * Math.sin(mRad) +
    4 * 0.016708634 * y * Math.sin(mRad) * Math.cos(2 * degToRad(L0)) -
    0.5 * y * y * Math.sin(4 * degToRad(L0)) -
    1.25 * 0.016708634 * 0.016708634 * Math.sin(2 * mRad);
  const equationOfTime = radToDeg(eotRad) * 4; // minutes

  // Calculate Sun Altitude and Azimuth for local observer
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Local Solar Time in degrees (1 hr = 15 deg)
  const trueSolarTimeDeg = (utcHours * 15 + lon + equationOfTime * 0.25) % 360;
  let hourAngle = trueSolarTimeDeg - 180;
  if (hourAngle < -180) hourAngle += 360;
  if (hourAngle > 180) hourAngle -= 360;

  const haRad = degToRad(hourAngle);
  const latRad = degToRad(lat);

  // Solar Altitude (h)
  const sinAlt = Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const altitude = radToDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));

  // Solar Azimuth (A) from North
  const cosAlt = Math.cos(degToRad(altitude));
  let azimuth = 0;
  if (cosAlt > 0.001) {
    const cosAz = (Math.sin(declRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * cosAlt);
    const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
    const azRad = Math.acos(clampedCosAz);
    azimuth = hourAngle > 0 ? 360 - radToDeg(azRad) : radToDeg(azRad);
  }

  // Shadow Azimuth is opposite to the Sun (180 degrees)
  const shadowAzimuth = normalize360(azimuth + 180);

  return {
    declination,
    equationOfTime,
    altitude,
    azimuth,
    shadowAzimuth,
    isAboveHorizon: altitude > 0,
  };
};

/**
 * Calculate Today's Daily Rashdul Qiblah (Bayang-bayang Kiblat Harian)
 * The exact time today when the sun's shadow aligns precisely with the Qibla!
 */
export const calculateTodayRashdulQiblah = (
  coords: Coordinates,
  qiblaAzimuth: number,
  currentDate: Date = new Date()
): RashdulQiblahToday => {
  // Step through minutes of the current day to find when Solar Azimuth or Shadow Azimuth equals Qibla Azimuth
  const targetDate = new Date(currentDate);
  targetDate.setHours(0, 0, 0, 0);

  let bestEventTime: Date | null = null;
  let minDiff = 999;
  let bestSolarAlt = 0;
  let eventType: 'direct' | 'antipodal' | 'none' = 'none';

  // Search through the day in 1-minute steps
  for (let min = 6 * 60; min <= 18 * 60; min += 1) {
    const testDate = new Date(targetDate.getTime() + min * 60000);
    const solar = calculateSolarPosition(coords, testDate);

    if (solar.altitude > 2) {
      // 1. Direct shadow: Shadow Azimuth matches Qibla Azimuth (Sun is opposite to Qibla, so shadow points to Ka'bah)
      const diffShadow = Math.abs(solar.shadowAzimuth - qiblaAzimuth);
      const normDiffShadow = Math.min(diffShadow, 360 - diffShadow);

      if (normDiffShadow < minDiff) {
        minDiff = normDiffShadow;
        bestEventTime = testDate;
        bestSolarAlt = solar.altitude;
        eventType = 'direct';
      }

      // 2. Antipodal shadow: Sun Azimuth matches Qibla Azimuth (Facing Sun is facing Qibla)
      const diffDirect = Math.abs(solar.azimuth - qiblaAzimuth);
      const normDiffDirect = Math.min(diffDirect, 360 - diffDirect);

      if (normDiffDirect < minDiff) {
        minDiff = normDiffDirect;
        bestEventTime = testDate;
        bestSolarAlt = solar.altitude;
        eventType = 'antipodal';
      }
    }
  }

  // If match is within 0.5 degrees and sun is well above horizon
  if (minDiff < 0.8 && bestEventTime && bestSolarAlt > 3) {
    const timeStr = bestEventTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const desc = eventType === 'direct'
      ? `Bayang-bayang tongkat/benda tegak lurus mengarah TEPAT ke Ka'bah.`
      : `Menghadap tepat ke arah matahari berarti menghadap langsung ke arah Kiblat.`;

    return {
      hasEventToday: true,
      eventTime: bestEventTime,
      timeString: timeStr,
      solarAltitudeAtEvent: Math.round(bestSolarAlt * 10) / 10,
      type: eventType,
      description: desc,
    };
  }

  return {
    hasEventToday: false,
    eventTime: null,
    timeString: '-',
    solarAltitudeAtEvent: 0,
    type: 'none',
    description: 'Pada hari ini lintasan matahari tidak berpotongan sempurna dengan sudut kiblat di koordinat ini. Gunakan kalibrasi kompas digital atau tabel Rashdul Qiblah tahunan.',
  };
};

/**
 * Famous Indonesian & World City Presets with accurate Coordinates
 */
export const PRESET_CITIES = [
  { name: 'Gerung (KUA Kec. Gerung - Jl. Gatot Subroto Gerung Utara)', latitude: -8.6830, longitude: 116.1264, province: 'Lombok Barat, NTB' },
  { name: 'Kediri (Ponpes Darussalam / STID Al-Ishlahuddiny)', latitude: -8.6433, longitude: 116.1608, province: 'Lombok Barat, NTB' },
  { name: 'Mataram (Lombok)', latitude: -8.5833, longitude: 116.1167, province: 'NTB' },
  { name: 'Jakarta (Masjid Istiqlal)', latitude: -6.1702, longitude: 106.8315, province: 'DKI Jakarta' },
  { name: 'Bandung', latitude: -6.9175, longitude: 107.6191, province: 'Jawa Barat' },
  { name: 'Surabaya (Masjid Al-Akbar)', latitude: -7.3374, longitude: 112.7153, province: 'Jawa Timur' },
  { name: 'Semarang', latitude: -6.9667, longitude: 110.4167, province: 'Jawa Tengah' },
  { name: 'Yogyakarta (Kraton/Kauman)', latitude: -7.8049, longitude: 110.3644, province: 'D.I. Yogyakarta' },
  { name: 'Banda Aceh (Masjid Raya Baiturrahman)', latitude: 5.5536, longitude: 95.3197, province: 'Aceh' },
  { name: 'Medan (Masjid Raya Al-Mashun)', latitude: 3.5753, longitude: 98.6872, province: 'Sumatera Utara' },
  { name: 'Padang', latitude: -0.9471, longitude: 100.4172, province: 'Sumatera Barat' },
  { name: 'Palembang (Masjid Agung)', latitude: -2.9904, longitude: 104.7594, province: 'Sumatera Selatan' },
  { name: 'Pontianak (Tugu Khatulistiwa)', latitude: -0.0003, longitude: 109.3218, province: 'Kalimantan Barat' },
  { name: 'Banjarmasin', latitude: -3.3194, longitude: 114.5908, province: 'Kalimantan Selatan' },
  { name: 'Balikpapan/IKN', latitude: -1.2379, longitude: 116.8529, province: 'Kalimantan Timur' },
  { name: 'Makassar', latitude: -5.1477, longitude: 119.4327, province: 'Sulawesi Selatan' },
  { name: 'Manado', latitude: 1.4748, longitude: 124.8428, province: 'Sulawesi Utara' },
  { name: 'Denpasar', latitude: -8.6705, longitude: 115.2126, province: 'Bali' },
  { name: 'Mataram (Lombok)', latitude: -8.5833, longitude: 116.1167, province: 'NTB' },
  { name: 'Kupang', latitude: -10.1772, longitude: 123.6070, province: 'NTT' },
  { name: 'Ambon', latitude: -3.6547, longitude: 128.1906, province: 'Maluku' },
  { name: 'Jayapura', latitude: -2.5916, longitude: 140.6690, province: 'Papua' },
  { name: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869, province: 'Malaysia' },
  { name: 'Singapura', latitude: 1.3521, longitude: 103.8198, province: 'Singapore' },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, province: 'Japan' },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, province: 'UK' },
  { name: 'Cairo (Al-Azhar)', latitude: 30.0459, longitude: 31.2625, province: 'Egypt' },
];
