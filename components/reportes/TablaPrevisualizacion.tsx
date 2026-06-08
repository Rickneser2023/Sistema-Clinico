"use client";

import React from 'react';

interface TablaPrevisualizacionProps {
  data: any[];
  columns: { key: string; label: string }[];
  isLoading: boolean;
}

export default function TablaPrevisualizacion({ data, columns, isLoading }: TablaPrevisualizacionProps) {
  if (isLoading) {
    return (
      <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--secondary-light)', fontSize: '1.1rem' }}>Generando reporte...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--secondary-light)', fontSize: '1.1rem' }}>No se encontraron datos para los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Previsualización de Datos</h3>
        <span className="badge badge-primary" style={{ padding: '0.3rem 0.6rem' }}>{data.length} registros</span>
      </div>
      
      <div className="table-responsive">
        <table className="clinical-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.key === 'estado' ? (
                        <span className={`badge ${row[col.key] === 'COMPLETADA' ? 'badge-estable' : row[col.key] === 'CANCELADA' ? 'badge-critico' : 'badge-observacion'}`}>
                            {row[col.key]}
                        </span>
                    ) : col.key === 'estadoPago' ? (
                        <span className={`badge ${row[col.key] === 'PAGADO' ? 'badge-estable' : row[col.key] === 'PENDIENTE' ? 'badge-observacion' : 'badge-critico'}`}>
                            {row[col.key]}
                        </span>
                    ) : (
                        row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
