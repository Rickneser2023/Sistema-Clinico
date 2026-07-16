"use client";

import React, { useState, useTransition, useOptimistic, useEffect, useCallback } from 'react';
import Card from './Card';
import { createCita, updateEstadoCita, reprogramarCita } from '@/app/actions/agenda';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

type Cita = any; 
type Medico = any;
type Box = any;
type Paciente = any;

interface Props {
  citasIniciales: Cita[];
  medicos: Medico[];
  boxes: Box[];
  pacientes: Paciente[];
}

export default function AgendaCalendario({ citasIniciales, medicos, boxes, pacientes }: Props) {
  const { user } = useAuth();
  const { toast: addToast } = useToast();
  const [optimisticCitas, addOptimisticCita] = useOptimistic(
    citasIniciales,
    (state, newCita: Cita) => [...state, newCita]
  );
  
  const [isPending, startTransition] = useTransition();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [modalMode, setModalMode] = useState<'NONE' | 'NEW_CITA' | 'VIEW_CITA' | 'REPROGRAMAR_CITA'>('NONE');
  const [selectedSlot, setSelectedSlot] = useState<{ inicio: string } | null>(null);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedMetodoAdelanto, setSelectedMetodoAdelanto] = useState('');
  const [filterMedico, setFilterMedico] = useState('');
  const [filterBox, setFilterBox] = useState('');

  const filteredCitas = optimisticCitas.filter((c: Cita) => {
    if (filterMedico && c.medicoId !== filterMedico) return false;
    if (filterBox && c.boxId !== filterBox) return false;
    return true;
  });

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const allHours = filteredCitas.map((c: Cita) => new Date(c.fechaHoraInicio).getHours());
  const endHours = filteredCitas.map((c: Cita) => {
     const d = new Date(c.fechaHoraFin);
     return (d.getMinutes() > 0) ? d.getHours() : d.getHours() - 1;
  });
  
  const minHour = Math.max(0, Math.min(9, ...allHours, 9));
  const maxHour = Math.min(23, Math.max(17, ...endHours, 17));
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);

  const getTargetDateForDayIndex = (dayIndex: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay() || 7;
    const targetDay = dayIndex + 1;
    let diff = targetDay - currentDay;
    
    if (diff < 0) diff += 7;
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    return targetDate;
  };

  const toLocalISO = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleCellClick = (dayIndex: number, hour: number, minutes: number) => {
    const targetDate = getTargetDateForDayIndex(dayIndex);
    targetDate.setHours(hour, minutes, 0, 0);

    if (targetDate < new Date()) {
      alert("No se pueden agendar citas en horarios pasados.");
      setErrorMsg("No se pueden agendar citas en horarios pasados.");
      return;
    }

    setSelectedSlot({ inicio: toLocalISO(targetDate) });
    setErrorMsg(null);
    setModalMode('NEW_CITA');
  };

  const handleCitaClick = (e: React.MouseEvent, cita: Cita) => {
    e.stopPropagation();
    setSelectedCita(cita);
    setModalMode('VIEW_CITA');
    setErrorMsg(null);
  };

  const handleAction = async (formData: FormData) => {
    const localStart = new Date(formData.get('fechaHoraInicio') as string);

    if (localStart < new Date()) {
       alert("No se pueden agendar citas en horarios pasados.");
       setErrorMsg("No se pueden agendar citas en horarios pasados.");
       return;
    }

    formData.set('fechaHoraInicio', localStart.toISOString());

    if (user?.id) {
      formData.set('usuarioId', user.id);
    }

    startTransition(() => {
       addOptimisticCita({
         id: 'temp-id',
         fechaHoraInicio: localStart,
         fechaHoraFin: new Date(localStart.getTime() + 30 * 60 * 1000),
         estado: 'PROGRAMADA',
         paciente: { 
            nombre: isNewPatient ? formData.get('nuevoPacienteNombre') : 'Cargando...', 
            apellido: isNewPatient ? formData.get('nuevoPacienteApellido') : '' 
         },
         medico: { user: { nombre: 'Validando' } },
         box: { nombre: '...' }
       });
    });

    const res = await createCita({} as any, formData);
    
    if (!res.success) {
      setErrorMsg(res.message || 'Error desconocido al agendar');
      addToast(res.message || 'Error desconocido al agendar', 'error');
    } else {
      setModalMode('NONE');
      addToast(res.message || 'Cita agendada exitosamente', 'success');
    }
  };

  const getCitasForSlot = (dayIndex: number, hour: number, minutes: number) => {
     const targetDate = getTargetDateForDayIndex(dayIndex);
     
     const slotStart = new Date(targetDate);
     slotStart.setHours(hour, minutes, 0, 0);
     
     const slotEnd = new Date(targetDate);
     slotEnd.setHours(hour, minutes + 30, 0, 0);
     
     return filteredCitas.filter(c => {
        const citaStart = new Date(c.fechaHoraInicio);
        const citaEnd = new Date(c.fechaHoraFin);
        
        return citaStart < slotEnd && citaEnd > slotStart;
     });
  };

  const handleUpdateEstado = useCallback(async (citaId: string, nuevoEstado: string) => {
    startTransition(() => {});

    const res = await updateEstadoCita(citaId, nuevoEstado);
    if (res.success) setModalMode('NONE');
    else setErrorMsg(res.message || 'Error al actualizar');
  }, []);

  const getAdelantoLabel = (cita: Cita) => {
    const factura = cita.factura;
    if (!factura || Number(factura.montoAdelanto) <= 0) return null;

    const labels: Record<string, { text: string; bg: string; color: string }> = {
      VALIDADO: { text: 'Adelanto validado', bg: '#dcfce7', color: '#166534' },
      COMPROBANTE_ENVIADO: { text: 'Adelanto en revisión', bg: '#fef3c7', color: '#92400e' },
      PENDIENTE: { text: 'Adelanto pendiente', bg: '#fee2e2', color: '#991b1b' },
      RECHAZADO: { text: 'Adelanto rechazado', bg: '#fee2e2', color: '#991b1b' },
      NO_REQUIERE: { text: 'Sin adelanto', bg: '#e2e8f0', color: '#475569' },
    };

    return labels[factura.estadoAdelanto] || labels.PENDIENTE;
  };

  if (!mounted) {
    return (
      <Card title="Calendario Semanal" subtitle="Cargando agenda...">
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--secondary-light)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg style={{ animation: 'spin 1s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Sincronizando agenda clínica...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="agenda-container" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--secondary-color)' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', border: '2px solid var(--primary-color)' }}></span> Programada</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--secondary-color)' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-en-curso-bg)', border: '2px solid var(--color-en-curso-text)' }}></span> En Curso</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--secondary-color)' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fef3c7', border: '2px solid #92400e' }}></span> Pendiente Pago</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--secondary-color)' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-completada-bg)', border: '2px solid var(--color-completada-text)' }}></span> Completada</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--secondary-light)' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-cancelada-bg)', border: '2px solid var(--color-cancelada-text)' }}></span> Cancelada</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={filterMedico}
              onChange={(e) => setFilterMedico(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', backgroundColor: 'var(--bg-card)', color: 'var(--secondary-color)' }}
            >
              <option value="">Todos los medicos</option>
              {medicos.map((m: Medico) => (
                <option key={m.id} value={m.id}>Dr. {m.user?.nombre}</option>
              ))}
            </select>
            <select
              value={filterBox}
              onChange={(e) => setFilterBox(e.target.value)}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', backgroundColor: 'var(--bg-card)', color: 'var(--secondary-color)' }}
            >
              <option value="">Todos los boxes</option>
              {boxes.map((b: Box) => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={() => {
            const now = new Date();
            setSelectedSlot({ inicio: toLocalISO(now) });
            setModalMode('NEW_CITA');
            setErrorMsg(null);
          }}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agendar Cita Libre
        </button>
      </div>

      <Card title="Calendario Semanal" subtitle="Haz clic en un bloque de 30 minutos para agendar una cita al instante">
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${days.length}, minmax(150px, 1fr))`, gap: '1px', backgroundColor: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', minWidth: 'max-content' }}>
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px' }}></div>
          {days.map((d, dayIdx) => {
            const date = getTargetDateForDayIndex(dayIdx);
            const isToday = date.getTime() === new Date(new Date().setHours(0,0,0,0)).getTime();
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            return (
              <div key={d} style={{ 
                backgroundColor: isToday ? 'var(--primary-light)' : 'var(--bg-app)', 
                color: isToday ? 'var(--primary-color)' : 'inherit',
                padding: '10px', 
                textAlign: 'center', 
                fontWeight: 'bold', 
                borderBottom: '1px solid var(--border-color)',
                borderTop: isToday ? '3px solid var(--primary-color)' : 'none'
              }}>
                <div>{d}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.8 }}>{formattedDate}</div>
              </div>
            );
          })}

          {hours.map(h => (
            <React.Fragment key={h}>
              <div style={{ 
                backgroundColor: 'var(--bg-app)', 
                padding: '10px', 
                textAlign: 'right', 
                fontSize: '0.85rem', 
                color: 'var(--secondary-color)', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderBottom: '2px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)'
              }}>
                {h}:00
              </div>
              {days.map((_, dayIdx) => {
                const citas00 = getCitasForSlot(dayIdx, h, 0);
                const citas30 = getCitasForSlot(dayIdx, h, 30);
                
                const renderSubSlot = (citas: Cita[], mins: number) => (
                  <div 
                    style={{ 
                      flex: 1, 
                      minHeight: '45px', 
                      borderBottom: mins === 0 ? '1px dashed var(--border-color)' : 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-slot-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) handleCellClick(dayIdx, h, mins);
                    }}
                  >
                     {citas.map(c => {
                         let bgColor = 'var(--primary-light)';
                         let textColor = 'var(--primary-color)';
                         if (c.estado === 'EN_CURSO') { bgColor = 'var(--color-en-curso-bg)'; textColor = 'var(--color-en-curso-text)'; }
                         if (c.estado === 'PENDIENTE_PAGO') { bgColor = '#fef3c7'; textColor = '#92400e'; }
                         if (c.estado === 'COMPLETADA') { bgColor = 'var(--color-completada-bg)'; textColor = 'var(--color-completada-text)'; }
                         if (c.estado === 'CANCELADA') { bgColor = 'var(--color-cancelada-bg)'; textColor = 'var(--color-cancelada-text)'; }
                         const adelantoLabel = getAdelantoLabel(c);

                        return (
                          <div key={c.id} 
                            onClick={(e) => handleCitaClick(e, c)}
                            style={{ 
                              backgroundColor: bgColor, 
                              color: textColor, 
                              padding: '4px 6px', 
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              borderLeft: `3px solid ${textColor}`,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              position: 'relative'
                            }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.paciente?.nombre} {c.paciente?.apellido}</div>
                            <div style={{ opacity: 0.8, fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {c.medico?.user?.nombre} | Box: {c.box?.nombre}</div>
                            
                            {adelantoLabel && (
                              <div style={{ marginTop: '4px', padding: '2px 4px', backgroundColor: adelantoLabel.bg, color: adelantoLabel.color, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, display: 'inline-block' }}>
                                {adelantoLabel.text}
                              </div>
                            )}
                          </div>
                        );
                     })}
                  </div>
                );

                return (
                  <div 
                    key={dayIdx} 
                    style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderLeft: '1px solid var(--border-color)',
                      borderBottom: '2px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {renderSubSlot(citas00, 0)}
                    {renderSubSlot(citas30, 30)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        </div>
      </Card>

      {/* Modal: Nueva Cita */}
      {modalMode === 'NEW_CITA' && selectedSlot && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '95%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)', fontSize: '1.25rem', fontWeight: 700 }}>Agendar Nueva Cita</h2>
            <p style={{ color: 'var(--secondary-light)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Complete los datos para confirmar la asistencia del paciente.</p>
            
            {errorMsg && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-critico)', color: 'var(--color-critico)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errorMsg}
              </div>
            )}

            <form action={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {user?.id && <input type="hidden" name="usuarioId" value={user.id} />}

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hora de la Cita</label>
                <input type="datetime-local" name="fechaHoraInicio" className="form-control" defaultValue={selectedSlot.inicio} required />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {isNewPatient ? 'Datos del Nuevo Paciente' : 'Paciente Existente'}
                  </label>
                  <span 
                    style={{ fontSize: '0.75rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => setIsNewPatient(!isNewPatient)}
                  >
                    {isNewPatient ? '← Elegir existente' : '+ Crear Paciente Rápido'}
                  </span>
                </div>

                {!isNewPatient ? (
                  <select name="pacienteId" className="form-control" required defaultValue="" style={{ marginTop: '0.25rem' }}>
                    <option value="" disabled>Buscar y Seleccionar Paciente...</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                  </select>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <input type="hidden" name="pacienteId" value="new" />
                    <input type="text" name="nuevoPacienteNombre" className="form-control" placeholder="Nombre" required />
                    <input type="text" name="nuevoPacienteApellido" className="form-control" placeholder="Apellido" required />
                    <input type="date" name="nuevoPacienteFechaNac" className="form-control" required />
                    <select name="nuevoPacienteGenero" className="form-control" required defaultValue="">
                      <option value="" disabled>Género...</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Médico Designado</label>
                  <select name="medicoId" className="form-control" required defaultValue="">
                    <option value="" disabled>Seleccionar Médico...</option>
                    {medicos.map(m => <option key={m.id} value={m.id}>Dr. {m.user.nombre}</option>)}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Consultorio (Box)</label>
                  <select name="boxId" className="form-control" required defaultValue="">
                    <option value="" disabled>Asignar Box...</option>
                    {boxes.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Adelanto a Cobrar (PEN) <span style={{ color: 'var(--secondary-light)', fontWeight: 'normal' }}>(Opcional)</span></label>
                <input type="number" name="montoAdelanto" className="form-control" placeholder="Ej. 10000" min="0" defaultValue="0" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Método de Adelanto</label>
                  <select name="metodoAdelanto" className="form-control" defaultValue="" onChange={(e) => setSelectedMetodoAdelanto(e.target.value)}>
                    <option value="">Sin adelanto</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                  </select>
                </div>
                {selectedMetodoAdelanto && selectedMetodoAdelanto !== 'EFECTIVO' && (
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Comprobante</label>
                  <input type="file" name="comprobanteAdelanto" className="form-control" accept="image/png,image/jpeg,image/webp,application/pdf" required />
                </div>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Observación de Pago</label>
                <input type="text" name="observacionPago" className="form-control" placeholder="Ej. Operación 123456, pendiente de validar..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalMode('NONE')}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Validando...
                    </span>
                  ) : 'Confirmar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Cita */}
      {modalMode === 'VIEW_CITA' && selectedCita && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '95%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--secondary-color)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Detalles de la Cita</h2>
                <span style={{ 
                  display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem',
                  backgroundColor: selectedCita.estado === 'PROGRAMADA' ? 'var(--primary-light)' : selectedCita.estado === 'EN_CURSO' ? 'var(--color-en-curso-bg)' : selectedCita.estado === 'PENDIENTE_PAGO' ? '#fef3c7' : selectedCita.estado === 'COMPLETADA' ? 'var(--color-completada-bg)' : 'var(--color-cancelada-bg)',
                  color: selectedCita.estado === 'PROGRAMADA' ? 'var(--primary-color)' : selectedCita.estado === 'EN_CURSO' ? 'var(--color-en-curso-text)' : selectedCita.estado === 'PENDIENTE_PAGO' ? '#92400e' : selectedCita.estado === 'COMPLETADA' ? 'var(--color-completada-text)' : 'var(--color-cancelada-text)'
                }}>
                  {selectedCita.estado}
                </span>
              </div>
              <button onClick={() => setModalMode('NONE')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-light)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-critico)', color: 'var(--color-critico)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--secondary-color)', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--secondary-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paciente</strong>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedCita.paciente?.nombre} {selectedCita.paciente?.apellido}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--secondary-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Médico</strong>
                  <div>Dr. {selectedCita.medico?.user?.nombre}</div>
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--secondary-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Box</strong>
                  <div>{selectedCita.box?.nombre}</div>
                </div>
              </div>
              
              <div>
                <strong style={{ display: 'block', color: 'var(--secondary-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horario Programado</strong>
                <div>{new Date(selectedCita.fechaHoraInicio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedCita.fechaHoraFin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>

              {selectedCita.factura && (
                <div>
                  <strong style={{ display: 'block', color: 'var(--secondary-light)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pago</strong>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-app)', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                    Adelanto: S/ {Number(selectedCita.factura.montoAdelanto || 0).toFixed(2)} · Estado: {selectedCita.factura.estadoAdelanto}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              {selectedCita.estado !== 'CANCELADA' && (
                <button 
                  onClick={() => handleUpdateEstado(selectedCita.id, 'CANCELADA')}
                  className="btn btn-danger btn-sm"
                  disabled={isPending}
                >
                  Cancelar Cita
                </button>
              )}
              {selectedCita.estado === 'PROGRAMADA' && new Date(selectedCita.fechaHoraInicio) < new Date() && (
                <button 
                  onClick={() => setModalMode('REPROGRAMAR_CITA')}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #d97706', color: '#d97706', backgroundColor: '#fef3c7', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Reprogramar Cita Vencida
                </button>
              )}
              {selectedCita.estado === 'PROGRAMADA' && (
                <button 
                  onClick={() => handleUpdateEstado(selectedCita.id, 'EN_CURSO')}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--color-en-curso-text)', color: 'var(--color-en-curso-text)', backgroundColor: 'var(--color-en-curso-bg)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                  disabled={isPending}
                >
                  Marcar En Curso
                </button>
              )}
              {(selectedCita.estado === 'PROGRAMADA' || selectedCita.estado === 'EN_CURSO') && (
                <button 
                  onClick={() => handleUpdateEstado(selectedCita.id, 'COMPLETADA')}
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: 'white', backgroundColor: 'var(--color-completada-text)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)' }}
                  disabled={isPending}
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reprogramar Cita */}
      {modalMode === 'REPROGRAMAR_CITA' && selectedCita && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '95%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--secondary-color)', fontSize: '1.25rem', fontWeight: 700 }}>Reprogramar Cita</h2>
            <p style={{ color: 'var(--secondary-light)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Seleccione el nuevo horario para la cita de {selectedCita.paciente?.nombre} {selectedCita.paciente?.apellido}.</p>
            
            {errorMsg && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-critico)', color: 'var(--color-critico)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errorMsg}
              </div>
            )}

            <form action={async (formData: FormData) => {
              const localStart = new Date(formData.get('nuevaFechaHoraInicio') as string);
              const localEnd = new Date(localStart.getTime() + 30 * 60 * 1000);
              
              if (localStart < new Date()) {
                setErrorMsg("No se pueden agendar citas en horarios pasados.");
                return;
              }

              const res = await reprogramarCita(selectedCita.id, localStart.toISOString(), localEnd.toISOString());
              if (!res.success) {
                setErrorMsg(res.message || 'Error desconocido al reprogramar');
                addToast(res.message || 'Error desconocido al reprogramar', 'error');
              } else {
                setModalMode('NONE');
                addToast(res.message || 'Cita reprogramada exitosamente', 'success');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nueva Hora de la Cita</label>
                <input type="datetime-local" name="nuevaFechaHoraInicio" className="form-control" required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalMode('VIEW_CITA')}>Volver</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Validando...' : 'Confirmar Nuevo Horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
