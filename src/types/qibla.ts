export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  cityName?: string;
  source: 'gps' | 'preset' | 'manual';
}

export interface QiblaResult {
  azimuthTrue: number; // 0-360 degrees from True North
  azimuthMagnetic: number; // 0-360 degrees from Magnetic North
  magneticDeclination: number; // in degrees
  inhiraf: {
    degrees: number;
    minutes: number;
    seconds: number;
    directionText: string; // e.g., "25° 13' 45'' dari Barat ke Utara (B-U)"
    quadrantText: string;
    rawDegrees: number;
  };
  distanceKm: number;
  // Classical Rubu' Mujayyab values (Radius = 60)
  rubu: {
    ardhulBalad: number; // phi in degrees
    thululBalad: number; // lambda in degrees
    ardhuMakkah: number; // 21.4225
    thuluMakkah: number; // 39.8262
    fadhlutThulain: number; // |lambda - lambda_m|
    jaybFadhlitThulain: number; // 60 * sin(delta_lambda)
    jaybArdhMakkah: number; // 60 * sin(phi_m)
    jaybTamamArdhMakkah: number; // 60 * cos(phi_m)
    jaybArdhBalad: number; // 60 * sin(phi)
    jaybTamamArdhBalad: number; // 60 * cos(phi)
    ashlMutlaq: number;
    hishshahKiblat: number;
    irtifaMakkah: number;
    sinQibla: number;
    cosQibla: number;
    jaybInhiraf: number; // 60 * sin(inhiraf)
    jaybTamamInhiraf: number; // 60 * cos(inhiraf)
    zhillMabsuth: number; // Shadow length on 12 scale: 12 * cot(inhiraf)
    zhillMankus: number; // 12 * tan(inhiraf)
  };
}

export interface SolarPosition {
  declination: number;
  equationOfTime: number; // minutes
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from North
  shadowAzimuth: number; // opposite of azimuth (azimuth + 180) % 360
  isAboveHorizon: boolean;
}

export interface RashdulQiblahToday {
  hasEventToday: boolean;
  eventTime: Date | null;
  timeString: string;
  solarAltitudeAtEvent: number;
  type: 'direct' | 'antipodal' | 'none';
  description: string;
}

export interface CompassData {
  heading: number | null; // 0-360
  pitch: number | null; // beta (-180 to 180)
  roll: number | null; // gamma (-90 to 90)
  accuracy: number | null;
  isLevel: boolean; // within tilt threshold
  isAvailable: boolean;
  isCalibrated: boolean;
  needsPermission: boolean;
  isSupported: boolean;
}
