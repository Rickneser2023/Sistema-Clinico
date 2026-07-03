"use client";

import React, { useRef } from "react";
import { useToast } from "./ToastProvider";

interface Props {
  facturaId: string;
  action: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  buttonLabel?: string;
}

export default function CobrarForm({ facturaId, action, buttonLabel = "Cobrar y completar" }: Props) {
  const { toast: addToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const res = await action(formData);
    addToast(res.message || (res.success ? "Operación exitosa" : "Error en la operación"), res.success ? "success" : "error");
    if (res.success) {
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input type="hidden" name="facturaId" value={facturaId} />
      <select name="metodo" className="form-control" style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem", height: "auto", minWidth: "80px" }}>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TARJETA">Tarjeta</option>
        <option value="TRANSFERENCIA">Transf.</option>
        <option value="YAPE">Yape</option>
        <option value="PLIN">Plin</option>
      </select>
      <button type="submit" className="btn btn-primary" style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}>
        {buttonLabel}
      </button>
    </form>
  );
}
