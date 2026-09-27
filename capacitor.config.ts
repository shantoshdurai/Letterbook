import type { CapacitorConfig } from '@capacitor/cli';

// Android shell for the web app. The APK is built by .github/workflows/release-android.yml.
const config: CapacitorConfig = {
  appId: 'io.github.shantoshdurai.letterbook',
  appName: 'Letterbook',
  webDir: 'dist',
  backgroundColor: '#14181c',
  android: {
    allowMixedContent: false,
  },
};

export default config;
