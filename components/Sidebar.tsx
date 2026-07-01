"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { getRolePermissions } from '@/app/actions/usuarios';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_KEY_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/ejecutivo': 'ejecutivo',
  '/atencion': 'atencion',
  '/agenda': 'agenda',
  '/facturacion': 'facturacion',
  '/medicos': 'medicos',
  '/pacientes': 'pacientes',
  '/nueva-historia': 'nueva-historia',
  '/ejecutivo/reportes': 'reportes',
  '/configuracion': 'configuracion',
};

const MODULE_LABELS: Record<string, { icon: string; label: string }> = {
  dashboard: { icon: '📊', label: 'Dashboard General' },
  ejecutivo: { icon: '📈', label: 'Dashboard Ejecutivo' },
  atencion: { icon: '🩺', label: 'Sala de Espera' },
  agenda: { icon: '📅', label: 'Agenda Semanal' },
  facturacion: { icon: '💰', label: 'Facturación' },
  medicos: { icon: '👨‍⚕️', label: 'Médicos y Boxes' },
  pacientes: { icon: '👥', label: 'Pacientes' },
  nuevaHistoria: { icon: '📝', label: 'Nueva Historia' },
  reportes: { icon: '📄', label: 'Reportes' },
  configuracion: { icon: '⚙️', label: 'Configuración' },
};

const MENU_ITEMS: { path: string; moduleKey: string; moduleId: string }[] = [
  { path: '/', moduleKey: 'dashboard', moduleId: 'dashboard' },
  { path: '/ejecutivo', moduleKey: 'ejecutivo', moduleId: 'ejecutivo' },
  { path: '/atencion', moduleKey: 'atencion', moduleId: 'atencion' },
  { path: '/agenda', moduleKey: 'agenda', moduleId: 'agenda' },
  { path: '/facturacion', moduleKey: 'facturacion', moduleId: 'facturacion' },
  { path: '/medicos', moduleKey: 'medicos', moduleId: 'medicos' },
  { path: '/pacientes', moduleKey: 'pacientes', moduleId: 'pacientes' },
  { path: '/nueva-historia', moduleKey: 'nueva-historia', moduleId: 'nuevaHistoria' },
  { path: '/ejecutivo/reportes', moduleKey: 'reportes', moduleId: 'reportes' },
  { path: '/configuracion', moduleKey: 'configuracion', moduleId: 'configuracion' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [allowedModules, setAllowedModules] = useState<string[]>([]);

  useEffect(() => {
    if (user?.rol) {
      getRolePermissions(user.rol).then(setAllowedModules);
    }
  }, [user?.rol]);

  const userInitials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const filteredItems = MENU_ITEMS.filter(item => allowedModules.includes(item.moduleKey));

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="var(--primary-color)" />
              <path d="M20 8v24M8 20h24" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="6" stroke="white" strokeWidth="2.5" fill="none" />
            </svg>
            <span className="logo-text">MediHist</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            const mod = MODULE_LABELS[item.moduleId] || { icon: '📋', label: item.moduleKey };
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{mod.icon}</span>
                <span className="nav-label">{mod.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{userInitials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.nombre || 'Usuario'}</span>
              <span className="sidebar-user-role">{user?.rol || ''}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
