import enAuth from "@/locales/en/auth.json";
import enCommon from "@/locales/en/common.json";
import enErrors from "@/locales/en/errors.json";
import enLanding from "@/locales/en/landing.json";
import ptAuth from "@/locales/pt/auth.json";
import ptCommon from "@/locales/pt/common.json";
import ptErrors from "@/locales/pt/errors.json";
import ptLanding from "@/locales/pt/landing.json";

const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    errors: enErrors,
  },
  pt: {
    common: ptCommon,
    landing: ptLanding,
    auth: ptAuth,
    errors: ptErrors,
  },
} as const;

export default resources;
