"use client";

import {
  Icon3dCubeSphere,
  IconChartBar,
  IconPackage,
  IconReceipt,
  IconSettings,
} from "@tabler/icons-react"
import * as React from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/components/auth-provider"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { t } = useTranslation(["common"]);

  const navMain = [
    {
      title: t("common:navigation.orders"),
      url: "/orders",
      icon: IconReceipt,
    },
    {
      title: t("common:navigation.stock"),
      url: "/stock",
      icon: IconPackage,
    },
    {
      title: t("common:navigation.reports"),
      url: "/reports",
      icon: IconChartBar,
    },
    {
      title: t("common:navigation.settings"),
      url: "/settings",
      icon: IconSettings,
    },
  ];

  const userData = {
    name:
      user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User",
    email: user?.email || "",
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-14 items-center gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Icon3dCubeSphere className="size-5" />
          </div>
          <span className="text-lg font-semibold truncate group-data-[collapsible=icon]:hidden">
            {t("common:appName")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
