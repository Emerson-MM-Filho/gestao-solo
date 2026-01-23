import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1 className="text-xl font-bold">Welcome to the Home Page</h1>
      <br />
      <Link to="/auth/signin">Sign In</Link>
      <br />
      <br />
      <Link to="/auth/signup">Sign Up</Link>
    </div>
  );
}
