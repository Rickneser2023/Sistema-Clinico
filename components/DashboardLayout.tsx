"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [loading, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  let title = "Dashboard General";
  let subtitle = "Resumen de actividad clínica y KPIs";

  if (pathname === '/pacientes') {
    title = "Listado de Pacientes";
    subtitle = "Gestión de pacientes registrados en el sistema";
  } else if (pathname.startsWith('/pacientes/')) {
    title = "Ficha e Historia Clínica";
    subtitle = "Evolución y antecedentes detallados del paciente";
  } else if (pathname === '/nueva-historia') {
    title = "Nueva Historia Clínica";
    subtitle = "Formulario de registro de consulta y examen médico";
  } else if (pathname === '/ejecutivo') {
    title = "Dashboard Ejecutivo (EIS)";
    subtitle = "KPIs estratégicos e indicadores financieros de la clínica";
  } else if (pathname === '/atencion') {
    title = "Sala de Espera (Kanban)";
    subtitle = "Flujo de atención y estado operativo de consultas";
  } else if (pathname === '/agenda') {
    title = "Agenda de Consultas";
    subtitle = "Calendario semanal de citas y disponibilidad médica";
  } else if (pathname === '/facturacion') {
    title = "Módulo de Facturación y Caja";
    subtitle = "Gestión de ingresos, facturación diaria y cuentas por cobrar";
  } else if (pathname === '/medicos') {
    title = "Médicos y Consultorios";
    subtitle = "Planificación del personal y estado de boxes de consulta";
  } else if (pathname === '/configuracion') {
    title = "Configuración";
    subtitle = "Personalización y administración del sistema";
  }

  return (
    <div className="app-wrapper">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="main-content">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          title={title}
          subtitle={subtitle}
        />
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
