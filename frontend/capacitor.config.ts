/*import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'frontend',
  webDir: 'www'
};

export default config;*/
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'frontend',
  webDir: 'www',
  // IMPORTANT pour le dev local : autorise la WebView à faire des requêtes
  // http:// (pas seulement https://) — sans ça, même avec
  // android:usesCleartextTraffic="true" dans le manifest, la WebView
  // Capacitor bloque quand même les appels vers ton backend en HTTP local.
  // À retirer (ou passer à false) une fois le backend derrière du HTTPS.
  server: {
    cleartext: true,
  },
};

export default config;
