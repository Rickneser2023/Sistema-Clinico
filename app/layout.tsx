import './globals.css'
import DashboardLayout from '@/components/DashboardLayout'

export const metadata = {
  title: 'MediHist - Sistema de Gestión Clínica',
  description: 'Sistema de gestión de historias clínicas y dashboard médico profesional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  )
}
