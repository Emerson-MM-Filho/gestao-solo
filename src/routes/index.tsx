import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">Welcome to the Home Page</h1>
      <br />
      <Link to="/auth/signin" className="text-primary hover:underline">
        Sign In
      </Link>
      <br />
      <br />
      <Link to="/auth/signup" className="text-primary hover:underline">
        Sign Up
      </Link>
      <br />
      <br />
      <Link to="/dashboard" className="text-primary hover:underline">
        Dashboard
      </Link>
    </div>
  );
}
