import enAuth from "@/locales/en/auth.json";
import enCommon from "@/locales/en/common.json";
import enDashboard from "@/locales/en/dashboard.json";
import enErrors from "@/locales/en/errors.json";
import enLanding from "@/locales/en/landing.json";
import ptAuth from "@/locales/pt/auth.json";
import ptCommon from "@/locales/pt/common.json";
import ptDashboard from "@/locales/pt/dashboard.json";
import ptErrors from "@/locales/pt/errors.json";
import ptLanding from "@/locales/pt/landing.json";

const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    dashboard: enDashboard,
    errors: enErrors,
  },
  pt: {
    common: ptCommon,
    landing: ptLanding,
    auth: ptAuth,
    dashboard: ptDashboard,
    errors: ptErrors,
  },
} as const;

export default resources;
