import { routeTree } from "@/routeTree.gen"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { AuthProvider } from "./components/auth-provider"
import { ThemeProvider } from "./components/theme-provider"

const router = createRouter({
  routeTree,
  basepath: import.meta.env.VITE_BASE_PATH || "/",
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
