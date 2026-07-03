"use client";

import React from "react";
import { validarAdelanto, rechazarAdelanto } from "@/app/actions/facturacion";
import { useToast } from "./ToastProvider";

export function ValidarBtn({ facturaId }: { facturaId: string }) {
  const { toast: addToast } = useToast();

  const handleClick = async () => {
    const res = await validarAdelanto(facturaId);
    addToast(res.message || (res.success ? "Adelanto validado" : "Error al validar adelanto"), res.success ? "success" : "error");
    if (res.success) {
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <button type="button" onClick={handleClick} className="btn btn-primary" style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}>
      Validar
    </button>
  );
}

export function RechazarBtn({ facturaId }: { facturaId: string }) {
  const { toast: addToast } = useToast();

  const handleClick = async () => {
    const res = await rechazarAdelanto(facturaId);
    addToast(res.message || (res.success ? "Adelanto rechazado" : "Error al rechazar adelanto"), res.success ? "success" : "error");
    if (res.success) {
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  return (
    <button type="button" onClick={handleClick} className="btn btn-danger" style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}>
      Rechazar
    </button>
  );
}
