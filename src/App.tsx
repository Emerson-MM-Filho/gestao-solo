import { routeTree } from "@/routeTree.gen"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "./components/auth-provider"

const router = createRouter({
  routeTree,
  basepath: "/gestao-solo",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gestao-solo-theme">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
