import { IconAlertTriangle } from "@tabler/icons-react"
import type { ErrorInfo, ReactNode } from "react"
import { Component } from "react"
import i18n from "@/i18n"
import { Button } from "./ui/button"

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <IconAlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">
            {i18n.t("orders:errorBoundary.title")}
          </h2>
          <p className="mb-6 text-center text-muted-foreground">
            {this.state.error?.message ||
              i18n.t("orders:errorBoundary.description")}
          </p>
          <div className="flex gap-2">
            <Button onClick={this.handleReset}>
              {i18n.t("orders:errorBoundary.tryAgain")}
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {i18n.t("orders:errorBoundary.reloadPage")}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
