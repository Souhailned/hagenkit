"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

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

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold">Er ging iets mis</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw laden
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
