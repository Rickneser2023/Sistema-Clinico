"use client";

import React, { useState, useEffect } from 'react';
import { getOpcionesFiltros } from '@/app/actions/reportes';

interface FiltrosReporteProps {
  tipoReporte: 'CITAS' | 'HISTORIAS' | 'FINANZAS';
  onFilterChange: (filtros: any) => void;
}

export default function FiltrosReporte({ tipoReporte, onFilterChange }: FiltrosReporteProps) {
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    medicoId: 'ALL',
    estadoCita: 'ALL',
    estadoPago: 'ALL'
  });

  const [opcionesMedicos, setOpcionesMedicos] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    async function loadOpciones() {
      const ops = await getOpcionesFiltros();
      setOpcionesMedicos(ops.medicos);
    }
    loadOpciones();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onFilterChange(filtros);
  };

  const handleClear = () => {
    const defaultFiltros = {
      fechaInicio: '',
      fechaFin: '',
      medicoId: 'ALL',
      estadoCita: 'ALL',
      estadoPago: 'ALL'
    };
    setFiltros(defaultFiltros);
    onFilterChange(defaultFiltros);
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Filtros Avanzados</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Rango de Fechas (Común a todos) */}
        <div className="form-group">
          <label className="form-label">Fecha Inicio</label>
          <input 
            type="date" 
            className="form-input" 
            name="fechaInicio" 
            value={filtros.fechaInicio} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha Fin</label>
          <input 
            type="date" 
            className="form-input" 
            name="fechaFin" 
            value={filtros.fechaFin} 
            onChange={handleChange} 
          />
        </div>

        {/* Filtros para Citas e Historias */}
        {(tipoReporte === 'CITAS' || tipoReporte === 'HISTORIAS') && (
          <div className="form-group">
            <label className="form-label">Médico</label>
            <select className="form-select" name="medicoId" value={filtros.medicoId} onChange={handleChange}>
              <option value="ALL">Todos los Médicos</option>
              {opcionesMedicos.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtros específicos de Citas */}
        {tipoReporte === 'CITAS' && (
          <div className="form-group">
            <label className="form-label">Estado de Cita</label>
            <select className="form-select" name="estadoCita" value={filtros.estadoCita} onChange={handleChange}>
              <option value="ALL">Todos los Estados</option>
              <option value="PROGRAMADA">Programada</option>
              <option value="EN_CURSO">En Curso</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        )}

        {/* Filtros específicos de Finanzas */}
        {tipoReporte === 'FINANZAS' && (
          <div className="form-group">
            <label className="form-label">Estado de Pago</label>
            <select className="form-select" name="estadoPago" value={filtros.estadoPago} onChange={handleChange}>
              <option value="ALL">Todos los Estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="ANULADA">Anulada</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button className="btn btn-secondary" onClick={handleClear}>Limpiar</button>
        <button className="btn btn-primary" onClick={handleApply}>Aplicar Filtros</button>
      </div>
    </div>
  );
}
