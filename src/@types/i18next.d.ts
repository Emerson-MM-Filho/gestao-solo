import resources from "./resources";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    fallbackNS: "common";
    resources: (typeof resources)["en"];
  }
}
