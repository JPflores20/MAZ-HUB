/**
 * Inicialización global de internacionalización (i18next) con diccionarios modulares en Español e Inglés.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { TRADUCCION_EN } from "./locales/en";
import { TRADUCCION_ES } from "./locales/es";

const recursos_idioma = {
  en: { translation: TRADUCCION_EN },
  es: { translation: TRADUCCION_ES },
};

i18n.use(initReactI18next).init({
  resources: recursos_idioma,
  lng: "es",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
