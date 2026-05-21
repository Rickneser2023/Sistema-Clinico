"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import { mockPacientes } from '@/lib/mockData';

// Componente interno que usa useSearchParams
function NuevaHistoriaFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get('patientId');

  // Estados del Formulario
  const [selectedPatientId, setSelectedPatientId] = useState('new');
  
  // Datos del Paciente (Nuevos o Editados)
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('Masculino');
  const [tipoSangre, setTipoSangre] = useState('O+');
  const [alergias, setAlergias] = useState('');
  const [antecedentes, setAntecedentes] = useState('');

  // Signos Vitales
  const [presionArt, setPresionArt] = useState('');
  const [pulso, setPulso] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [peso, setPeso] = useState('');

  // Consulta Médica
  const [motivo, setMotivo] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [medico, setMedico] = useState('Dr. Esteban Peralta');

  // Cargar datos si se pasa un patientId por la URL
  useEffect(() => {
    if (patientIdParam) {
      const patient = mockPacientes.find(p => p.id.toString() === patientIdParam);
      if (patient) {
        setSelectedPatientId(patient.id.toString());
        setNombre(patient.nombre);
        setEdad(patient.edad.toString());
        setGenero(paciente.genero);
        setTipoSangre(paciente.tipoSangre);
        setAlergias(paciente.alergias);
        setAntecedentes(paciente.antecedentes);
      }
    }
  }, [patientIdParam]);

  // Cambiar entre paciente existente o registrar uno nuevo
  const handlePatientSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPatientId(val);
    
    if (val === 'new') {
      setNombre('');
      setEdad('');
      setGenero('Masculino');
      setTipoSangre('O+');
      setAlergias('');
      setAntecedentes('');
    } else {
      const patient = mockPacientes.find(p => p.id.toString() === val);
      if (patient) {
        setNombre(patient.nombre);
        setEdad(patient.edad.toString());
        setGenero(paciente.genero);
        setTipoSangre(paciente.tipoSangre);
        setAlergias(paciente.alergias);
        setAntecedentes(paciente.antecedentes);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simular el guardado de datos
    alert(`[Simulación] Historia Clínica Guardada Exitosamente.\n\nPaciente: ${nombre}\nDiagnóstico: ${diagnostico}\nMédico: ${medico}\n\nLos datos se enviaron simuladamente a Prisma y PostgreSQL.`);
    
    // Redirigir al listado de pacientes o al dashboard
    router.push('/pacientes');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* SECCIÓN 1: Selección o Datos Demográficos */}
      <Card title="Ficha del Paciente" subtitle="Selecciona un paciente existente o registra los datos de uno nuevo">
        
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="select-paciente" className="form-label">Paciente Registrado</label>
          <select 
            id="select-paciente"
            className="form-control"
            value={selectedPatientId}
            onChange={handlePatientSelectChange}
            style={{ fontWeight: 600, color: 'var(--primary-color)' }}
          >
            <option value="new">-- REGISTRAR NUEVO PACIENTE --</option>
            {mockPacientes.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} (ID: {p.id})</option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre-input" className="form-label">Nombre Completo <span>*</span></label>
            <input 
              id="nombre-input"
              type="text" 
              className="form-control" 
              placeholder="Ej. Juan Pérez Gómez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={selectedPatientId !== 'new'}
              required
            />
          </div>

          <div className="form-grid-3" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="edad-input" className="form-label">Edad <span>*</span></label>
              <input 
                id="edad-input"
                type="number" 
                className="form-control" 
                placeholder="Años"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                disabled={selectedPatientId !== 'new'}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="genero-select" className="form-label">Género <span>*</span></label>
              <select 
                id="genero-select"
                className="form-control"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                disabled={selectedPatientId !== 'new'}
                required
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sangre-select" className="form-label">Grupo Sanguíneo</label>
              <select 
                id="sangre-select"
                className="form-control"
                value={tipoSangre}
                onChange={(e) => setTipoSangre(e.target.value)}
                disabled={selectedPatientId !== 'new'}
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label htmlFor="alergias-textarea" className="form-label">Alergias Conocidas</label>
            <textarea 
              id="alergias-textarea"
              className="form-control" 
              placeholder="Ej. Alergia a la penicilina, aines, polen..."
              value={alergias}
              onChange={(e) => setAlergias(e.target.value)}
              disabled={selectedPatientId !== 'new'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="antecedentes-textarea" className="form-label">Antecedentes Médicos</label>
            <textarea 
              id="antecedentes-textarea"
              className="form-control" 
              placeholder="Ej. Hipertensión hereditaria, cirugías previas, asma..."
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              disabled={selectedPatientId !== 'new'}
            />
          </div>
        </div>
      </Card>

      {/* SECCIÓN 2: Signos Vitales */}
      <Card title="Examen Físico e Indicadores" subtitle="Registro de signos vitales actuales medidos en triaje/consulta">
        <div className="form-grid-4">
          <div className="form-group">
            <label htmlFor="presion-input" className="form-label">Presión Arterial</label>
            <input 
              id="presion-input"
              type="text" 
              className="form-control" 
              placeholder="Ej. 120/80 mmHg"
              value={presionArt}
              onChange={(e) => setPresionArt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pulso-input" className="form-label">Frecuencia Cardíaca (Pulso)</label>
            <input 
              id="pulso-input"
              type="number" 
              className="form-control" 
              placeholder="Ej. 72 lpm"
              value={pulso}
              onChange={(e) => setPulso(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="temp-input" className="form-label">Temperatura Corporal</label>
            <input 
              id="temp-input"
              type="number" 
              step="0.1" 
              className="form-control" 
              placeholder="Ej. 36.5 °C"
              value={temperatura}
              onChange={(e) => setTemperatura(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="peso-input" className="form-label">Peso Corporal</label>
            <input 
              id="peso-input"
              type="number" 
              step="0.1" 
              className="form-control" 
              placeholder="Ej. 75.4 kg"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* SECCIÓN 3: Detalles de la Consulta */}
      <Card title="Evolución y Diagnóstico" subtitle="Motivo de la consulta actual, diagnóstico médico y plan de tratamiento">
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="motivo-input" className="form-label">Motivo de Consulta <span>*</span></label>
          <input 
            id="motivo-input"
            type="text" 
            className="form-control" 
            placeholder="Ej. Dolor lumbar persistente / Control de tratamiento"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="sintomas-textarea" className="form-label">Anamnesis / Síntomas Descritos <span>*</span></label>
          <textarea 
            id="sintomas-textarea"
            className="form-control" 
            placeholder="Describa a detalle lo que el paciente relata y examen físico inicial..."
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            style={{ minHeight: '100px' }}
            required
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="diagnostico-textarea" className="form-label">Diagnóstico Clínico <span>*</span></label>
            <textarea 
              id="diagnostico-textarea"
              className="form-control" 
              placeholder="Diagnóstico de ingreso o definitivo..."
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              style={{ minHeight: '120px' }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tratamiento-textarea" className="form-label">Plan de Tratamiento / Receta <span>*</span></label>
            <textarea 
              id="tratamiento-textarea"
              className="form-control" 
              placeholder="Fármacos (dosis, intervalo, duración), exámenes solicitados, reposo..."
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              style={{ minHeight: '120px' }}
              required
            />
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="medico-select" className="form-label">Médico Tratante</label>
            <select 
              id="medico-select"
              className="form-control"
              value={medico}
              onChange={(e) => setMedico(e.target.value)}
            >
              <option value="Dr. Esteban Peralta">Dr. Esteban Peralta (Urgencias / Cirugía)</option>
              <option value="Dra. Sofía Mendoza">Dra. Sofía Mendoza (Cardiología)</option>
              <option value="Dr. Carlos Valdivia">Dr. Carlos Valdivia (Broncopulmonar)</option>
              <option value="Dr. Ricardo Bascuñán">Dr. Ricardo Bascuñán (Geriatría/Medicina General)</option>
              <option value="Dra. Carolina Ríos">Dra. Carolina Ríos (Pediatría)</option>
              <option value="Dr. Jaime Vergara">Dr. Jaime Vergara (Endocrinología)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Botones de Envío */}
      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => {
            if(confirm('¿Seguro que deseas cancelar el registro? Perderás los cambios no guardados.')) {
              router.push('/');
            }
          }}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ padding: '0.6rem 2rem' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Guardar Historia Clínica
        </button>
      </div>

    </form>
  );
}

// Wrapper principal que provee el Suspense para useSearchParams
export default function NewHistoryPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontWeight: 600, color: 'var(--secondary-light)' }}>Cargando formulario...</p>
      </div>
    }>
      <NuevaHistoriaFormContent />
    </Suspense>
  );
}
