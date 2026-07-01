"use client";

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { getAllUsers, getRolePermissions, updateRolePermission, actualizarEstadoUsuario, cambiarPassword, UserData } from '@/app/actions/usuarios';

const ALL_MODULES = [
  { key: 'dashboard', name: 'Dashboard General' },
  { key: 'ejecutivo', name: 'Dashboard Ejecutivo' },
  { key: 'atencion', name: 'Sala de Espera' },
  { key: 'agenda', name: 'Agenda Semanal' },
  { key: 'facturacion', name: 'Facturación y Caja' },
  { key: 'medicos', name: 'Médicos y Boxes' },
  { key: 'pacientes', name: 'Listado Pacientes' },
  { key: 'nueva-historia', name: 'Nueva Historia' },
  { key: 'reportes', name: 'Generador de Reportes' },
  { key: 'configuracion', name: 'Configuración' },
];

const ROLES = [
  { key: 'ADMIN', label: 'Administrador-Doctor', color: 'var(--primary-light)', textColor: 'var(--primary-color)' },
  { key: 'DOCTOR', label: 'Doctor', color: 'var(--accent-light)', textColor: 'var(--accent-color)' },
  { key: 'RECEPCIONISTA', label: 'Recepcionista', color: 'var(--bg-observacion)', textColor: 'var(--color-observacion)' },
];

