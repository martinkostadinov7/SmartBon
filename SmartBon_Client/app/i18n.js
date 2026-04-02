import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import bg from './translations/bg.json';
import de from './translations/de.json';
import es from './translations/es.json';
import ja from './translations/ja.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    bg: { translation: bg },
    de: { translation: de },
    es: { translation: es },
    ja: { translation: ja },
  },
  lng: 'bg', 
  fallbackLng: 'en',
});

export default i18n;