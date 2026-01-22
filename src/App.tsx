import { routeTree } from "@/routeTree.gen"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { ThemeProvider } from "./components/theme-provider"

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
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
