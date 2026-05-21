"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Obtener título y subtítulo dinámico según la ruta
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
