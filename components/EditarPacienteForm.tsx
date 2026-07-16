"use client";

import React, { useState, useTransition } from 'react';
import { updatePaciente } from '@/app/actions/pacientes';
import { useToast } from './ToastProvider';

interface Props {
  paciente: {
    id: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: Date;
    genero: string;
    tipoSangre: string | null;
    contacto: string | null;
    alergias: string | null;
    antecedentes: string | null;
  };
  onClose: () => void;
}

export default function EditarPacienteForm({ paciente, onClose }: Props) {
  const { toast: addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatDate = (d: Date) => {
    const date = new Date(d);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const handleSubmit = async (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updatePaciente(null, formData);
      if (res.success) {
        addToast(res.message || 'Paciente actualizado', 'success');
        onClose();
      } else {
        setErrorMsg(res.message || 'Error al actualizar');
        addToast(res.message || 'Error al actualizar', 'error');
      }
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '95%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: 'var(--secondary-color)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Editar Ficha del Paciente</h2>
            <p style={{ color: 'var(--secondary-light)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Actualice los datos personales y clínicos del paciente.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary-light)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-critico)', color: 'var(--color-critico)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            {errorMsg}
          </div>
        )}

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="pacienteId" value={paciente.id} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nombre</label>
              <input type="text" name="nombre" className="form-control" defaultValue={paciente.nombre} required />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Apellido</label>
              <input type="text" name="apellido" className="form-control" defaultValue={paciente.apellido} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha de Nacimiento</label>
              <input type="date" name="fechaNacimiento" className="form-control" defaultValue={formatDate(paciente.fechaNacimiento)} required />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Género</label>
              <select name="genero" className="form-control" defaultValue={paciente.genero} required>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Grupo Sanguíneo</label>
              <select name="tipoSangre" className="form-control" defaultValue={paciente.tipoSangre || ''}>
                <option value="">Sin clasificar</option>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Teléfono / Contacto</label>
              <input type="text" name="contacto" className="form-control" defaultValue={paciente.contacto || ''} placeholder="+51 999 999 999" />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Alergias</label>
            <textarea name="alergias" className="form-control" rows={2} defaultValue={paciente.alergias || ''} placeholder="Ej: Penicilina, Polen, Ninguna..." style={{ resize: 'vertical' }} />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Antecedentes Médicos</label>
            <textarea name="antecedentes" className="form-control" rows={3} defaultValue={paciente.antecedentes || ''} placeholder="Ej: Hipertensión, Diabetes tipo 2, Ninguno..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isPending}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Guardando...
                </span>
              ) : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
