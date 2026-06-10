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

  const exportToCSV = () => {
    if (data.length === 0) {
      alert("No hay datos para exportar");
      return;
    }
    const columns = getColumns();
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => {
      let value = row[c.key] !== null && row[c.key] !== undefined ? String(row[c.key]) : '';
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_${tipoReporte.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>Generador de Reportes</h1>
          <p style={{ color: 'var(--secondary-light)', margin: '0.2rem 0 0 0' }}>Análisis dinámico y exportación de datos clínicos</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
            <button className="btn btn-secondary" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              CSV / Excel
            </button>
            <button className="btn btn-secondary" onClick={printReport} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              PDF / Imprimir
            </button>
          </div>
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
