"use client";

import React, { useState, useEffect } from 'react';
import FiltrosReporte from '@/components/reportes/FiltrosReporte';
import TablaPrevisualizacion from '@/components/reportes/TablaPrevisualizacion';
import { getReporteCitas, getReporteHistorias, getReporteFinanciero } from '@/app/actions/reportes';
import Card from '@/components/Card';

type TipoReporte = 'CITAS' | 'HISTORIAS' | 'FINANZAS';

export default function GeneradorReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('CITAS');
  const [data, setData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const fetchReporte = async (tipo: TipoReporte, filtros: any) => {
    setIsLoading(true);
    setCurrentFilters(filtros);
    let result: any = { data: [], kpis: null };

    if (tipo === 'CITAS') {
      result = await getReporteCitas(filtros);
    } else if (tipo === 'HISTORIAS') {
      result = await getReporteHistorias(filtros);
    } else if (tipo === 'FINANZAS') {
      result = await getReporteFinanciero(filtros);
    }

    setData(result.data || []);
    setKpis(result.kpis || null);
    setIsLoading(false);
  };

  // Initial fetch when type changes
  useEffect(() => {
    fetchReporte(tipoReporte, {});
  }, [tipoReporte]);

  const handleFilterChange = (filtros: any) => {
    fetchReporte(tipoReporte, filtros);
  };

  const renderKPIs = () => {
    if (!kpis) return null;

    if (tipoReporte === 'CITAS') {
      return (
        <section className="kpi-grid" aria-label="Indicadores del Reporte" style={{ marginBottom: '1.5rem' }}>
          <div className="card kpi-card">
            <div className="kpi-info">
              <span className="kpi-value">{kpis.total}</span>
              <span className="kpi-label">Total de Citas</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-info">
              <span className="kpi-value" style={{ color: 'var(--color-estable)' }}>{kpis.completadas}</span>
              <span className="kpi-label">Citas Completadas</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-info">
              <span className="kpi-value" style={{ color: 'var(--color-critico)' }}>{kpis.canceladas}</span>
              <span className="kpi-label">Citas Canceladas</span>
            </div>
          </div>
          <div className="card kpi-card">
            <div className="kpi-info">
              <span className="kpi-value">{kpis.tasaCancelacion}</span>
              <span className="kpi-label">Tasa de Cancelación</span>
            </div>
          </div>
        </section>
      );
    }

    if (tipoReporte === 'FINANZAS') {
        return (
          <section className="kpi-grid" aria-label="Indicadores Financieros" style={{ marginBottom: '1.5rem' }}>
            <div className="card kpi-card">
              <div className="kpi-info">
                <span className="kpi-value">{kpis.totalFacturas}</span>
                <span className="kpi-label">Total Transacciones</span>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-info">
                <span className="kpi-value" style={{ color: 'var(--color-estable)' }}>{kpis.ingresosTotales}</span>
                <span className="kpi-label">Ingresos Pagados</span>
              </div>
            </div>
            <div className="card kpi-card">
              <div className="kpi-info">
                <span className="kpi-value" style={{ color: 'var(--color-observacion)' }}>{kpis.montosPendientes}</span>
                <span className="kpi-label">Montos Pendientes</span>
              </div>
            </div>
          </section>
        );
      }
      
      if (tipoReporte === 'HISTORIAS') {
        return (
          <section className="kpi-grid" aria-label="Indicadores de Atención" style={{ marginBottom: '1.5rem' }}>
            <div className="card kpi-card">
              <div className="kpi-info">
                <span className="kpi-value">{kpis.totalAtenciones}</span>
                <span className="kpi-label">Total de Atenciones</span>
              </div>
            </div>
          </section>
        );
      }

    return null;
  };

  const getColumns = () => {
    if (tipoReporte === 'CITAS') {
      return [
        { key: 'fecha', label: 'Fecha' },
        { key: 'hora', label: 'Hora' },
        { key: 'paciente', label: 'Paciente' },
        { key: 'medico', label: 'Médico' },
        { key: 'especialidad', label: 'Especialidad' },
        { key: 'estado', label: 'Estado' }
      ];
    }
    if (tipoReporte === 'HISTORIAS') {
      return [
        { key: 'fecha', label: 'Fecha' },
        { key: 'paciente', label: 'Paciente' },
        { key: 'medico', label: 'Médico Atendió' },
        { key: 'motivo', label: 'Motivo' },
        { key: 'diagnostico', label: 'Diagnóstico' }
      ];
    }
    if (tipoReporte === 'FINANZAS') {
      return [
        { key: 'fecha', label: 'Fecha Emisión' },
        { key: 'paciente', label: 'Paciente' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'monto', label: 'Monto' },
        { key: 'metodoPago', label: 'Método' },
        { key: 'estadoPago', label: 'Estado' }
      ];
    }
    return [];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>Generador de Reportes</h1>
          <p style={{ color: 'var(--secondary-light)', margin: '0.2rem 0 0 0' }}>Análisis dinámico y exportación de datos clínicos</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${tipoReporte === 'CITAS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTipoReporte('CITAS')}
          >
            Reporte de Citas
          </button>
          <button 
            className={`btn ${tipoReporte === 'HISTORIAS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTipoReporte('HISTORIAS')}
          >
            Historias Clínicas
          </button>
          <button 
            className={`btn ${tipoReporte === 'FINANZAS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTipoReporte('FINANZAS')}
          >
            Reporte Financiero
          </button>
        </div>
      </div>

      <FiltrosReporte tipoReporte={tipoReporte} onFilterChange={handleFilterChange} />

      {renderKPIs()}

      <TablaPrevisualizacion 
        data={data} 
        columns={getColumns()} 
        isLoading={isLoading} 
      />

    </div>
  );
}
