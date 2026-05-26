import Link from 'next/link';
import Card from '@/components/Card';

export default function NotFound() {
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--color-critico)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--secondary-color)' }}>Paciente No Encontrado</h3>
        <p style={{ color: 'var(--secondary-light)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          El paciente que buscas no existe o ha sido eliminado del sistema.
        </p>
        <Link href="/pacientes" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
          Regresar al Listado
        </Link>
      </div>
    </Card>
  );
}
