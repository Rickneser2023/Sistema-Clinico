"use client";

import { useState } from "react";

interface Props {
  facturaId: string;
  comprobanteUrl: string | null;
}

export default function ComprobantePreview({ facturaId, comprobanteUrl }: Props) {
  const [open, setOpen] = useState(false);

  const src = comprobanteUrl === "DB"
    ? `/api/comprobante/${facturaId}`
    : comprobanteUrl || null;

  if (!src) {
    return <span className="text-muted">Sin archivo</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: "none", border: "none", color: "var(--primary-color)",
          fontWeight: 700, cursor: "pointer", padding: 0, fontSize: "inherit",
        }}
      >
        Ver
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)", borderRadius: "16px",
              maxWidth: "90vw", maxHeight: "90vh", overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-color)",
            }}>
              <span style={{ fontWeight: 700, color: "var(--secondary-color)" }}>Comprobante</span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary-light)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ padding: "1rem", overflow: "auto", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Comprobante"
                style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px", objectFit: "contain" }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  target.parentElement!.innerHTML =
                    '<p style="color: var(--color-critico); padding: 2rem;">No se pudo cargar el comprobante</p>';
                }}
              />
            </div>
            <div style={{
              display: "flex", gap: "0.5rem", justifyContent: "flex-end",
              padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border-color)",
            }}>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "0.4rem 1rem", borderRadius: "8px", fontSize: "0.85rem",
                  backgroundColor: "var(--primary-color)", color: "white",
                  textDecoration: "none", fontWeight: 600,
                }}
              >
                Abrir en nueva pestaña
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
