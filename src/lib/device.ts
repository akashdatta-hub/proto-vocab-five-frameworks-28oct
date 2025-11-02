// Device tracking utilities for analytics

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  browserVersion: string;
  os: string;
  screenSize: string;
  language: string;
  timezone: string;
  isTouch: boolean;
  deviceFingerprint: string;
}

// Generate a simple device fingerprint (for anonymous tracking)
export const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];

  const fingerprint = components.join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return 'fp_' + Math.abs(hash).toString(36);
};

// Detect device type based on screen size and user agent
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|windows phone/i.test(ua)) {
    return 'mobile';
  }

  if (width < 768) {
    return 'mobile';
  } else if (width >= 768 && width < 1024) {
    return 'tablet';
  }

  return 'desktop';
};

// Detect browser name and version
export const getBrowserInfo = (): { browser: string; version: string } => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';

  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Safari';
    version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    browser = 'Edge';
    version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browser = 'Opera';
    version = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1] || 'Unknown';
  }

  return { browser, version };
};

// Detect operating system
export const getOS = (): string => {
  const ua = navigator.userAgent;

  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';

  return 'Unknown';
};

// Get comprehensive device information
export const getDeviceInfo = (): DeviceInfo => {
  const { browser, version } = getBrowserInfo();

  return {
    deviceType: getDeviceType(),
    browser,
    browserVersion: version,
    os: getOS(),
    screenSize: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    deviceFingerprint: generateDeviceFingerprint(),
  };
};

// Store device info in sessionStorage (persists for the session)
const DEVICE_INFO_KEY = 'pvf_device_info';

export const getOrCreateDeviceInfo = (): DeviceInfo => {
  try {
    const stored = sessionStorage.getItem(DEVICE_INFO_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load device info:', error);
  }

  const deviceInfo = getDeviceInfo();

  try {
    sessionStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
  } catch (error) {
    console.error('Failed to save device info:', error);
  }

  return deviceInfo;
};
