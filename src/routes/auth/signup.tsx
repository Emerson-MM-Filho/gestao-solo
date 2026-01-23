import { LanguageToggle } from "@/components/language-toggle";
import { SignupForm } from "@/components/signup-form";
import { ModeToggle } from "@/components/theme-mode-toggle";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <header className="absolute top-4 right-4 flex gap-2">
        <LanguageToggle />
        <ModeToggle />
      </header>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
