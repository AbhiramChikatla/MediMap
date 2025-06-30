// Check if the app is installed as a PWA

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check if the app is running in standalone mode (installed as PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://');
  
  return isStandalone;
}