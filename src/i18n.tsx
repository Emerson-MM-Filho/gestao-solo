import resources from "@/@types/resources"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

export const defaultNS = "common";
export const fallbackNS = "common";

// Get initial language from localStorage or default to 'pt'
const getInitialLanguage = (): string => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("language");
    if (saved && ["en", "pt"].includes(saved)) {
      return saved;
    }
  }
  return "pt";
};

i18n.use(initReactI18next).init({
  fallbackLng: "pt",
  lng: getInitialLanguage(),
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  defaultNS,
  fallbackNS,
  resources,
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lng);
  }
});

export default i18n;
