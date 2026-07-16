"use client";

import React, { useRef, useState } from "react";
import { useToast } from "./ToastProvider";

interface Props {
  facturaId: string;
  action: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  buttonLabel?: string;
}

export default function CobrarForm({ facturaId, action, buttonLabel = "Cobrar y completar" }: Props) {
  const { toast: addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [metodo, setMetodo] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const res = await action(formData);
    addToast(res.message || (res.success ? "Operación exitosa" : "Error en la operación"), res.success ? "success" : "error");
    if (res.success) {
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const showComprobante = metodo === 'YAPE' || metodo === 'TRANSFERENCIA' || metodo === 'PLIN';

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input type="hidden" name="facturaId" value={facturaId} />
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <select name="metodo" className="form-control" value={metodo} onChange={(e) => { setMetodo(e.target.value); setPreviewUrl(null); }} style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "auto", minWidth: "80px" }}>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transf.</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
        </select>
        <button type="submit" className="btn btn-primary" style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}>
          {buttonLabel}
        </button>
      </div>
      {showComprobante && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.7rem', color: 'var(--secondary-light)' }}>Comprobante (opcional)</label>
          <input type="file" name="comprobantePago" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleFileChange} style={{ fontSize: '0.7rem' }} />
          {previewUrl && (
            <div style={{ marginTop: '0.25rem' }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '120px', maxHeight: '80px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
            </div>
          )}
        </div>
      )}
    </form>
  );
}
