import { IconLanguage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle({
  showLabel = false
}: {
  showLabel?: boolean
}) {
  const { i18n, t } = useTranslation(["settings"]);

  const languages = [
    { code: "en", label: t("settings:settings.language.options.en") },
    { code: "pt", label: t("settings:settings.language.options.pt") },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={showLabel ? "default" : "icon"}>
          <IconLanguage className="size-[1.2rem]" />
          {showLabel && currentLanguage && (
            <span className="ml-2">{currentLanguage.label}</span>
          )}
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={i18n.language === lang.code ? "font-bold" : ""}
          >
            {lang.label}
            {i18n.language === lang.code && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
