import { ComponentExample } from "@/components/component-example"
import { ThemeProvider } from "./components/theme-provider"
export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="gestao-solo-theme">
      <ComponentExample />
    </ThemeProvider>
  );
}

export default App;
