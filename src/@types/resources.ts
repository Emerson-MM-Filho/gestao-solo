import enAccount from "@/locales/en/account.json";
import enAuth from "@/locales/en/auth.json";
import enCommon from "@/locales/en/common.json";
import enErrors from "@/locales/en/errors.json";
import enLanding from "@/locales/en/landing.json";
import enOrders from "@/locales/en/orders.json";
import enSettings from "@/locales/en/settings.json";
import enStock from "@/locales/en/stock.json";
import ptAccount from "@/locales/pt/account.json";
import ptAuth from "@/locales/pt/auth.json";
import ptCommon from "@/locales/pt/common.json";
import ptErrors from "@/locales/pt/errors.json";
import ptLanding from "@/locales/pt/landing.json";
import ptOrders from "@/locales/pt/orders.json";
import ptSettings from "@/locales/pt/settings.json";
import ptStock from "@/locales/pt/stock.json";

const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    auth: enAuth,
    errors: enErrors,
    account: enAccount,
    settings: enSettings,
    stock: enStock,
    orders: enOrders,
  },
  pt: {
    common: ptCommon,
    landing: ptLanding,
    auth: ptAuth,
    errors: ptErrors,
    account: ptAccount,
    settings: ptSettings,
    stock: ptStock,
    orders: ptOrders,
  },
} as const;

export default resources;