export default function ConfiguracionPage() {
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser, loginUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [perms, setPerms] = useState<Record<string, string[]>>({});
  const [permLoading, setPermLoading] = useState<Record<string, boolean>>({});
  const [changingPass, setChangingPass] = useState<{ userId: string; nombre: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ userId: string; msg: string } | null>(null);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const loadPerms = async (rol: string) => {
    const modules = await getRolePermissions(rol);
    setPerms(prev => ({ ...prev, [rol]: modules }));
  };

  useEffect(() => {
    loadUsers();
    ROLES.forEach(r => loadPerms(r.key));
  }, []);

  const handleToggle = async (rol: string, moduleKey: string, currentActive: boolean) => {
    const key = `${rol}-${moduleKey}`;
    setPermLoading(prev => ({ ...prev, [key]: true }));
    setPerms(prev => ({
      ...prev,
      [rol]: currentActive
        ? (prev[rol] || []).filter(m => m !== moduleKey)
        : [...(prev[rol] || []), moduleKey]
    }));
    await updateRolePermission(rol, moduleKey, !currentActive);
    setPermLoading(prev => ({ ...prev, [key]: false }));
  };

  const handleToggleUserStatus = async (userId: string, currentActive: boolean) => {
    const result = await actualizarEstadoUsuario(userId, !currentActive);
    setStatusMsg({ userId, msg: result.success ? 'Estado actualizado' : result.message || 'Error' });
    loadUsers();
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const handleChangePassword = async () => {
    if (!changingPass || newPassword.length < 6) {
      setPassMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    const result = await cambiarPassword(changingPass.userId, newPassword);
    setPassMsg(result.success ? 'Contraseña actualizada correctamente' : result.message || 'Error');
    if (result.success) {
      setTimeout(() => { setChangingPass(null); setNewPassword(''); setPassMsg(''); }, 1500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Administración de usuarios y personalización del sistema</p>
        </div>
      </div>

      <div className="tab-headers" style={{ borderBottom: '2px solid var(--border-color)' }}>
        {[
          { id: 'usuarios', label: 'Usuarios y Permisos' },
          { id: 'apariencia', label: 'Apariencia' },
        ].map(t => (
          <button
            key={t.id}
            className={`tab-header ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'usuarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Usuario activo */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Usuario Activo</h3>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--primary-color)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1rem'
                }}>
                  {currentUser?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--secondary-color)' }}>{currentUser?.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                    {ROLES.find(r => r.key === currentUser?.rol)?.label || currentUser?.rol}
                  </div>
                </div>
              </div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Cambiar de usuario</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => loginUser(u as any)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${currentUser?.id === u.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      backgroundColor: currentUser?.id === u.id ? 'var(--primary-light)' : 'transparent',
                      color: 'var(--secondary-color)', fontWeight: 600, fontSize: '0.85rem',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {u.nombre}
                    <span style={{
                      display: 'block', fontSize: '0.7rem', fontWeight: 500,
                      color: currentUser?.id === u.id ? 'var(--primary-color)' : 'var(--secondary-light)',
                      marginTop: '2px'
                    }}>
                      {ROLES.find(r => r.key === u.rol)?.label || u.rol}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editar Permisos por Rol */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Permisos por Rol</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary-light)' }}>
                Activa o desactiva módulos para cada categoría
              </span>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              {ROLES.map(role => {
                const rolePerms = perms[role.key] || [];
                return (
                  <div key={role.key} style={{ borderBottom: '1px solid var(--border-color)', padding: '1.25rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '999px',
                        fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: role.color, color: role.textColor,
                      }}>{role.label}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--secondary-light)' }}>
                        {rolePerms.length}/{ALL_MODULES.length} módulos
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {ALL_MODULES.map(mod => {
                        const isActive = rolePerms.includes(mod.key);
                        const loadingKey = `${role.key}-${mod.key}`;
                        return (
                          <label key={mod.key} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer', transition: 'background var(--transition-fast)',
                            background: isActive ? 'var(--primary-light)' : 'transparent',
                          }}>
                            <div style={{ position: 'relative', width: 40, height: 22, flexShrink: 0 }}>
                              <input
                                type="checkbox"
                                checked={isActive}
                                disabled={permLoading[loadingKey]}
                                onChange={() => handleToggle(role.key, mod.key, isActive)}
                                style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                              />
                              <div style={{
                                width: 40, height: 22, borderRadius: 11,
                                background: isActive ? 'var(--primary-color)' : 'var(--border-color)',
                                transition: 'background 0.2s', position: 'relative',
                                opacity: permLoading[loadingKey] ? 0.5 : 1,
                              }}>
                                <div style={{
                                  position: 'absolute', top: 2, left: isActive ? 20 : 2,
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: 'white', transition: 'left 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                }} />
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                              color: isActive ? 'var(--primary-color)' : 'var(--secondary-color)',
                            }}>{mod.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gestión de Cuentas */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Gestión de Cuentas</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary-light)' }}>
                Administra el estado y contraseña de cada usuario
              </span>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              {users.map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)',
                  flexWrap: 'wrap', gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--secondary-color)' }}>{u.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-light)' }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {currentUser?.rol === 'ADMIN' && (
                      <>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, true)}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)',
                            border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            background: '#fee2e2', color: '#dc2626'
                          }}
                          title="Desactivar cuenta"
                        >
                          Desactivar
                        </button>
                        <button
                          onClick={() => setChangingPass({ userId: u.id, nombre: u.nombre })}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)', fontSize: '0.75rem',
                            fontWeight: 600, cursor: 'pointer',
                            background: 'transparent', color: 'var(--secondary-color)'
                          }}
                        >
                          Cambiar Contraseña
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {statusMsg && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-estable)', color: 'var(--color-estable)',
                  fontSize: '0.85rem', fontWeight: 500
                }}>
                  {statusMsg.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'apariencia' && (
        <AparienciaTab theme={theme} toggleTheme={toggleTheme} />
      )}

      {/* Modal cambiar contraseña */}
      {changingPass && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: 400, width: '100%', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--secondary-color)' }}>
              Cambiar contraseña — {changingPass.nombre}
            </h3>
            <input
              type="password"
              className="form-control"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoFocus
            />
            {passMsg && (
              <div style={{
                marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 500,
                color: passMsg.includes('correctamente') ? 'var(--color-estable)' : 'var(--color-critico)'
              }}>{passMsg}</div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setChangingPass(null); setNewPassword(''); setPassMsg(''); }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleChangePassword}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AparienciaTab({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Apariencia</h3>
      </div>
      <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--secondary-color)' }}>Modo Oscuro</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-light)' }}>
              Alternar entre tema claro y oscuro
            </div>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              width: '52px', height: '28px', borderRadius: '14px', border: 'none',
              cursor: 'pointer', position: 'relative',
              backgroundColor: theme === 'dark' ? 'var(--primary-color)' : 'var(--border-color)',
              transition: 'background-color 0.2s ease'
            }}
            aria-label="Alternar modo oscuro"
          >
            <span style={{
              position: 'absolute', top: '3px',
              left: theme === 'dark' ? '27px' : '3px',
              width: '22px', height: '22px', borderRadius: '50%',
              backgroundColor: 'white', transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}
