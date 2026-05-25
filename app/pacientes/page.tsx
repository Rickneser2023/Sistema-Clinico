"use client";

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { getPacientes } from '@/app/actions/pacientes';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  
  // Paginación
  const [skip, setSkip] = useState(0);
  const take = 10;
  const [totalRecords, setTotalRecords] = useState(0);

  const [isPending, startTransition] = useTransition();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Debounce logic para no bombardear el servidor
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPacientes();
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, genderFilter, skip]);

  // Si cambia un filtro, regresar a la primera página
  const handleFilterChange = (setter: any, value: string) => {
    setter(value);
    setSkip(0);
  };

  const fetchPacientes = () => {
    startTransition(async () => {
      setError(null);
      const res = await getPacientes({
        query: searchTerm,
        estado: statusFilter,
        genero: genderFilter,
        skip,
        take,
      });

      if (res.error) {
        setError(res.error);
        setPacientes([]);
      } else {
        setPacientes(res.data);
        setTotalRecords(res.total);
      }
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('estable')) return 'badge badge-estable';
    if (s.includes('observación') || s.includes('observacion')) return 'badge badge-observacion';
    if (s.includes('crítico') || s.includes('critico')) return 'badge badge-critico';
    return 'badge';
  };

  const handleQuickAction = (action: string, name: string) => {
    alert(`[Simulación] Acción "${action}" iniciada para el paciente: ${name}. Funcionalidad en desarrollo.`);
  };

  const totalPages = Math.ceil(totalRecords / take) || 1;
  const currentPage = Math.floor(skip / take) + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Cabecera y Controles de Búsqueda */}
      <Card>
        <div className="search-filter-row" style={{ margin: 0 }}>
          {/* Buscador */}
          <div className="search-box-wrapper">
            <svg className="search-box-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Buscar por nombre, id o contacto..." 
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="filter-group">
            {/* Filtro de Estado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <label htmlFor="status-select" className="detail-label" style={{ marginBottom: 0 }}>Estado:</label>
              <select 
                id="status-select"
                className="form-control" 
                style={{ padding: '0.4rem 0.75rem', width: '150px', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
              >
                <option value="ALL">Todos</option>
                <option value="Estable">Estable</option>
                <option value="En Observación">En Observación</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>

            {/* Filtro de Género */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '1rem' }}>
              <label htmlFor="gender-select" className="detail-label" style={{ marginBottom: 0 }}>Género:</label>
              <select 
                id="gender-select"
                className="form-control" 
                style={{ padding: '0.4rem 0.75rem', width: '130px', fontSize: '0.8rem' }}
                value={genderFilter}
                onChange={(e) => handleFilterChange(setGenderFilter, e.target.value)}
              >
                <option value="ALL">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla de Pacientes */}
      <Card title={`Pacientes Registrados (${totalRecords})`} subtitle="Gestión e historial clínico completo de los usuarios">
        
        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{ position: 'relative', minHeight: '300px' }}>
          {isPending && (
             <div style={{
               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
               backgroundColor: 'rgba(255, 255, 255, 0.6)', zIndex: 10,
               display: 'flex', justifyContent: 'center', alignItems: 'center'
             }}>
                <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Cargando datos...</div>
             </div>
          )}

          {pacientes.length === 0 && !isPending && !error ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary-light)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>No se encontraron pacientes</p>
              <p style={{ fontSize: '0.85rem' }}>Prueba modificando los filtros de búsqueda o registra uno nuevo.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Paciente</th>
                    <th>Edad / Género</th>
                    <th>Contacto</th>
                    <th>Última Consulta</th>
                    <th>Estado Clínico</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id}>
                      <td style={{ fontWeight: 700, color: 'var(--secondary-light)' }}>#{paciente.id.substring(0, 4)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '8px', 
                            backgroundColor: paciente.genero === 'Masculino' ? '#e0f2fe' : '#fce7f3', 
                            color: paciente.genero === 'Masculino' ? '#0369a1' : '#be185d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            {paciente.nombre.charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{paciente.nombre}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>Sangre: {paciente.tipoSangre}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{paciente.edad} años</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>{paciente.genero}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{paciente.contacto}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{paciente.ultimaConsulta}</td>
                      <td>
                        <span className={getStatusBadgeClass(paciente.estado)}>
                          {paciente.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="actions-cell" style={{ justifyContent: 'center' }}>
                          <Link 
                            href={`/pacientes/${paciente.id}`} 
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.35rem 0.75rem' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            Ver Historia
                          </Link>
                          
                          <Link 
                            href={`/nueva-historia?patientId=${paciente.id}`}
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '0.35rem' }}
                            title="Nueva Consulta para este paciente"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalRecords > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-light)' }}>
              Mostrando {pacientes.length} de {totalRecords} pacientes (Página {currentPage} de {totalPages})
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={skip === 0 || isPending}
                onClick={() => setSkip(Math.max(0, skip - take))}
              >
                Anterior
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                disabled={skip + take >= totalRecords || isPending}
                onClick={() => setSkip(skip + take)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
