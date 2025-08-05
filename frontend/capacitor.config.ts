import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.47706634d9c74a8cb0b144f9ac4c32a1',
  appName: 'my-virtual-room',
  webDir: 'dist',
  server: {
    url: 'https://47706634-d9c7-4a8c-b0b1-44f9ac4c32a1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;