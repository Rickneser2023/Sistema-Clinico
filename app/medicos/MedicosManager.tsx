"use client";

import React, { useState, useTransition } from 'react';
import Card from '@/components/Card';
import { 
  createMedico, 
  updateMedico,
  toggleMedicoEstado, 
  deleteMedico, 
  createBox, 
  deleteBox, 
  updateBoxState,
  createEspecialidad,
  deleteEspecialidad
} from '@/app/actions/infraestructura';

interface Medico {
  id: string;
  especialidad: string;
  especialidades: string[];
  numColegiatura: string;
  estado: "ACTIVO" | "INACTIVO";
  user: {
    nombre: string;
    email: string;
  };
}

interface Box {
  id: string;
  nombre: string;
  capacidad: number;
  tipo: string;
  estado: "DISPONIBLE" | "OCUPADO" | "MANTENIMIENTO";
}

interface Especialidad {
  id: string;
  nombre: string;
  precioBase: number;
}

interface MedicosManagerProps {
  medicos: Medico[];
  boxes: Box[];
  especialidades: Especialidad[];
}

export default function MedicosManager({ medicos, boxes, especialidades }: MedicosManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Medico (crear)
  const [showMedicoForm, setShowMedicoForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [numColegiatura, setNumColegiatura] = useState('');
  const [medicoEspIds, setMedicoEspIds] = useState<string[]>([]);

  // Edit Medico
  const [showEditForm, setShowEditForm] = useState(false);
  const [editMedicoId, setEditMedicoId] = useState('');
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEspecialidad, setEditEspecialidad] = useState('');
  const [editNumColegiatura, setEditNumColegiatura] = useState('');
  const [editEspIds, setEditEspIds] = useState<string[]>([]);

  // Form Box
  const [showBoxForm, setShowBoxForm] = useState(false);
  const [boxNombre, setBoxNombre] = useState('');
  const [boxTipo, setBoxTipo] = useState('');
  const [boxCapacidad, setBoxCapacidad] = useState(1);
  const [boxEspecialidadId, setBoxEspecialidadId] = useState('');

  // Form Especialidad
  const [showEspForm, setShowEspForm] = useState(false);
  const [espNombre, setEspNombre] = useState('');
  const [espPrecioBase, setEspPrecioBase] = useState('0.00');

  const toggleEspInList = (ids: string[], setIds: (v: string[]) => void, espId: string) => {
    setIds(ids.includes(espId) ? ids.filter(i => i !== espId) : [...ids, espId]);
  };

  const handleAddMedico = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("email", email);
    formData.append("especialidadId", especialidad);
    formData.append("numColegiatura", numColegiatura);
    formData.append("especialidadesIds", JSON.stringify(medicoEspIds));

    startTransition(async () => {
      setErrorMsg(null);
      const res = await createMedico(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setNombre('');
        setEmail('');
        setEspecialidad('');
        setNumColegiatura('');
        setMedicoEspIds([]);
        setShowMedicoForm(false);
      }
    });
  };

  const openEditForm = (m: Medico) => {
    setEditMedicoId(m.id);
    setEditNombre(m.user.nombre);
    setEditEmail(m.user.email);
    setEditEspecialidad(especialidades.find(e => e.nombre === m.especialidad)?.id || '');
    setEditNumColegiatura(m.numColegiatura);
    setEditEspIds(m.especialidades.filter(n => n !== m.especialidad).map(n => especialidades.find(e => e.nombre === n)?.id).filter(Boolean) as string[]);
    setShowEditForm(true);
    setShowMedicoForm(false);
  };

  const handleEditMedico = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("medicoId", editMedicoId);
    formData.append("nombre", editNombre);
    formData.append("email", editEmail);
    formData.append("especialidadId", editEspecialidad);
    formData.append("numColegiatura", editNumColegiatura);
    formData.append("especialidadesIds", JSON.stringify(editEspIds));

    startTransition(async () => {
      setErrorMsg(null);
      const res = await updateMedico(null as any, formData);
      if (!res.success) {
        setErrorMsg(res.error || "Error al actualizar");
      } else {
        setShowEditForm(false);
      }
    });
  };

  const handleAddBox = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", boxNombre);
    formData.append("tipo", boxTipo);
    formData.append("capacidad", boxCapacidad.toString());
    formData.append("especialidadId", boxEspecialidadId);

    startTransition(async () => {
      setErrorMsg(null);
      const res = await createBox(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setBoxNombre('');
        setBoxTipo('');
        setBoxCapacidad(1);
        setBoxEspecialidadId('');
        setShowBoxForm(false);
      }
    });
  };

  const handleAddEspecialidad = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", espNombre);
    formData.append("precioBase", espPrecioBase);

    startTransition(async () => {
      setErrorMsg(null);
      const res = await createEspecialidad(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setEspNombre('');
        setEspPrecioBase('0.00');
        setShowEspForm(false);
      }
    });
  };

  const handleDeleteEspecialidad = (espId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta especialidad? Esto podría afectar a los médicos y consultorios vinculados.")) return;
    startTransition(async () => {
      setErrorMsg(null);
      const res = await deleteEspecialidad(espId);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const handleToggleEstado = (medicoId: string, currentState: "ACTIVO" | "INACTIVO") => {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await toggleMedicoEstado(medicoId, currentState);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const handleDeleteMedico = (medicoId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar permanentemente este médico?")) return;
    startTransition(async () => {
      setErrorMsg(null);
      const res = await deleteMedico(medicoId);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const handleDeleteBox = (boxId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este consultorio?")) return;
    startTransition(async () => {
      setErrorMsg(null);
      const res = await deleteBox(boxId);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const handleBoxStateChange = (boxId: string, newState: "DISPONIBLE" | "OCUPADO" | "MANTENIMIENTO") => {
    startTransition(async () => {
      setErrorMsg(null);
      const res = await updateBoxState(boxId, newState);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const EspSelector = ({ ids, setIds }: { ids: string[], setIds: (v: string[]) => void }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {especialidades.map(esp => (
        <label
          key={esp.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600,
            cursor: 'pointer', border: '1px solid var(--border-color)',
            backgroundColor: ids.includes(esp.id) ? 'rgba(59,130,246,0.12)' : 'transparent',
            color: ids.includes(esp.id) ? '#3b82f6' : 'var(--secondary-light)',
            transition: 'all 0.15s'
          }}
        >
          <input
            type="checkbox"
            checked={ids.includes(esp.id)}
            onChange={() => toggleEspInList(ids, setIds, esp.id)}
            style={{ width: 14, height: 14, accentColor: '#3b82f6', cursor: 'pointer' }}
          />
          {esp.nombre}
        </label>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #f87171' }}>
          <strong>Error: </strong> {errorMsg}
        </div>
      )}

      {/* Resumen rápido */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Médicos Activos', valor: medicos.filter(m => m.estado === 'ACTIVO').length, color: '#10b981' },
          { label: 'Médicos Inactivos', valor: medicos.filter(m => m.estado === 'INACTIVO').length, color: '#ef4444' },
          { label: 'Boxes Disponibles', valor: boxes.filter(c => c.estado === 'DISPONIBLE').length, color: '#3b82f6' },
          { label: 'Boxes en Mantenimiento', valor: boxes.filter(c => c.estado === 'MANTENIMIENTO').length, color: '#f59e0b' },
        ].map(item => (
          <div key={item.label} className="card" style={{ flex: 1, minWidth: '160px', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.valor}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary-light)', textAlign: 'center' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Sección Médicos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Personal Médico</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => { setShowMedicoForm(!showMedicoForm); setShowEditForm(false); }}
            >
              {showMedicoForm ? "Cancelar" : "+ Registrar Médico"}
            </button>
          </div>

          {showMedicoForm && (
            <Card title="Nuevo Médico">
              <form onSubmit={handleAddMedico} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Especialidad Principal (usa esta para precios en agenda)</label>
                  <select 
                    className="form-control" 
                    value={especialidad} 
                    onChange={e => { setEspecialidad(e.target.value); if (!medicoEspIds.includes(e.target.value)) setMedicoEspIds([...medicoEspIds, e.target.value]); }}
                    required
                  >
                    <option value="">-- SELECCIONE ESPECIALIDAD --</option>
                    {especialidades.map(esp => (
                      <option key={esp.id} value={esp.id}>{esp.nombre} (${esp.precioBase.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Otras Especialidades</label>
                  <EspSelector ids={medicoEspIds} setIds={setMedicoEspIds} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nº Colegiatura</label>
                  <input type="text" className="form-control" placeholder="Ej: CMP-98213" value={numColegiatura} onChange={e => setNumColegiatura(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Registrando..." : "Guardar Médico"}
                </button>
              </form>
            </Card>
          )}

          {showEditForm && (
            <Card title="Editar Médico">
              <form onSubmit={handleEditMedico} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-control" value={editNombre} onChange={e => setEditNombre(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Especialidad Principal</label>
                  <select 
                    className="form-control" 
                    value={editEspecialidad} 
                    onChange={e => { setEditEspecialidad(e.target.value); if (!editEspIds.includes(e.target.value)) setEditEspIds([...editEspIds, e.target.value]); }}
                    required
                  >
                    <option value="">-- SELECCIONE ESPECIALIDAD --</option>
                    {especialidades.map(esp => (
                      <option key={esp.id} value={esp.id}>{esp.nombre} (${esp.precioBase.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Otras Especialidades</label>
                  <EspSelector ids={editEspIds} setIds={setEditEspIds} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nº Colegiatura</label>
                  <input type="text" className="form-control" placeholder="Ej: CMP-98213" value={editNumColegiatura} onChange={e => setEditNumColegiatura(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditForm(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card title="Listado de Médicos" subtitle="Médicos autorizados e integrados en agenda">
            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Colegiatura</th>
                    <th>Especialidad Principal</th>
                    <th>Otras Especialidades</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.user.nombre}</td>
                      <td style={{ fontSize: '0.85rem' }}>{m.numColegiatura}</td>
                      <td>{m.especialidad}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {m.especialidades.filter(n => n !== m.especialidad).map(esp => (
                            <span key={esp} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>
                              {esp}
                            </span>
                          ))}
                          {m.especialidades.filter(n => n !== m.especialidad).length === 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${m.estado === 'ACTIVO' ? 'badge-estable' : 'badge-critico'}`}>
                          {m.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditForm(m)}
                            disabled={isPending}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleToggleEstado(m.id, m.estado)}
                            disabled={isPending}
                          >
                            {m.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--color-critico)', borderColor: 'var(--color-critico)' }}
                            onClick={() => handleDeleteMedico(m.id)}
                            disabled={isPending}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {medicos.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-light)' }}>
                        No hay médicos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sección Boxes y Especialidades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Sección Boxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Boxes / Consultorios</h2>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowBoxForm(!showBoxForm)}
              >
                {showBoxForm ? "Cancelar" : "+ Registrar Box"}
              </button>
            </div>

            {showBoxForm && (
              <Card title="Nuevo Consultorio (Box)">
                <form onSubmit={handleAddBox} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Identificador / Nombre</label>
                    <input type="text" className="form-control" placeholder="Ej: Box 102 o Rayos X" value={boxNombre} onChange={e => setBoxNombre(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo del Box (Infraestructura)</label>
                    <input type="text" className="form-control" placeholder="Ej: Consultorio, Sala de Procedimientos" value={boxTipo} onChange={e => setBoxTipo(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Especialidad Asignada al Box</label>
                    <select 
                      className="form-control" 
                      value={boxEspecialidadId} 
                      onChange={e => setBoxEspecialidadId(e.target.value)} 
                      required
                    >
                      <option value="">-- SELECCIONE ESPECIALIDAD --</option>
                      {especialidades.map(esp => (
                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacidad de Atención</label>
                    <input type="number" className="form-control" min={1} value={boxCapacidad} onChange={e => setBoxCapacidad(parseInt(e.target.value) || 1)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "Registrando..." : "Guardar Consultorio"}
                  </button>
                </form>
              </Card>
            )}

            <Card title="Listado de Consultorios" subtitle="Mapa de infraestructura física">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {boxes.map(box => (
                  <div 
                    key={box.id} 
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      backgroundColor: box.estado === 'DISPONIBLE' ? 'rgba(16,185,129,0.05)' : box.estado === 'MANTENIMIENTO' ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700 }}>{box.nombre}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>{box.tipo} (Capacidad: {box.capacidad})</span>
                      </div>
                      <span className={`badge ${box.estado === 'DISPONIBLE' ? 'badge-estable' : box.estado === 'MANTENIMIENTO' ? 'badge-observacion' : 'badge-critico'}`}>
                        {box.estado}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <select 
                        className="form-control" 
                        style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        value={box.estado}
                        onChange={e => handleBoxStateChange(box.id, e.target.value as any)}
                        disabled={isPending}
                      >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="OCUPADO">Ocupado</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                      </select>
                      
                      <button 
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-critico)', borderColor: 'var(--color-critico)', padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                        onClick={() => handleDeleteBox(box.id)}
                        disabled={isPending}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                {boxes.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--secondary-light)', padding: '1.5rem' }}>
                    No hay consultorios registrados.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sección Especialidades */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Especialidades y Tarifas</h2>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowEspForm(!showEspForm)}
              >
                {showEspForm ? "Cancelar" : "+ Registrar Especialidad"}
              </button>
            </div>

            {showEspForm && (
              <Card title="Nueva Especialidad">
                <form onSubmit={handleAddEspecialidad} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre de Especialidad / Servicio</label>
                    <input type="text" className="form-control" placeholder="Ej: Pediatría, Cardiología, Dental" value={espNombre} onChange={e => setEspNombre(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio de Consulta Base ($)</label>
                    <input type="number" step="0.01" min="0" className="form-control" value={espPrecioBase} onChange={e => setEspPrecioBase(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "Registrando..." : "Guardar Especialidad"}
                  </button>
                </form>
              </Card>
            )}

            <Card title="Listado de Especialidades" subtitle="Precios base y catálogo activo">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {especialidades.map(esp => (
                  <div 
                    key={esp.id} 
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>{esp.nombre}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--secondary-light)', fontWeight: 600 }}>Precio Base: ${esp.precioBase.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--color-critico)', borderColor: 'var(--color-critico)', padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                      onClick={() => handleDeleteEspecialidad(esp.id)}
                      disabled={isPending}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}

                {especialidades.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--secondary-light)', padding: '1.5rem' }}>
                    No hay especialidades registradas.
                  </div>
                )}
              </div>
            </Card>
          </div>

        </div>

      </div>

    </div>
  );
}
