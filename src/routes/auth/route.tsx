import { ModeToggle } from "@/components/theme-mode-toggle"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <ModeToggle className="absolute top-4 right-4" />
      <Outlet />
    </div>
  );
}
