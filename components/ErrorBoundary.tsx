"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: "2rem", textAlign: "center", color: "var(--color-critico)",
          backgroundColor: "var(--bg-critico)", borderRadius: "12px",
          margin: "1rem", border: "1px solid var(--color-critico)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: "0.5rem" }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 style={{ marginBottom: "0.5rem" }}>Algo salio mal</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>{this.state.error?.message || "Error inesperado en la interfaz."}</p>
          <button onClick={() => window.location.reload()} style={{
            marginTop: "1rem", padding: "0.5rem 1rem", borderRadius: "8px",
            border: "none", backgroundColor: "var(--primary-color)", color: "white",
            cursor: "pointer", fontWeight: 600,
          }}>
            Recargar pagina
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
