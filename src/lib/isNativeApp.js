/**
 * Detects whether the app is running inside the Base44 native app shell
 * (iOS/Android wrapper) rather than a normal browser. Used to hide web-only
 * flows — like Stripe checkout — that must happen on the published website.
 */
export function isNativeApp() {
  if (typeof window === 'undefined') return false;
  const w = window;
  // Capacitor-style native bridge, injected into the webview by native shells
  if (w.Capacitor && typeof w.Capacitor.isNativePlatform === 'function') {
    return w.Capacitor.isNativePlatform();
  }
  if (w.Capacitor || w.cordova) return true;
  const ua = (w.navigator && w.navigator.userAgent) || '';
  return /capacitor|cordova|base44[-_ ]native/i.test(ua);
}

export default isNativeApp;