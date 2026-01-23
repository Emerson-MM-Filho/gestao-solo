import { useAuth } from "@/components/auth-provider"
import { ModeToggle } from "@/components/theme-mode-toggle"
import { Button } from "@/components/ui/button"
import { Icon3dCubeSphere } from "@tabler/icons-react"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with theme toggle */}
      <header className="absolute top-4 right-4">
        <ModeToggle />
      </header>

      {/* Hero Section - Centered, full viewport */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="size-16 flex items-center justify-center">
              <Icon3dCubeSphere className="size-16" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Gestão Solo</h1>
            <p className="text-lg text-muted-foreground">
              Manage your projects efficiently
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth/signup">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth/signin">Sign In</Link>
                </Button>
              </>
            ) : (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>

          {/* Optional status badge */}
          {user && (
            <p className="text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </div>
        <p className="mt-2">© 2026 Gestão Solo. All rights reserved.</p>
      </footer>
    </div>
  );
}
